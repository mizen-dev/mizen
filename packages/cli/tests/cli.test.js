import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { cleanup } from "../../../scripts/cleanup.mjs";
import {
	execute as execFileSync,
	INSTALL_TIMEOUT_MS,
} from "../scripts/process.js";
import { parseOutput, schema } from "./helpers/output.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const binary = join(root, "dist/cli.js");
const readJson = (path) =>
	JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const components = readJson(
	"../../../apps/docs/src/entities/documentation/model/docs-registry-data.json"
);
const guidance = readJson(
	"../../../apps/docs/src/entities/documentation/model/component-guidance-data.json"
);
const manifest = readJson("../package.json");

function run(args, options = {}) {
	return spawnSync(process.execPath, [binary, ...args], {
		encoding: "utf8",
		killSignal: "SIGKILL",
		timeout: 30_000,
		...options,
	});
}

function json(args) {
	const result = run([...args, "--json"]);
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stderr, "");
	const parsed = parseOutput(result.stdout);
	assert.equal(parsed.schemaVersion, 1);
	return parsed;
}

test("help and version work without a project or network", () => {
	assert.ok(run([]).stdout.startsWith("mizen <COMMAND> [options]"));
	assert.equal(json(["--help"]).command, "help");
	assert.equal(json(["--version"]).data.version, manifest.version);
	assert.equal(run(["--version"]).stdout.trim(), manifest.version);
});

test("search contains exactly the documented catalog in stable order", () => {
	const result = json(["search"]);
	assert.equal(result.command, "search");
	assert.deepEqual(
		result.data.components.map((item) => item.slug),
		components.map((item) => item.slug).sort()
	);
});

test("search handles case, multiple words, guidance, and no matches", () => {
	assert.ok(
		json(["search", "ALERT", "dialog"]).data.components.some(
			(item) => item.slug === "alert-dialog"
		)
	);
	assert.ok(json(["search", "keyboard"]).data.components.length > 0);
	assert.deepEqual(
		json(["search", "unfindable-component-123"]).data.components,
		[]
	);
	const empty = run(["search", "unfindable-component-123"]);
	assert.equal(empty.status, 0);
	assert.equal(empty.stdout, "Component\tDescription\n");
	assert.ok(
		empty.stderr.includes('No components match "unfindable-component-123".')
	);
});

test("info preserves API, guidance, contracts, and examples from the source catalog", () => {
	for (const source of components) {
		const { component } = json(["info", source.slug]).data;
		assert.deepEqual(component, {
			...source,
			documentationPath: `/docs/components/${source.slug}`,
			entryPoint: `@mizen-labs/ui/${source.slug}`,
			guidance: guidance[source.slug],
		});
	}
	assert.equal(
		json(["info", "Activity Feed"]).data.component.slug,
		"activity-feed"
	);
	assert.equal(json(["info", "conversation"]).data.component.status, "preview");
	assert.ok(run(["info", "button"]).stdout.includes("brand"));
});

test("invalid commands and options produce structured failures and stable exit codes", () => {
	for (const [args, exitCode, code] of [
		[["unknown"], 2, "unknown_command"],
		[["info"], 2, "missing_name"],
		[["search", "--unknown"], 2, "unknown_option"],
		[["info", "missing-component"], 1, "not_found"],
	]) {
		const result = run([...args, "--json"]);
		assert.equal(result.status, exitCode);
		assert.equal(result.stdout, "");
		assert.equal(result.stderr.trim().split("\n").length, 1);
		assert.equal(parseOutput(result.stderr).error.reason, code);
	}
	const result = run(["info", "missing-component"]);
	assert.equal(result.stdout, "");
	assert.ok(
		result.stderr.startsWith("✗ Couldn't find component missing-component.")
	);
});

// The app has an older UI without Page. Describing Page anyway would send
// an agent to an import that the app does not have.
test("info fails for a component the installed UI lacks, and names a differing version", async () => {
	const cwd = mkdtempSync(join(tmpdir(), "mizen-cli-installed-"));
	try {
		const installed = join(cwd, "node_modules/@mizen-labs/ui");
		mkdirSync(join(installed, "dist"), { recursive: true });
		writeFileSync(join(installed, "dist/index.js"), "");
		writeFileSync(join(cwd, "package.json"), '{"private":true}\n');
		writeFileSync(
			join(installed, "package.json"),
			JSON.stringify({
				exports: { ".": "./dist/index.js", "./button": "./dist/button.js" },
				name: "@mizen-labs/ui",
				version: "0.0.9",
			})
		);
		const missing = run(["info", "page", "--cwd", cwd, "--json"]);
		assert.equal(missing.status, 1);
		assert.equal(missing.stdout, "");
		const { error } = parseOutput(missing.stderr);
		assert.equal(error.reason, "unavailable");
		assert.deepEqual(error.data, {
			entryPoint: "@mizen-labs/ui/page",
			installedUiVersion: "0.0.9",
			uiVersion: manifest.version,
		});
		assert.equal(error.next[0].command, "npx @mizen-labs/cli@0.0.9 search");
		const text = run(["info", "page"], { cwd });
		assert.equal(text.status, 1);
		assert.ok(
			text.stderr.startsWith(
				`✗ Page is not in the installed @mizen-labs/ui 0.0.9. This catalog describes ${manifest.version}.`
			),
			text.stderr
		);
		assert.ok(text.stderr.includes("Upgrade @mizen-labs/ui only when"));

		const present = run(["info", "button", "--cwd", cwd]);
		assert.equal(present.status, 0);
		assert.ok(
			present.stdout.includes(`@mizen-labs/ui ${manifest.version}`),
			present.stdout
		);
		assert.ok(
			present.stderr.includes(
				`! This describes @mizen-labs/ui ${manifest.version}. The app has 0.0.9`
			),
			present.stderr
		);
		assert.ok(present.stderr.includes("npx @mizen-labs/cli@0.0.9 info button"));
		const listed = run(["search", "button", "--cwd", cwd, "--json"]);
		assert.equal(parseOutput(listed.stdout).data.installedUiVersion, "0.0.9");

		// The same version without the export is another build of it.
		writeFileSync(
			join(installed, "package.json"),
			JSON.stringify({
				exports: { ".": "./dist/index.js" },
				name: "@mizen-labs/ui",
				version: manifest.version,
			})
		);
		const rebuilt = run(["info", "page", "--cwd", cwd, "--json"]);
		const other = parseOutput(rebuilt.stderr).error;
		assert.equal(other.reason, "unavailable");
		assert.ok(other.message.includes("another build of this version"));
		assert.equal(other.next, undefined);
		const matching = run(["search", "--cwd", cwd]);
		assert.equal(matching.status, 0);
		assert.equal(matching.stderr, "");
	} finally {
		await cleanup(cwd);
	}
});

test("discovery preserves project files", async () => {
	const cwd = mkdtempSync(join(tmpdir(), "mizen-cli-project-"));
	try {
		writeFileSync(join(cwd, "package.json"), '{"private":true}\n');
		writeFileSync(join(cwd, "layout.tsx"), "// Keep local changes.\n");
		for (const args of [["search"], ["info", "button"], ["info", "unknown"]]) {
			run(args, { cwd });
		}
		assert.deepEqual(readdirSync(cwd).sort(), ["layout.tsx", "package.json"]);
		assert.equal(
			readFileSync(join(cwd, "layout.tsx"), "utf8"),
			"// Keep local changes.\n"
		);
	} finally {
		await cleanup(cwd);
	}
});

test("the packed CLI installs and runs without workspace files", async () => {
	const destination = mkdtempSync(join(tmpdir(), "mizen-cli-packed-"));
	try {
		const archive = join(destination, "mizen-cli.tgz");
		execFileSync("pnpm", ["pack", "--out", archive], {
			cwd: root,
			stdio: "pipe",
			timeout: 120_000,
		});
		writeFileSync(join(destination, "package.json"), '{"private":true}\n');
		execFileSync(
			"npm",
			["install", "--ignore-scripts", "--no-audit", "--no-fund", archive],
			{ cwd: destination, stdio: "pipe", timeout: INSTALL_TIMEOUT_MS }
		);
		const require = createRequire(join(destination, "package.json"));
		const installedSchema = JSON.parse(
			readFileSync(require.resolve("@mizen-labs/cli/schema/v1.json"), "utf8")
		);
		assert.deepEqual(installedSchema, schema);
		const installed = join(destination, "node_modules/@mizen-labs/cli");
		const output = execFileSync(
			process.execPath,
			[join(installed, "dist/cli.js"), "info", "conversation", "--json"],
			{ cwd: destination, encoding: "utf8" }
		);
		assert.equal(
			parseOutput(output).data.component.entryPoint,
			"@mizen-labs/ui/conversation"
		);
		assert.ok(
			readdirSync(join(destination, "node_modules/.bin")).some((name) =>
				name.startsWith("mizen")
			)
		);
		const packaged = JSON.parse(
			readFileSync(join(installed, "package.json"), "utf8")
		);
		assert.deepEqual(packaged.dependencies, manifest.dependencies);
		const diagnosed = spawnSync(
			process.execPath,
			[
				join(installed, "dist/cli.js"),
				"doctor",
				"--cwd",
				destination,
				"--json",
			],
			{ encoding: "utf8", killSignal: "SIGKILL", timeout: 30_000 }
		);
		assert.equal(diagnosed.status, 1, diagnosed.stderr);
		assert.ok(
			parseOutput(diagnosed.stdout).data.diagnostics.some(
				(item) => item.id === "package.mizen" && item.status === "error"
			)
		);
		writeFileSync(join(destination, "pnpm-workspace.yaml"), "packages: []\n");
		const workspace = spawnSync(
			process.execPath,
			[
				join(installed, "dist/cli.js"),
				"doctor",
				"--workspace",
				"--cwd",
				destination,
				"--strict",
				"--json",
			],
			{ encoding: "utf8", killSignal: "SIGKILL", timeout: 30_000 }
		);
		assert.equal(workspace.status, 1, workspace.stderr);
		const workspaceReport = parseOutput(workspace.stdout).data;
		assert.equal(workspaceReport.workspace.kind, "pnpm");
		assert.deepEqual(workspaceReport.apps, []);
		assert.equal(workspaceReport.status, "incomplete");
	} finally {
		await cleanup(destination);
	}
});
