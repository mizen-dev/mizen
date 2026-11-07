import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
	appendFile,
	mkdir,
	mkdtemp,
	readFile,
	writeFile,
} from "node:fs/promises";
import {
	arch,
	cpus,
	freemem,
	platform,
	release,
	tmpdir,
	totalmem,
} from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
	hashFiles,
	inputHashes,
	install,
	prepare,
	retain,
	writeJson,
} from "./benchmark/fixtures.js";
import {
	directoryBytes,
	markdown,
	measure,
	protocol,
} from "./benchmark/measure.js";
import { cleanup } from "./cleanup.js";
import { execute } from "./process.js";
import { inspectArchive } from "./release/archive.js";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const { values } = parseArgs({ options: { from: { type: "string" } } });
const from = values.from ? resolve(values.from) : null;
const staging = await mkdtemp(join(tmpdir(), "mizen benchmark café "));
try {
	console.log(
		from
			? `Replaying saved benchmark inputs: ${from}`
			: "Packing benchmark inputs…"
	);
	await prepare(root, staging, from);
	const expected = JSON.parse(
		await readFile(join(root, "packages/cli/package.json"), "utf8")
	);
	// A replay can deliberately measure an older candidate.
	const previous = from
		? JSON.parse(await readFile(join(from, "benchmark.json"), "utf8"))
		: null;
	if (previous) {
		assert.equal(
			previous.schemaVersion,
			1,
			"Unsupported benchmark report schema."
		);
		assert.deepEqual(
			previous.protocol,
			protocol,
			"Benchmark protocol changed; replay with the matching harness revision."
		);
		assert.deepEqual(
			await inputHashes(staging),
			previous.inputs,
			"Saved benchmark inputs changed."
		);
	}
	const archive = await inspectArchive(join(staging, "mizen-cli.tgz"), {
		...expected,
		version: previous?.package.version ?? expected.version,
	});
	console.log("Installing CLI-only benchmark dependencies…");
	install(join(staging, "cli-only"), Boolean(from));
	const sizes = {
		archiveBytes: archive.record.bytes,
		installedBytes: await directoryBytes(
			join(staging, "cli-only/node_modules")
		),
		packageBytes: archive.record.files.reduce(
			(total, file) => total + file.size,
			0
		),
	};
	console.log("Installing app benchmark dependencies…");
	install(join(staging, "app"), Boolean(from));
	const binary = join(staging, "app/node_modules/@mizen-labs/cli/dist/cli.js");
	console.log("Measuring installed CLI processes…");
	const report = {
		commands: measure(binary, join(staging, "app")),
		environment: {
			architecture: arch(),
			cpu: cpus()[0]?.model ?? "unknown",
			cpuCount: cpus().length,
			freeMemoryBytes: freemem(),
			node: process.versions.node,
			npm: execute("npm", ["--version"]).trim(),
			osRelease: release(),
			platform: platform(),
			runner: process.env.RUNNER_ENVIRONMENT ?? "local",
			totalMemoryBytes: totalmem(),
		},
		fixture: {
			framework: "vite",
			lockfileSha256: createHash("sha256")
				.update(await readFile(join(staging, "app/package-lock.json")))
				.digest("hex"),
			status: "healthy",
		},
		git: {
			commit: execute("git", ["rev-parse", "HEAD"], { cwd: root }).trim(),
			dirty: Boolean(
				execute("git", ["status", "--porcelain"], { cwd: root }).trim()
			),
		},
		harness: await hashFiles(join(root, "packages/cli/scripts"), [
			"benchmark.js",
			"benchmark/fixtures.js",
			"benchmark/measure.js",
			"process.js",
			"release/archive.js",
		]),
		inputs: await inputHashes(staging),
		measuredAt: new Date().toISOString(),
		package: archive.record,
		protocol,
		replayedFrom: previous
			? {
					git: previous.git,
					measuredAt: previous.measuredAt,
					sha256: previous.package.sha256,
				}
			: null,
		schemaVersion: 1,
		sizes,
		workspaceLockfileSha256: createHash("sha256")
			.update(await readFile(join(root, "pnpm-lock.yaml")))
			.digest("hex"),
	};
	const output = join(root, "artifacts/benchmarks");
	await mkdir(output, { recursive: true });
	const destination = await mkdtemp(
		join(output, `cli-${platform()}-${arch()}-node-${process.versions.node}-`)
	);
	await retain(staging, destination);
	await writeJson(join(destination, "benchmark.json"), report);
	const summary = markdown(report);
	await writeFile(join(destination, "benchmark.md"), summary);
	if (process.env.GITHUB_STEP_SUMMARY) {
		await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
	}
	console.log(summary);
	console.log(`Benchmark evidence: ${destination}`);
} finally {
	await cleanup(staging);
}
