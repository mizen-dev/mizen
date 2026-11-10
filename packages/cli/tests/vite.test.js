import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { cleanup } from "../../../scripts/cleanup.mjs";
import { frameworkOf } from "../dist/doctor/project.js";
import { fakePnpm } from "./helpers/fake-pnpm.js";
import { parseOutput } from "./helpers/output.js";

const binary = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const { version: uiVersion } = JSON.parse(
	readFileSync(new URL("../../ui/package.json", import.meta.url), "utf8")
);
const main = `// Keep the client entry comment.\nimport { StrictMode } from 'react';\nimport {createRoot as mount} from 'react-dom/client';\nimport './index.css';\nimport App from './App';\nmount(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);\n`;

function put(root, path, value) {
	const file = join(root, path);
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(
		file,
		typeof value === "string" ? value : JSON.stringify(value)
	);
}
function fixture(t, extension = "tsx") {
	const root = mkdtempSync(join(tmpdir(), "mizen-vite-"));
	t.after(() => cleanup(root));
	put(root, "package.json", {
		dependencies: {
			"@mizen-labs/ui": uiVersion,
			react: "19.3.0",
			"react-dom": "19.3.0",
		},
		devDependencies: { vite: "8.3.5" },
		private: true,
	});
	put(root, "pnpm-lock.yaml", "keep-lockfile");
	put(root, "node_modules/@mizen-labs/ui/package.json", {
		exports: {
			"./package.json": "./package.json",
			"./theme/initialize": "./initialize.js",
		},
		name: "@mizen-labs/ui",
		peerDependencies: { react: "^19.2.8", "react-dom": "^19.2.8" },
		version: uiVersion,
	});
	put(
		root,
		"node_modules/@mizen-labs/ui/initialize.js",
		"export function initializeTheme() {}\n"
	);
	for (const name of ["react", "react-dom", "vite"]) {
		put(root, `node_modules/${name}/package.json`, {
			name,
			version: name === "vite" ? "8.3.5" : "19.3.0",
		});
	}
	put(
		root,
		"index.html",
		`<!doctype html><html><head><title>My app</title></head><body><div id="root"></div><script type="module" src="/src/main.${extension}"></script></body></html>`
	);
	put(root, `src/main.${extension}`, main);
	put(
		root,
		"vite.config.ts",
		"// Custom settings must remain untouched.\nexport default makeConfig();\n"
	);
	return root;
}
function run(root, command = "init", args = []) {
	const result = spawnSync(
		process.execPath,
		[binary, command, "--cwd", root, "--json", ...args],
		{ encoding: "utf8", killSignal: "SIGKILL", timeout: 30_000 }
	);
	// A result prints on stdout; an error prints on stderr, never both.
	assert.ok(!(result.stdout && result.stderr), result.stderr);
	return {
		exit: result.status,
		...parseOutput(result.stdout || result.stderr),
	};
}

test("plain React/Vite detection preserves SSR framework precedence and rejects ambiguity", () => {
	assert.equal(
		frameworkOf({ dependencies: { react: "19", vite: "8" } }),
		"vite"
	);
	assert.equal(
		frameworkOf({ dependencies: { next: "16", react: "19", vite: "8" } }),
		"next"
	);
	assert.equal(
		frameworkOf({
			dependencies: { "@tanstack/react-start": "1", react: "19", vite: "8" },
		}),
		"start"
	);
	assert.equal(
		frameworkOf({
			dependencies: { "@tanstack/react-start": "1", next: "16", vite: "8" },
		}),
		"unknown"
	);
	assert.equal(
		frameworkOf({ dependencies: { astro: "6", react: "19", vite: "8" } }),
		"unknown"
	);
});

test("JSX and TSX defaults initialize without SSR configuration and rerun unchanged", (t) => {
	for (const extension of ["jsx", "tsx"]) {
		const root = fixture(t, extension);
		const original = readFileSync(join(root, `src/main.${extension}`), "utf8");
		const config = readFileSync(join(root, "vite.config.ts"), "utf8");
		const html = readFileSync(join(root, "index.html"), "utf8");
		const planned = run(root, "init", ["--dry-run"]);
		assert.equal(planned.exit, 0, JSON.stringify(planned));
		assert.equal(planned.data.plan.framework, "vite");
		assert.equal(planned.data.plan.edits.length, 1);
		assert.equal(planned.data.plan.edits[0].path, `src/main.${extension}`);
		assert.equal(
			readFileSync(join(root, `src/main.${extension}`), "utf8"),
			original
		);
		const result = run(root, "init", ["--yes"]);
		assert.equal(result.exit, 0, JSON.stringify(result));
		assert.equal(result.data.verification.status, "healthy");
		const source = readFileSync(join(root, `src/main.${extension}`), "utf8");
		assert.ok(source.includes("<StrictMode><App /></StrictMode>"));
		assert.ok(source.includes("Keep the client entry comment."));
		assert.equal(source.includes("ThemeScript"), false);
		assert.equal(readFileSync(join(root, "vite.config.ts"), "utf8"), config);
		assert.equal(readFileSync(join(root, "index.html"), "utf8"), html);
		assert.equal(run(root, "doctor", ["--strict"]).exit, 0);
		assert.equal(run(root, "init", ["--yes"]).data.status, "unchanged");
	}
});

test("aliased providers inside StrictMode are reused and ReactDOM namespace mounting works", (t) => {
	const root = fixture(t);
	put(
		root,
		"src/main.tsx",
		`import React from 'react';import ReactDOM from 'react-dom/client';import {ThemeProvider as Provider} from '@mizen-labs/ui/theme';import App from './App';ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Provider><App /></Provider></React.StrictMode>);`
	);
	const result = run(root, "init", ["--yes"]);
	assert.equal(result.exit, 0, JSON.stringify(result));
	assert.equal(
		readFileSync(join(root, "src/main.tsx"), "utf8").includes(
			"MizenThemeProvider"
		),
		false
	);
	assert.equal(run(root, "init", ["--yes"]).data.status, "unchanged");
});

test("HTML comments and templates never establish the active entry", (t) => {
	const root = fixture(t);
	put(
		root,
		"index.html",
		`<!-- <script type="module" src="/src/main.tsx"></script> --><template><script type="module" src="/src/main.tsx"></script></template><script type="module" src="/src/other.tsx"></script>`
	);
	assert.equal(run(root, "init", ["--yes"]).exit, 1);
	const doctor = run(root, "doctor", ["--strict"]);
	assert.equal(doctor.exit, 1);
	assert.equal(
		doctor.data.diagnostics.find((item) => item.id === "setup.root").status,
		"unverified"
	);
	assert.equal(existsSync(join(root, ".mizen-init-journal.json")), false);
});

test("unused main files and render helpers do not count as configured roots", (t) => {
	const root = fixture(t);
	put(
		root,
		"src/main.jsx",
		`import '@mizen-labs/ui/styles.css';import {ThemeProvider} from '@mizen-labs/ui/theme';`
	);
	const before = run(root, "doctor");
	assert.equal(
		before.data.diagnostics.find((item) => item.id === "setup.stylesheet")
			.status,
		"unverified"
	);
	put(
		root,
		"src/main.tsx",
		`import {createRoot} from 'react-dom/client';function unused(){createRoot(document.getElementById('root')).render(<App />);}`
	);
	assert.equal(run(root, "init", ["--yes"]).exit, 1);
});

test("partial provider coverage blocks a write instead of creating nested themes", (t) => {
	const root = fixture(t);
	put(
		root,
		"src/main.tsx",
		`import {createRoot} from 'react-dom/client';import {ThemeProvider} from '@mizen-labs/ui/theme';createRoot(document.getElementById('root')).render(<><ThemeProvider><App /></ThemeProvider><Other /></>);`
	);
	assert.equal(run(root, "init", ["--yes"]).exit, 1);
	assert.equal(existsSync(join(root, ".mizen-init-journal.json")), false);
});

test("a changed HTML entry during dependency installation stops source application", (t) => {
	const root = fixture(t);
	put(root, "node_modules/@mizen-labs/ui/package.json", {
		exports: {
			"./package.json": "./package.json",
			"./theme/initialize": "./initialize.js",
		},
		name: "@mizen-labs/ui",
		peerDependencies: {
			pele: "^1.13.0",
			react: "^19.2.8",
			"react-dom": "^19.2.8",
		},
		version: uiVersion,
	});
	const uiPath = join(root, "node_modules/@mizen-labs/ui/package.json");
	const ui = JSON.parse(readFileSync(uiPath, "utf8"));
	ui.exports = {
		"./package.json": "./package.json",
		"./theme/initialize": "./initialize.js",
	};
	put(root, "node_modules/@mizen-labs/ui/package.json", ui);
	const original = readFileSync(join(root, "src/main.tsx"), "utf8");
	const changed = '<script type="module" src="/src/other.tsx"></script>';
	const env = fakePnpm(
		root,
		`require("node:fs").writeFileSync("index.html",${JSON.stringify(changed)});`
	);
	const result = spawnSync(
		process.execPath,
		[binary, "init", "--cwd", root, "--feature", "diagram", "--yes", "--json"],
		{
			encoding: "utf8",
			env,
			killSignal: "SIGKILL",
			timeout: 30_000,
		}
	);
	assert.equal(result.status, 1, result.stderr);
	assert.equal(parseOutput(result.stderr).error.reason, "recovery_required");
	assert.equal(readFileSync(join(root, "src/main.tsx"), "utf8"), original);
	assert.equal(readFileSync(join(root, "index.html"), "utf8"), changed);
	assert.equal(existsSync(join(root, ".mizen-init-journal.json")), true);
});

test("bootstrap is inserted before mounting and late initialization is never duplicated", (t) => {
	const root = fixture(t);
	const applied = run(root, "init", ["--yes"]);
	assert.equal(applied.exit, 0, JSON.stringify(applied));
	const source = readFileSync(join(root, "src/main.tsx"), "utf8");
	assert.ok(
		source.indexOf("MizenInitializeTheme();") < source.indexOf("mount(document")
	);
	put(
		root,
		"src/main.tsx",
		`import {initializeTheme as boot} from '@mizen-labs/ui/theme/initialize';\n${main}\nboot();`
	);
	const result = run(root, "init", ["--yes"]);
	assert.equal(result.exit, 1, JSON.stringify(result));
	assert.ok(result.error.message.includes("before createRoot"));
});

test("custom provider options require a matching explicit bootstrap", (t) => {
	const root = fixture(t);
	const custom = `import {ThemeProvider as Provider} from '@mizen-labs/ui/theme';\n${main.replace("<App />", '<Provider defaultTheme="dark"><App /></Provider>')}`;
	put(root, "src/main.tsx", custom);
	assert.equal(run(root, "init", ["--yes"]).exit, 1);
	put(
		root,
		"src/main.tsx",
		`import {initializeTheme as boot} from '@mizen-labs/ui/theme/initialize';\n${custom.replace("mount(document", 'boot({defaultTheme:"dark"});\nmount(document')}`
	);
	assert.equal(run(root, "init", ["--yes"]).exit, 0);
	assert.equal(run(root, "doctor", ["--strict"]).exit, 0);
});

test("older UI candidates without the initializer stop before source edits", (t) => {
	const root = fixture(t);
	const path = join(root, "node_modules/@mizen-labs/ui/package.json");
	const ui = JSON.parse(readFileSync(path, "utf8"));
	Reflect.deleteProperty(ui.exports, "./theme/initialize");
	put(root, "node_modules/@mizen-labs/ui/package.json", ui);
	const result = run(root, "init", ["--yes"]);
	assert.equal(result.exit, 1, JSON.stringify(result));
	assert.ok(result.error.message.includes("lacks synchronous"));
	assert.equal(readFileSync(join(root, "src/main.tsx"), "utf8"), main);
});

test("a Vite app without the UI package plans the published release", (t) => {
	const root = fixture(t);
	rmSync(join(root, "node_modules/@mizen-labs"), { recursive: true });
	put(root, "package.json", {
		dependencies: { react: "19.3.0", "react-dom": "19.3.0" },
		devDependencies: { vite: "8.3.5" },
		private: true,
	});
	const result = run(root, "init", ["--dry-run"]);
	assert.equal(result.exit, 0, JSON.stringify(result));
	assert.deepEqual(result.data.plan.install.packages, [
		`@mizen-labs/ui@${uiVersion}`,
	]);
});
