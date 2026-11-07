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
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { versionCheck } from "../dist/doctor/packages.js";
import { parseOutput } from "./helpers/output.js";

const binary = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const layout = `import "@mizen-labs/ui/styles.css";
import { ThemeProvider as Provider, ThemeScript as Script } from "@mizen-labs/ui/theme";
export default function Root({children}) { return <html><head><Script /></head><body><Provider>{children}</Provider></body></html>; }`;

function put(root, path, value) {
	const file = join(root, path);
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(
		file,
		typeof value === "string" ? value : JSON.stringify(value)
	);
}

function fixture(t, framework = "next") {
	const root = mkdtempSync(join(tmpdir(), "mizen-doctor-"));
	t.after(() => rmSync(root, { force: true, recursive: true }));
	put(root, "package.json", {
		dependencies: {
			[framework === "next" ? "next" : "@tanstack/react-start"]: "1.0.0",
		},
		private: true,
	});
	put(root, "pnpm-lock.yaml", "DO_NOT_DISCLOSE_LOCKFILE_CONTENTS");
	const frameworkPackage =
		framework === "next" ? "next" : "@tanstack/react-start";
	put(root, `node_modules/${frameworkPackage}/package.json`, {
		name: frameworkPackage,
		version: "16.3.8",
	});
	put(root, "node_modules/@mizen-labs/ui/package.json", {
		name: "@mizen-labs/ui",
		peerDependencies: { react: "^19.2.8", "react-dom": "^19.2.8" },
		version: "0.1.0",
	});
	for (const name of ["react", "react-dom"]) {
		put(root, `node_modules/${name}/package.json`, { name, version: "19.3.0" });
	}
	if (framework === "next") {
		put(
			root,
			"next.config.mjs",
			`export default {transpilePackages:["@mizen-labs/ui"]};`
		);
		put(root, "app/layout.tsx", layout);
	} else {
		put(
			root,
			"vite.config.ts",
			`import { defineConfig } from "vite"; export default defineConfig({ssr:{noExternal:["@mizen-labs/ui"]}});`
		);
		put(
			root,
			"src/routes/__root.tsx",
			layout
				.replace(
					'import "@mizen-labs/ui/styles.css";',
					'import css from "@mizen-labs/ui/styles.css?url";\nimport {createRootRoute} from "@tanstack/react-router";\nexport const Route=createRootRoute({shellComponent:Root,head:()=>({links:[{href:css,rel:"stylesheet"}]})});'
				)
				.replace("export default function Root", "function Root")
		);
	}
	return root;
}

function run(root, args = []) {
	const output = spawnSync(
		process.execPath,
		[binary, "doctor", "--cwd", root, "--json", ...args],
		{ encoding: "utf8" }
	);
	assert.equal(output.stderr, "");
	const response = parseOutput(output.stdout);
	assert.equal(response.schemaVersion, 1);
	assert.equal(response.command, "doctor", output.stdout);
	return { ...response.data, exit: output.status, raw: output.stdout };
}

const diagnostic = (result, id) =>
	result.diagnostics.find((item) => item.id === id);

test("conventional Next and Start setup declarations pass, including aliases and URL links", (t) => {
	for (const framework of ["next", "start"]) {
		const root = fixture(t, framework);
		const result = run(root, ["--strict"]);
		assert.equal(result.exit, 0, result.raw);
		assert.equal(result.status, "healthy");
		assert.equal(result.framework, framework);
		assert.equal(result.uiVersion, "0.1.0");
		assert.ok(!result.raw.includes("DO_NOT_DISCLOSE_LOCKFILE_CONTENTS"));
	}
});

test("missing installation, incompatible peers, and duplicate React produce confirmed errors", (t) => {
	const root = fixture(t);
	put(root, "node_modules/react/package.json", {
		name: "react",
		version: "18.3.1",
	});
	put(root, "node_modules/@mizen-labs/ui/node_modules/react/package.json", {
		name: "react",
		version: "19.3.0",
	});
	let result = run(root);
	assert.equal(result.exit, 1);
	assert.equal(diagnostic(result, "package.react").status, "error");
	assert.equal(diagnostic(result, "identity.react").status, "error");
	rmSync(join(root, "node_modules/@mizen-labs/ui"), { recursive: true });
	result = run(root);
	assert.equal(diagnostic(result, "package.mizen").status, "error");
});

test("Node and React range checks honor exact versions, unions, and prereleases", () => {
	assert.equal(
		versionCheck("test", "22.23.2", ">=22.18 <23 || >=24.11", []).status,
		"pass"
	);
	assert.equal(
		versionCheck("test", "23.1.0", ">=22.18 <23 || >=24.11", []).status,
		"error"
	);
	assert.equal(
		versionCheck("test", "19.3.0-canary.1", "^19.2.8", []).status,
		"error"
	);
	assert.equal(versionCheck("test", "19.2.7", "^19.2.8", []).status, "error");
	assert.equal(
		versionCheck("test", "19.3.0", "not-a-range", []).status,
		"unverified"
	);
});

test("comments, strings, unlinked CSS URLs, and delegated theme setup never count as verified", (t) => {
	const root = fixture(t);
	put(
		root,
		"app/layout.tsx",
		`// import "@mizen-labs/ui/styles.css"; <ThemeScript /> <ThemeProvider />
import css from "@mizen-labs/ui/styles.css?url";
const example = '<head><ThemeScript /></head>'; export default function Root() { return <html><body /></html>; }`
	);
	const result = run(root);
	assert.equal(result.exit, 0);
	assert.equal(result.status, "incomplete");
	assert.equal(diagnostic(result, "setup.stylesheet").status, "unverified");
	assert.equal(diagnostic(result, "setup.theme").status, "unverified");
	assert.equal(run(root, ["--strict"]).exit, 1);
});

test("computed, spread, mutated, and broken configurations remain unverified and never execute", (t) => {
	const root = fixture(t);
	const marker = join(root, "EXECUTED");
	for (const config of [
		`import {writeFileSync} from "node:fs"; writeFileSync(${JSON.stringify(marker)}, "bad"); export default getConfig();`,
		`const overrides={}; export default {transpilePackages:["@mizen-labs/ui"],...overrides};`,
		`const config={transpilePackages:["@mizen-labs/ui"]}; config.transpilePackages=[]; export default config;`,
		`// export default {transpilePackages:["@mizen-labs/ui"]};`,
		"export default {broken",
	]) {
		put(root, "next.config.mjs", config);
		assert.equal(diagnostic(run(root), "setup.bundling").status, "unverified");
		assert.equal(existsSync(marker), false);
	}
});

test("monorepo roots require an app; nested cwd finds the app and its workspace lockfile", (t) => {
	const workspace = fixture(t);
	put(workspace, "package.json", { private: true, workspaces: ["apps/*"] });
	assert.equal(diagnostic(run(workspace), "project.target").status, "error");
	const app = join(workspace, "apps/web");
	put(app, "package.json", { dependencies: { next: "16.3.8" } });
	mkdirSync(join(app, "src/components"), { recursive: true });
	const result = run(join(app, "src/components"));
	assert.equal(result.project, app);
	assert.equal(diagnostic(result, "project.package-manager").status, "pass");
	assert.equal(diagnostic(result, "package.mizen").status, "pass");
});

test("conflicting lockfiles, unsupported frameworks, and malformed manifests get actionable results", (t) => {
	const root = fixture(t);
	put(root, "package-lock.json", {});
	assert.equal(
		diagnostic(run(root), "project.package-manager").status,
		"unverified"
	);
	put(root, "package.json", { dependencies: { vite: "8.0.0" } });
	assert.equal(diagnostic(run(root), "project.framework").status, "unverified");
	put(root, "package.json", { dependencies: "invalid" });
	assert.equal(diagnostic(run(root), "project.manifest").status, "error");
	put(root, "package.json", "{broken");
	assert.equal(diagnostic(run(root), "project.manifest").status, "error");
	assert.equal(
		diagnostic(run(join(root, "missing")), "project.target").status,
		"error"
	);
});

test("doctor preserves project sources and reports useful human output", (t) => {
	const root = fixture(t);
	const source = readFileSync(join(root, "app/layout.tsx"), "utf8");
	const before = readdirSync(root).sort();
	const result = spawnSync(
		process.execPath,
		[binary, "doctor", "--cwd", root],
		{ encoding: "utf8" }
	);
	assert.equal(result.status, 0, result.stderr);
	assert.ok(result.stdout.includes("✓ Healthy."));
	assert.equal(readFileSync(join(root, "app/layout.tsx"), "utf8"), source);
	assert.deepEqual(readdirSync(root).sort(), before);
});

test("React and ReactDOM must match even when both satisfy Mizen peers", (t) => {
	const root = fixture(t);
	put(root, "node_modules/react-dom/package.json", {
		name: "react-dom",
		version: "19.2.8",
	});
	const result = run(root);
	assert.equal(diagnostic(result, "package.react-dom").status, "pass");
	assert.equal(diagnostic(result, "package.react-pair").status, "error");
	assert.equal(result.exit, 1);
});

test("package-manager declarations must agree with the selected lockfile", (t) => {
	const root = fixture(t);
	put(root, "package.json", {
		dependencies: { next: "16.3.8" },
		packageManager: "npm@11.0.0",
	});
	assert.equal(
		diagnostic(run(root), "project.package-manager").status,
		"unverified"
	);
	put(root, "package.json", {
		dependencies: { next: "16.3.8" },
		packageManager: "pnpm@12.15.0",
	});
	assert.equal(diagnostic(run(root), "project.package-manager").status, "pass");
});

test("invalid installed metadata is a diagnostic and never exposes its contents", (t) => {
	const root = fixture(t);
	put(
		root,
		"node_modules/react/package.json",
		'{"secret":"DO_NOT_LEAK",broken'
	);
	const result = run(root);
	assert.equal(result.exit, 1);
	assert.equal(diagnostic(result, "package.metadata").status, "error");
	assert.equal(result.raw.includes("DO_NOT_LEAK"), false);
});

test("unused document helpers do not verify the actual root theme", (t) => {
	const root = fixture(t);
	put(
		root,
		"app/layout.tsx",
		layout.replace("export default function Root", "function UnusedDocument") +
			"\nexport default function Root(){return <html><body /></html>;}"
	);
	assert.equal(diagnostic(run(root), "setup.theme").status, "unverified");
});
