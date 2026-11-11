import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { cleanup } from "../../../scripts/cleanup.mjs";
import { CliError, normalizeError } from "../dist/errors.js";
import { parseOutput } from "./helpers/output.js";

const binary = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
function run(args, options = {}) {
	return spawnSync(process.execPath, [binary, ...args], {
		encoding: "utf8",
		killSignal: "SIGKILL",
		timeout: 30_000,
		...options,
	});
}

test("each command has relevant help, examples, and unchanged JSON envelopes", () => {
	for (const [command, present, absent] of [
		["search", "[QUERY]", "--yes"],
		["info", "<COMPONENT>", "--dry-run"],
		["doctor", "--strict", "--yes"],
		["init", "--package <FILE>", "--strict"],
	]) {
		const human = run([command, "--help"]);
		assert.equal(human.status, 0, human.stderr);
		assert.equal(human.stderr, "");
		assert.ok(human.stdout.startsWith(`mizen ${command}`));
		assert.ok(human.stdout.includes(present));
		assert.ok(!human.stdout.includes(absent));
		assert.ok(human.stdout.includes("Examples:"));
		const json = run([command, "-h", "--json"]);
		assert.equal(json.status, 0, json.stderr);
		assert.equal(json.stderr, "");
		const output = parseOutput(json.stdout);
		assert.equal(output.command, "help");
		assert.equal(`${output.data.usage}\n`, human.stdout);
		assert.equal(run(["--help", command]).stdout, human.stdout);
		assert.equal(run(["help", command]).stdout, human.stdout);
	}
});

test("help bypasses app inspection and writes even with --yes and an invalid app", (t) => {
	const cwd = mkdtempSync(join(tmpdir(), "mizen-help-"));
	t.after(() => cleanup(cwd));
	writeFileSync(join(cwd, "package.json"), "intentionally invalid JSON\n");
	const result = run(
		["init", "--cwd", cwd, "--yes", "--feature", "diagram", "--help"],
		{ cwd, env: { ...process.env, PATH: "" } }
	);
	assert.equal(result.status, 0, result.stderr);
	assert.deepEqual(readdirSync(cwd), ["package.json"]);
	assert.equal(
		readFileSync(join(cwd, "package.json"), "utf8"),
		"intentionally invalid JSON\n"
	);
	assert.equal(
		run(["doctor", "--cwd", join(cwd, "missing"), "--help"]).status,
		0
	);
});

test("invalid commands, missing input, and misplaced flags point to relevant help", () => {
	for (const [args, reason, detail, topic] of [
		[
			["unknown", "--help"],
			"unknown_command",
			"Unknown command unknown",
			"mizen --help",
		],
		[
			["serch"],
			"unknown_command",
			"Did you mean search?",
			"mizen search --help",
		],
		[["info"], "missing_name", "without its name", "mizen search"],
		[["doctor", "app"], "invalid_arguments", "--cwd", "mizen doctor --help"],
		[["init", "app"], "invalid_arguments", "--cwd", "mizen init --help"],
		[["init", "--strict"], "unknown_option", "--strict", "mizen init --help"],
		[["doctor", "--yes"], "unknown_option", "--yes", "mizen doctor --help"],
		[["search", "--yes"], "unknown_option", "--yes", "mizen search --help"],
		[
			["info", "button", "--dry-run"],
			"unknown_option",
			"--dry-run",
			"mizen info --help",
		],
		[["init", "--cwd"], "invalid_arguments", "--cwd", "mizen init --help"],
		[
			["doctor", "--unknown"],
			"unknown_option",
			"Unknown option --unknown",
			"mizen doctor --help",
		],
	]) {
		const result = run([...args, "--json"]);
		assert.equal(result.status, 2, result.stderr);
		assert.equal(result.stdout, "");
		const { error } = parseOutput(result.stderr);
		assert.equal(error.reason, reason);
		assert.ok(error.message.includes(detail), error.message);
		assert.equal(error.next[0].command, topic);
	}
});

test("the argument terminator keeps help and JSON words literal", () => {
	const result = run(["info", "--", "--json"]);
	assert.equal(result.status, 1);
	assert.equal(result.stdout, "");
	assert.ok(result.stderr.startsWith("✗ Couldn't find component --json."));
	assert.ok(
		run(["search", "--", "--help"]).stderr.includes(
			'No components match "--help".'
		)
	);
});

test("unexpected failures retain context and explain what to report", () => {
	const known = new CliError("conflict", "Keep the caller's text.", 1);
	assert.equal(normalizeError(known), known);
	const failure = normalizeError(
		new Error("Unable to read the bundled catalog.")
	);
	assert.equal(failure.exitCode, 1);
	assert.equal(failure.reason, "internal_error");
	assert.ok(failure.message.includes("This is a bug in Mizen CLI."));
	assert.deepEqual(failure.detail.rows, [
		["Cause", "Unable to read the bundled catalog."],
	]);
	assert.deepEqual(failure.detail.next.argv, ["mizen", "--version"]);
});

test("help and version still work when the bundled catalog is unavailable", (t) => {
	const cwd = mkdtempSync(join(tmpdir(), "mizen-help-recovery-"));
	t.after(() => cleanup(cwd));
	mkdirSync(join(cwd, "dist"));
	writeFileSync(
		join(cwd, "package.json"),
		JSON.stringify({ type: "module", version: "0.1.0" })
	);
	for (const name of [
		"cli.js",
		"discover.js",
		"errors.js",
		"help.js",
		"output.js",
	]) {
		cpSync(
			fileURLToPath(new URL(`../dist/${name}`, import.meta.url)),
			join(cwd, "dist", name)
		);
	}
	const invoke = (args) =>
		spawnSync(process.execPath, [join(cwd, "dist/cli.js"), ...args], {
			cwd,
			encoding: "utf8",
			killSignal: "SIGKILL",
			timeout: 30_000,
		});
	const help = invoke(["doctor", "--help", "--json"]);
	assert.equal(help.status, 0, help.stderr);
	assert.equal(parseOutput(help.stdout).command, "help");
	const version = invoke(["--version", "--json"]);
	assert.equal(version.status, 0, version.stderr);
	assert.equal(parseOutput(version.stdout).data.version, "0.1.0");
	const failure = invoke(["info", "button", "--json"]);
	assert.equal(failure.status, 1);
	assert.equal(failure.stdout, "");
	const { error } = parseOutput(failure.stderr);
	assert.equal(error.reason, "internal_error");
	assert.equal(error.next[0].command, "mizen --version");
});
