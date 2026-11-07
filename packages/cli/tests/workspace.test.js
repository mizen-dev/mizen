import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	readlinkSync,
	realpathSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parseOutput } from "./helpers/output.js";

const binary = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
function put(root, path, value) {
	const file = join(root, path);
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(
		file,
		typeof value === "string" ? value : JSON.stringify(value)
	);
}
function workspace(t, kind = "pnpm", patterns = ["apps/*", "packages/*"]) {
	const root = realpathSync.native(
		mkdtempSync(join(tmpdir(), "mizen workspace café "))
	);
	t.after(() => rmSync(root, { force: true, recursive: true }));
	put(root, "package.json", {
		name: "workspace",
		packageManager: kind === "pnpm" ? "pnpm@12.15.0" : "npm@10.9.8",
		private: true,
		...(kind === "npm" ? { workspaces: patterns } : {}),
	});
	if (kind === "pnpm") {
		put(
			root,
			"pnpm-workspace.yaml",
			`packages:\n${patterns.map((pattern) => `  - '${pattern}'`).join("\n")}\n`
		);
	}
	put(
		root,
		kind === "pnpm" ? "pnpm-lock.yaml" : "package-lock.json",
		"keep-lockfile"
	);
	put(root, "node_modules/@mizen-labs/ui/package.json", {
		exports: {
			"./package.json": "./package.json",
			"./theme/initialize": "./initialize.js",
		},
		name: "@mizen-labs/ui",
		peerDependencies: { react: "^19.2.8", "react-dom": "^19.2.8" },
		version: "0.1.0",
	});
	put(
		root,
		"node_modules/@mizen-labs/ui/initialize.js",
		"export function initializeTheme() {}\n"
	);
	for (const name of ["react", "react-dom"]) {
		put(root, `node_modules/${name}/package.json`, { name, version: "19.3.0" });
	}
	for (const name of ["next", "@tanstack/react-start", "vite"]) {
		put(root, `node_modules/${name}/package.json`, { name, version: "1.0.0" });
	}
	return root;
}
function app(root, path, framework = "next") {
	const project = join(root, path);
	const name = framework === "start" ? "@tanstack/react-start" : framework;
	put(project, "package.json", {
		dependencies: {
			[name]: "1.0.0",
			"@mizen-labs/ui": "0.1.0",
			react: "19.3.0",
			"react-dom": "19.3.0",
		},
		name: `@test/${path.replaceAll("/", "-") || "root"}`,
	});
	if (framework === "vite") {
		put(
			project,
			"index.html",
			'<div id="root"></div><script type="module" src="/src/main.tsx"></script>'
		);
		put(
			project,
			"src/main.tsx",
			`import "@mizen-labs/ui/styles.css"; import {ThemeProvider} from "@mizen-labs/ui/theme"; import {initializeTheme} from "@mizen-labs/ui/theme/initialize"; import {createRoot} from "react-dom/client"; initializeTheme(); createRoot(document.getElementById("root")).render(<ThemeProvider><App/></ThemeProvider>);`
		);
	} else if (framework === "start") {
		put(
			project,
			"vite.config.ts",
			'export default {ssr:{noExternal:["@mizen-labs/ui"]}};'
		);
		put(
			project,
			"src/routes/__root.tsx",
			`import {createRootRoute} from "@tanstack/react-router"; import css from "@mizen-labs/ui/styles.css?url"; import {ThemeProvider,ThemeScript} from "@mizen-labs/ui/theme"; export const Route=createRootRoute({head:()=>({links:[{href:css,rel:"stylesheet"}]}),shellComponent:Root}); function Root({children}) {return <html><head><ThemeScript/></head><body><ThemeProvider>{children}</ThemeProvider></body></html>;}`
		);
	} else {
		put(
			project,
			"next.config.mjs",
			'export default {transpilePackages:["@mizen-labs/ui"]};'
		);
		put(
			project,
			"app/layout.tsx",
			'import "@mizen-labs/ui/styles.css"; import {ThemeProvider,ThemeScript} from "@mizen-labs/ui/theme"; export default function Root({children}) {return <html><head><ThemeScript/></head><body><ThemeProvider>{children}</ThemeProvider></body></html>;}'
		);
	}
	return project;
}
function run(root, args = []) {
	const result = spawnSync(
		process.execPath,
		[binary, "doctor", "--workspace", "--cwd", root, "--json", ...args],
		{ encoding: "utf8" }
	);
	assert.equal(result.stderr, "");
	return { ...parseOutput(result.stdout), exit: result.status };
}
function snapshot(root, prefix = "") {
	return readdirSync(root, { withFileTypes: true })
		.sort((a, b) => a.name.localeCompare(b.name))
		.flatMap((entry) => {
			const path = join(prefix, entry.name);
			if (entry.isSymbolicLink()) {
				return [[path, readlinkSync(join(root, entry.name))]];
			}
			return entry.isDirectory()
				? snapshot(join(root, entry.name), path)
				: [[path, readFileSync(join(root, entry.name), "utf8")]];
		});
}

test("npm and pnpm discover supported apps, skip libraries, and preserve every file", (t) => {
	for (const kind of ["npm", "pnpm"]) {
		const root = workspace(t, kind);
		app(root, "apps/z-next");
		app(root, "apps/a-start", "start");
		app(root, "apps/m-vite", "vite");
		put(root, "packages/ui/package.json", {
			name: "@test/ui",
			peerDependencies: { react: "^19" },
		});
		put(
			root,
			".pnpmfile.cjs",
			`require("node:fs").writeFileSync(${JSON.stringify(join(root, "HOOK_RAN"))}, "unexpected");`
		);
		const before = snapshot(root);
		const result = run(root, ["--strict"]);
		assert.equal(
			result.exit,
			0,
			JSON.stringify(
				result.data.diagnostics.filter((item) => item.status !== "pass")
			)
		);
		assert.equal(result.data.status, "healthy");
		assert.equal(result.data.workspace.kind, kind);
		assert.deepEqual(
			result.data.apps.map((item) => item.path),
			["apps/a-start", "apps/m-vite", "apps/z-next"]
		);
		assert.deepEqual(
			result.data.apps.map((item) => item.framework),
			["start", "vite", "next"]
		);
		assert.equal(
			result.data.skipped.find((item) => item.path === "packages/ui").status,
			"skipped"
		);
		assert.equal(result.data.summary.errors, 0);
		assert.equal(result.data.diagnostics.length, result.data.summary.passed);
		assert.ok(result.data.diagnostics.every((item) => item.project));
		assert.deepEqual(snapshot(root), before);
	}
});

test("discovery starts at the nearest declaration above --cwd", (t) => {
	const root = workspace(t);
	const project = app(root, "apps/web");
	const result = run(join(project, "app"));
	assert.equal(result.data.project, root);
	assert.equal(result.data.apps.length, 1);
	put(project, "pnpm-workspace.yaml", "packages: []\n");
	const nested = run(join(project, "app"));
	assert.equal(nested.data.project, project);
	assert.deepEqual(
		nested.data.apps.map((item) => item.path),
		["."]
	);
	assert.equal(nested.data.apps[0].framework, "next");
});

test("pnpm exclusions, duplicates, braces, and normalized relative paths use declared members only", (t) => {
	const root = workspace(t, "pnpm", [
		"./apps//{web,old}",
		"apps/*",
		"!./apps/old",
		"!apps/excluded",
	]);
	app(root, "apps/web");
	app(root, "apps/old");
	put(root, "apps/excluded/package.json", "invalid JSON must remain excluded");
	app(root, "outside-declaration/web");
	const result = run(root, ["--strict"]);
	assert.equal(
		result.exit,
		0,
		JSON.stringify(
			result.data.diagnostics.filter((item) => item.status !== "pass")
		)
	);
	assert.deepEqual(
		result.data.apps.map((item) => item.path),
		["apps/web"]
	);
});

test("npm permits later positive patterns to override earlier exclusions", (t) => {
	const root = workspace(t, "npm", [
		"apps/**",
		"!apps/legacy/**",
		"apps/legacy/web",
	]);
	app(root, "apps/legacy/web");
	const result = run(root, ["--strict"]);
	assert.equal(
		result.exit,
		0,
		JSON.stringify(
			result.data.diagnostics.filter((item) => item.status !== "pass")
		)
	);
	assert.deepEqual(
		result.data.apps.map((item) => item.path),
		["apps/legacy/web"]
	);
});

test("pnpm takes precedence and conflicting declarations stay unverified", (t) => {
	const root = workspace(t, "pnpm", ["apps/*"]);
	app(root, "apps/web");
	app(root, "legacy/web");
	const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
	manifest.workspaces = ["legacy/*"];
	put(root, "package.json", manifest);
	const result = run(root);
	assert.equal(result.exit, 0);
	assert.deepEqual(
		result.data.apps.map((item) => item.path),
		["apps/web"]
	);
	assert.equal(result.data.status, "incomplete");
	assert.ok(
		result.data.diagnostics.some((item) => item.id === "workspace.declarations")
	);
	assert.equal(run(root, ["--strict"]).exit, 1);
});

test("one malformed member does not prevent inspection of healthy or broken apps", (t) => {
	const root = workspace(t);
	app(root, "apps/good");
	const broken = app(root, "apps/broken");
	put(
		broken,
		"app/layout.tsx",
		"export default function Root({children}) {return <html><body>{children}</body></html>}"
	);
	put(root, "apps/invalid/package.json", "{ broken");
	const result = run(root);
	assert.equal(result.exit, 1);
	assert.equal(result.data.apps.length, 2);
	assert.equal(
		result.data.apps.find((item) => item.path === "apps/good").status,
		"healthy"
	);
	assert.equal(
		result.data.apps.find((item) => item.path === "apps/broken").status,
		"incomplete"
	);
	assert.ok(
		result.data.diagnostics.some(
			(item) =>
				item.id === "workspace.manifest" &&
				item.evidence.includes(join(root, "apps/invalid/package.json"))
		)
	);
	assert.ok(
		result.data.diagnostics.some(
			(item) => item.project === broken && item.status !== "pass"
		)
	);
});

test("ambiguous apps and Vite libraries remain unverified instead of being reported healthy", (t) => {
	const root = workspace(t);
	put(root, "apps/ambiguous/package.json", {
		dependencies: { "@tanstack/react-start": "1", next: "1" },
	});
	put(root, "packages/library/package.json", {
		devDependencies: { react: "19", vite: "8" },
		name: "library",
	});
	const result = run(root);
	assert.equal(result.data.apps.length, 0);
	assert.equal(result.data.status, "incomplete");
	assert.equal(result.exit, 0);
	assert.equal(run(root, ["--strict"]).exit, 1);
	assert.equal(
		result.data.skipped.filter((item) => item.status === "unverified").length,
		2
	);
});

test("an empty workspace remains incomplete and omitted pnpm packages includes only the root", (t) => {
	const root = workspace(t);
	app(root, "apps/web");
	put(root, "pnpm-workspace.yaml", "catalog: {}\n");
	assert.equal(run(root).data.apps.length, 0);
	assert.equal(run(root).data.status, "incomplete");
	assert.equal(run(root, ["--strict"]).exit, 1);
});

test("workspace root applications are checked without enabling root init", (t) => {
	const root = workspace(t, "npm", []);
	const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
	app(root, "");
	const application = JSON.parse(
		readFileSync(join(root, "package.json"), "utf8")
	);
	put(root, "package.json", {
		...manifest,
		dependencies: application.dependencies,
	});
	const result = run(root, ["--strict"]);
	assert.equal(
		result.exit,
		0,
		JSON.stringify(
			result.data.diagnostics.filter((item) => item.status !== "pass")
		)
	);
	assert.deepEqual(
		result.data.apps.map((item) => item.path),
		["."]
	);
	const init = spawnSync(
		process.execPath,
		[binary, "init", "--workspace", "--cwd", root, "--yes", "--json"],
		{ encoding: "utf8" }
	);
	assert.equal(init.status, 2);
	assert.equal(parseOutput(init.stderr).error.reason, "unknown_option");
});

test("linked and external members are surfaced without following them implicitly", (t) => {
	const root = workspace(t, "pnpm", [
		"apps/*",
		"../external/*",
		"{apps,../external}/*",
		"@(apps|../external)/*",
		"{apps,/external}/*",
	]);
	const target = app(root, "real/web");
	mkdirSync(join(root, "apps"));
	symlinkSync(
		target,
		join(root, "apps/linked"),
		process.platform === "win32" ? "junction" : "dir"
	);
	const result = run(root, ["--strict"]);
	assert.equal(result.exit, 1);
	assert.equal(result.data.apps.length, 0);
	assert.ok(
		result.data.skipped.some(
			(item) => item.path === "apps/linked" && item.status === "unverified"
		)
	);
	assert.ok(
		result.data.diagnostics.filter((item) => item.id === "workspace.pattern")
			.length === 4
	);
});

test("bad declarations and unavailable roots produce doctor reports with exit 4", (t) => {
	for (const yaml of [
		"packages: [unterminated",
		"packages: wrong",
		"packages:\n  - 42",
		"packages: []\npackages: []",
	]) {
		const root = workspace(t);
		put(root, "pnpm-workspace.yaml", yaml);
		const result = run(root);
		assert.equal(result.exit, 1);
		assert.equal(result.command, "doctor");
		assert.equal(result.data.workspace, null);
		assert.ok(
			result.data.diagnostics[0].evidence.includes(
				join(root, "pnpm-workspace.yaml")
			)
		);
	}
	const root = workspace(t, "npm");
	put(root, "package.json", { workspaces: "wrong" });
	assert.equal(run(root).exit, 1);
	assert.equal(run(join(root, "missing")).exit, 1);
});

test("legacy npm package declarations and human output retain app context", (t) => {
	const root = workspace(t, "npm", ["apps/*"]);
	const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
	put(root, "package.json", {
		...manifest,
		workspaces: { packages: ["apps/*"] },
	});
	app(root, "apps/web");
	const json = run(root, ["--strict"]);
	assert.equal(json.exit, 0);
	const human = spawnSync(
		process.execPath,
		[binary, "doctor", "--workspace", "--cwd", root],
		{ encoding: "utf8" }
	);
	assert.equal(human.status, 0, human.stderr);
	assert.ok(human.stdout.includes("apps/web (next"));
	assert.ok(human.stdout.includes("Skipped"));
	assert.ok(human.stdout.includes("✓ Healthy."));
});
