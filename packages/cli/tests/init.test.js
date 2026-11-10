import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { rename } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { create } from "tar";
import { cleanup } from "../../../scripts/cleanup.mjs";
import { applyFiles } from "../dist/init/transaction.js";
import { fakePnpm } from "./helpers/fake-pnpm.js";
import { parseOutput } from "./helpers/output.js";

const binary = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const { version: uiVersion } = JSON.parse(
	readFileSync(new URL("../../ui/package.json", import.meta.url), "utf8")
);
const manifest = {
	name: "@mizen-labs/ui",
	peerDependencies: {
		pele: "^1.13.0",
		react: "^19.2.8",
		"react-dom": "^19.2.8",
	},
	version: uiVersion,
};
const nextRoot = `// Keep my document notes.\nimport "./globals.css";\nexport default function Root({children}) { return <html lang="en"><body><AppProviders>{children}</AppProviders></body></html>; }\n`;
const startRoot = `import {createRootRoute, HeadContent, Scripts} from "@tanstack/react-router";
import appCss from "../styles.css?url";
export const Route = createRootRoute({head:()=>({meta:[{title:"Keep this title"}],links:[{href:appCss,rel:"stylesheet"}]}),shellComponent:RootDocument});
function RootDocument({children}) {return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;}`;

function put(root, path, value) {
	const file = join(root, path);
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(
		file,
		typeof value === "string" ? value : JSON.stringify(value, null, 2)
	);
}

function fixture(t, framework = "next") {
	const root = mkdtempSync(join(tmpdir(), "mizen-init-"));
	t.after(() => cleanup(root));
	const dependency = framework === "next" ? "next" : "@tanstack/react-start";
	put(root, "package.json", {
		dependencies: { [dependency]: "1.0.0", "@mizen-labs/ui": uiVersion },
		private: true,
	});
	put(root, "pnpm-lock.yaml", "keep-lockfile");
	put(root, "node_modules/@mizen-labs/ui/package.json", manifest);
	put(root, `node_modules/${dependency}/package.json`, {
		name: dependency,
		version: "1.0.0",
	});
	for (const name of ["react", "react-dom"]) {
		put(root, `node_modules/${name}/package.json`, { name, version: "19.3.0" });
	}
	if (framework === "next") {
		put(
			root,
			"next.config.mjs",
			"// keep config comment\nexport default {reactStrictMode:true, /* Keep plugin options. */};\n"
		);
		put(root, "app/layout.tsx", nextRoot);
	} else {
		put(
			root,
			"vite.config.ts",
			`import {defineConfig} from "vite"; export default defineConfig({plugins:[],ssr:{external:["keep-me"]}});`
		);
		put(root, "src/routes/__root.tsx", startRoot);
	}
	return root;
}

function run(root, args = [], env = process.env) {
	const result = spawnSync(
		process.execPath,
		[binary, "init", "--cwd", root, "--json", ...args],
		{ encoding: "utf8", env, killSignal: "SIGKILL", timeout: 30_000 }
	);
	// A result prints on stdout; an error prints on stderr, never both.
	assert.ok(!(result.stdout && result.stderr), result.stderr);
	return {
		exit: result.status,
		...parseOutput(result.stdout || result.stderr),
	};
}

const sourcePath = (framework) =>
	framework === "next" ? "app/layout.tsx" : "src/routes/__root.tsx";

test("dry runs are exact, deterministic, and non-mutating; --yes is required", (t) => {
	const root = fixture(t);
	const before = readFileSync(join(root, "app/layout.tsx"), "utf8");
	const files = readdirSync(root).sort();
	const first = run(root, ["--dry-run"]);
	const second = run(root);
	assert.equal(first.exit, 0, JSON.stringify(first));
	assert.equal(first.data.status, "planned");
	assert.deepEqual(first.data.plan, second.data.plan);
	assert.ok(first.data.plan.edits.every((edit) => edit.diff.includes("@@")));
	assert.equal(readFileSync(join(root, "app/layout.tsx"), "utf8"), before);
	assert.deepEqual(readdirSync(root).sort(), files);
});

test("Next and Start setup preserves caller content and reruns without changes", (t) => {
	for (const framework of ["next", "start"]) {
		const root = fixture(t, framework);
		const before = readFileSync(join(root, "package.json"), "utf8");
		const preview = run(root, ["--dry-run"]);
		assert.equal(preview.exit, 0, JSON.stringify(preview));
		const applied = run(root, ["--yes"]);
		assert.equal(applied.exit, 0, JSON.stringify(applied));
		assert.equal(applied.data.status, "applied");
		assert.equal(applied.data.verification.status, "healthy");
		for (const edit of preview.data.plan.edits) {
			assert.equal(readFileSync(join(root, edit.path), "utf8"), edit.after);
		}
		const source = readFileSync(join(root, sourcePath(framework)), "utf8");
		assert.ok(
			source.includes(
				framework === "next" ? "<AppProviders>" : 'title:"Keep this title"'
			)
		);
		assert.equal(readFileSync(join(root, "package.json"), "utf8"), before);
		assert.equal(existsSync(join(root, ".mizen-init-journal.json")), false);
		const again = run(root, ["--yes"]);
		assert.equal(again.exit, 0, JSON.stringify(again));
		assert.equal(again.data.status, "unchanged");
		assert.deepEqual(again.data.plan.edits, []);
	}
});

test("source directives, comments, existing themes, and unrelated config survive", (t) => {
	const root = fixture(t);
	put(root, "app/layout.tsx", `"use client";\n${nextRoot}`);
	let result = run(root, ["--yes"]);
	assert.equal(result.exit, 0, JSON.stringify(result));
	assert.ok(
		readFileSync(join(root, "app/layout.tsx"), "utf8").startsWith(
			'"use client";'
		)
	);
	assert.ok(
		readFileSync(join(root, "next.config.mjs"), "utf8").includes(
			"Keep plugin options."
		)
	);
	assert.ok(
		readFileSync(join(root, "app/layout.tsx"), "utf8").includes(
			"Keep my document notes."
		)
	);
	result = run(root, ["--yes"]);
	assert.equal(result.data.status, "unchanged");
});

test("computed configuration and partial theme conflicts stop before any changes", (t) => {
	const root = fixture(t);
	put(root, "next.config.mjs", "export default withPlugins({});");
	const before = readFileSync(join(root, "app/layout.tsx"), "utf8");
	let result = run(root, ["--yes"]);
	assert.equal(result.exit, 1, JSON.stringify(result));
	assert.equal(result.error.reason, "conflict");
	assert.equal(readFileSync(join(root, "app/layout.tsx"), "utf8"), before);
	put(root, "next.config.mjs", "export default {};");
	put(
		root,
		"app/layout.tsx",
		nextRoot.replace('lang="en"', "suppressHydrationWarning={false}")
	);
	result = run(root, ["--yes"]);
	assert.equal(result.exit, 1);
	assert.equal(existsSync(join(root, ".mizen-init-journal.json")), false);
});

test("mixed lockfiles and existing recovery journals block mutation", (t) => {
	const root = fixture(t);
	put(root, "package-lock.json", {});
	assert.equal(run(root, ["--yes"]).exit, 1);
	rmSync(join(root, "package-lock.json"));
	put(root, ".mizen-init-journal.json", { interrupted: true });
	const result = run(root, ["--yes"]);
	assert.equal(result.exit, 1);
	assert.ok(result.error.message.includes("interrupted"));
});

test("missing Next configuration is created without replacing the layout", (t) => {
	const root = fixture(t);
	rmSync(join(root, "next.config.mjs"));
	const result = run(root, ["--yes"]);
	assert.equal(result.exit, 0, JSON.stringify(result));
	assert.ok(
		readFileSync(join(root, "next.config.mjs"), "utf8").includes(
			"transpilePackages"
		)
	);
});

test("optional peers are installed only when selected; failed installs leave sources intact", (t) => {
	const root = fixture(t);
	assert.equal(run(root, ["--dry-run"]).data.plan.install, null);
	const plan = run(root, ["--feature", "diagram", "--dry-run"]);
	assert.deepEqual(plan.data.plan.install.packages, ["pele@^1.13.0"]);
	const env = fakePnpm(root, "process.exitCode=1;");
	const before = readFileSync(join(root, "app/layout.tsx"), "utf8");
	const result = run(root, ["--feature", "diagram", "--yes"], env);
	assert.equal(result.exit, 1, JSON.stringify(result));
	assert.equal(result.data.status, "install-failed");
	assert.equal(readFileSync(join(root, "app/layout.tsx"), "utf8"), before);
	assert.equal(existsSync(join(root, ".mizen-init-journal.json")), false);
});

test("archives must match package name and catalog version before installation", async (t) => {
	const root = fixture(t);
	put(root, "package/package.json", {
		name: "wrong-package",
		version: uiVersion,
	});
	const archive = join(root, "wrong.tgz");
	await create({ cwd: root, file: archive, gzip: true }, ["package"]);
	const result = run(root, ["--package", archive, "--dry-run"]);
	assert.equal(result.exit, 1, JSON.stringify(result));
	assert.equal(result.error.reason, "conflict");
});

test("a missing or undeclared UI package names the npm version to install", (t) => {
	const missing = fixture(t);
	rmSync(join(missing, "node_modules/@mizen-labs"), { recursive: true });
	const undeclared = fixture(t);
	put(undeclared, "package.json", {
		dependencies: { next: "1.0.0" },
		private: true,
	});
	for (const root of [missing, undeclared]) {
		const { error, exit } = run(root, ["--dry-run"]);
		assert.equal(exit, 1, JSON.stringify(error));
		assert.equal(error.reason, "conflict");
		assert.ok(error.message.includes(`@mizen-labs/ui@${uiVersion}`));
		assert.ok(!error.message.includes("unpublished"), error.message);
	}
	const { usage } = run(missing, ["--help"]).data;
	assert.ok(!usage.includes("published"), usage);
});

test("file transactions roll back prior replacements after a later commit fails", async (t) => {
	const root = fixture(t);
	put(root, "one.txt", "one");
	put(root, "two.txt", "two");
	const edits = [
		{ after: "changed", before: "one", diff: "", path: "one.txt" },
		{ after: "changed", before: "two", diff: "", path: "two.txt" },
	];
	await assert.rejects(
		applyFiles(root, edits, async (from, to) => {
			if (to.endsWith("two.txt")) {
				throw new Error("Injected commit failure");
			}
			await rename(from, to);
		})
	);
	assert.equal(readFileSync(join(root, "one.txt"), "utf8"), "one");
	assert.equal(readFileSync(join(root, "two.txt"), "utf8"), "two");
	assert.ok(!readdirSync(root).some((name) => name.includes(".mizen-")));
});

test("transactions refuse concurrent source changes instead of overwriting them", async (t) => {
	const root = fixture(t);
	put(root, "one.txt", "caller changed");
	await assert.rejects(
		applyFiles(root, [
			{ after: "new", before: "old", diff: "", path: "one.txt" },
		])
	);
	assert.equal(readFileSync(join(root, "one.txt"), "utf8"), "caller changed");
});

test("--dry-run takes precedence over --yes, and malformed sources remain untouched", (t) => {
	const root = fixture(t);
	const before = readFileSync(join(root, "app/layout.tsx"), "utf8");
	assert.equal(run(root, ["--yes", "--dry-run"]).data.status, "planned");
	assert.equal(readFileSync(join(root, "app/layout.tsx"), "utf8"), before);
	put(root, "app/layout.tsx", "export default function Broken(");
	const result = run(root, ["--yes"]);
	assert.equal(result.exit, 1, JSON.stringify(result));
	assert.equal(existsSync(join(root, ".mizen-init-journal.json")), false);
});

test("existing alias providers are reused, while namespace and shadowed bindings need review", (t) => {
	const root = fixture(t);
	const aliased =
		`import {ThemeProvider as ExistingProvider,ThemeScript as ExistingScript} from "@mizen-labs/ui/theme";\n` +
		nextRoot
			.replace(
				"<body>",
				"<head><ExistingScript /></head><body><ExistingProvider>"
			)
			.replace("</body>", "</ExistingProvider></body>");
	put(root, "app/layout.tsx", aliased);
	const result = run(root, ["--yes"]);
	assert.equal(result.exit, 0, JSON.stringify(result));
	const after = readFileSync(join(root, "app/layout.tsx"), "utf8");
	assert.equal(after.includes("MizenThemeProvider"), false);
	put(
		root,
		"app/layout.tsx",
		`import * as Mizen from "@mizen-labs/ui/theme";\n${nextRoot}`
	);
	assert.equal(run(root, ["--yes"]).exit, 1);
	put(
		root,
		"app/layout.tsx",
		aliased.replace("{children}", "{children,ExistingProvider}")
	);
	assert.equal(run(root, ["--yes"]).exit, 1);
});

test("a valid true hydration expression and Vite noExternal true are preserved", (t) => {
	const root = fixture(t, "start");
	put(
		root,
		"vite.config.ts",
		`import {defineConfig} from "vite";export default defineConfig({ssr:{noExternal:true}});`
	);
	put(
		root,
		"src/routes/__root.tsx",
		startRoot.replace('lang="en"', 'lang="en" suppressHydrationWarning={true}')
	);
	const result = run(root, ["--yes"]);
	assert.equal(result.exit, 0, JSON.stringify(result));
	assert.ok(
		readFileSync(join(root, "vite.config.ts"), "utf8").includes(
			"noExternal:true"
		)
	);
});

test("rollback refuses to discard an edit made after the first commit", async (t) => {
	const root = fixture(t);
	put(root, "one.txt", "one");
	put(root, "two.txt", "two");
	const edits = [
		{ after: "generated", before: "one", diff: "", path: "one.txt" },
		{ after: "generated", before: "two", diff: "", path: "two.txt" },
	];
	await assert.rejects(
		applyFiles(root, edits, async (from, to) => {
			if (to.endsWith("two.txt")) {
				writeFileSync(join(root, "one.txt"), "new caller edit");
				throw new Error("Stop commit");
			}
			await rename(from, to);
		})
	);
	assert.equal(readFileSync(join(root, "one.txt"), "utf8"), "new caller edit");
	assert.equal(readFileSync(join(root, "two.txt"), "utf8"), "two");
});

test("an empty body receives an explicit empty provider child without overlapping edits", (t) => {
	const root = fixture(t);
	put(
		root,
		"app/layout.tsx",
		nextRoot.replace("<AppProviders>{children}</AppProviders>", "")
	);
	const result = run(root, ["--yes"]);
	assert.equal(result.exit, 0, JSON.stringify(result));
	assert.ok(
		readFileSync(join(root, "app/layout.tsx"), "utf8").includes("{null}")
	);
	assert.equal(run(root, ["--yes"]).data.status, "unchanged");
});

test("new imports retain CRLF source line endings", (t) => {
	const root = fixture(t);
	put(root, "app/layout.tsx", nextRoot.replaceAll("\n", "\r\n"));
	const result = run(root, ["--yes"]);
	assert.equal(result.exit, 0, JSON.stringify(result));
	const after = readFileSync(join(root, "app/layout.tsx"), "utf8");
	assert.equal(after.replaceAll("\r\n", "").includes("\n"), false);
});

test("failed verification shows diagnostic paths and repairs in human output", (t) => {
	const root = fixture(t);
	put(root, "node_modules/@mizen-labs/ui/node_modules/react/package.json", {
		name: "react",
		version: "19.3.0",
	});
	const before = readFileSync(join(root, "app/layout.tsx"), "utf8");
	const json = run(root, ["--yes"]);
	assert.equal(json.exit, 1);
	assert.equal(json.data.status, "verification-failed");
	const result = spawnSync(
		process.execPath,
		[binary, "init", "--cwd", root, "--yes"],
		{ encoding: "utf8", killSignal: "SIGKILL", timeout: 30_000 }
	);
	assert.equal(result.status, 1, result.stderr);
	assert.ok(result.stderr.includes("mizen doctor --cwd "));
	assert.ok(result.stdout.includes("identity.react"));
	// Evidence inside the app reads relative to it.
	assert.ok(
		result.stdout.includes(
			join(
				"node_modules",
				"@mizen-labs",
				"ui",
				"node_modules",
				"react",
				"package.json"
			)
		)
	);
	assert.ok(
		result.stdout.includes("Next step       Align workspace dependencies")
	);
	assert.equal(readFileSync(join(root, "app/layout.tsx"), "utf8"), before);
});

test("target and manager conflicts include file evidence and recovery steps", (t) => {
	const root = fixture(t);
	put(root, "package-lock.json", "{}");
	const manager = run(root);
	assert.equal(manager.exit, 1);
	const managerEvidence = manager.error.data.diagnostic.evidence;
	// Evidence holds resolved paths, so compare file names.
	for (const file of ["pnpm-lock.yaml", "package-lock.json"]) {
		assert.ok(managerEvidence.some((path) => basename(path) === file));
	}
	assert.ok(manager.error.data.diagnostic.repair);
	put(root, "package.json", "{ broken");
	const target = run(root);
	assert.equal(target.exit, 1);
	assert.ok(
		target.error.data.diagnostic.evidence.some(
			(path) => basename(path) === "package.json"
		)
	);
	assert.ok(
		target.error.data.diagnostic.repair.startsWith("Repair package.json")
	);
});
