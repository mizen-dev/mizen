import assert from "node:assert/strict";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { execute } from "../process.js";

export const protocol = {
	id: "mizen-cli-process-v1",
	samples: 20,
	warmups: 3,
};
export const commands = [
	{ args: ["--help", "--json"], name: "help" },
	{ args: ["search", "keyboard", "navigation", "--json"], name: "search" },
	{ args: ["info", "button", "--json"], name: "info" },
	{ args: ["doctor", "--strict", "--json"], name: "doctor" },
];

export function summarize(samples) {
	assert.ok(samples.length > 0 && samples.every(Number.isFinite));
	const sorted = [...samples].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return {
		maxMs: sorted.at(-1),
		medianMs:
			sorted.length % 2
				? sorted[middle]
				: (sorted[middle - 1] + sorted[middle]) / 2,
		minMs: sorted[0],
		p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
	};
}

export async function directoryBytes(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const sizes = await Promise.all(
		entries.map(async (entry) => {
			const path = join(directory, entry.name);
			if (entry.isSymbolicLink()) {
				return 0;
			}
			return entry.isDirectory()
				? directoryBytes(path)
				: (await stat(path)).size;
		})
	);
	return sizes.reduce((total, size) => total + size, 0);
}

function validate(name, text) {
	const result = JSON.parse(text);
	assert.equal(result.schemaVersion, 1);
	assert.equal(result.command, name);
	if (name === "doctor") {
		assert.equal(result.data.status, "healthy", text);
	} else if (name === "search") {
		assert.ok(result.data.components.length > 0, text);
	} else if (name === "info") {
		assert.equal(result.data.component.slug, "button");
	} else {
		assert.ok(result.data.usage);
	}
}

function invocation(binary, cwd, command) {
	const env = { ...process.env, CI: "1", NO_COLOR: "1" };
	Reflect.deleteProperty(env, "NODE_OPTIONS");
	Reflect.deleteProperty(env, "NODE_PATH");
	Reflect.deleteProperty(env, "FORCE_COLOR");
	const start = performance.now();
	const output = execute(process.execPath, [binary, ...command.args], {
		cwd,
		env,
	});
	const elapsed = performance.now() - start;
	validate(command.name, output);
	return elapsed;
}

export function measure(binary, cwd) {
	const results = commands.map((command) => ({
		...command,
		firstRunMs: invocation(binary, cwd, command),
		samplesMs: [],
		warmupsMs: [],
	}));
	for (let round = 0; round < protocol.warmups + protocol.samples; round += 1) {
		for (const result of results) {
			const duration = invocation(binary, cwd, result);
			const samples =
				round < protocol.warmups ? result.warmupsMs : result.samplesMs;
			samples.push(duration);
		}
	}
	return results.map((result) => ({
		...result,
		...summarize(result.samplesMs),
	}));
}

export function markdown(report) {
	const rows = report.commands.map(
		(command) =>
			`| ${command.name} | ${command.firstRunMs.toFixed(2)} | ${command.medianMs.toFixed(2)} | ${command.p95Ms.toFixed(2)} |`
	);
	return [
		"## Mizen CLI benchmark",
		`Protocol: ${report.protocol.id}. ${report.protocol.samples} samples and ${report.protocol.warmups} warmups per command.`,
		`Platform: ${report.environment.platform}/${report.environment.architecture}; Node ${report.environment.node}; npm ${report.environment.npm}.`,
		"",
		"| Command | First run (ms) | Median (ms) | p95 (ms) |",
		"| --- | ---: | ---: | ---: |",
		...rows,
		"",
		`CLI archive: ${report.sizes.archiveBytes} bytes. Unpacked CLI: ${report.sizes.packageBytes} bytes. CLI-only node_modules: ${report.sizes.installedBytes} bytes.`,
		"",
		"Each sample starts a fresh Node process. Filesystem caches are uncontrolled. Process launch, CLI work, and output capture are timed; JSON validation is excluded.",
		"Timing and size results are informational. Compare matching protocols, fixtures, Node versions, and runner classes. No regression threshold is enforced.",
		"",
	].join("\n");
}
