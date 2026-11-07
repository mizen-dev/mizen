import { createHash } from "node:crypto";
import {
	copyFile,
	mkdir,
	mkdtemp,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import { arch, platform, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execute } from "./process.js";
import {
	inspectArchive,
	validateCatalog,
	validateVersions,
} from "./release/archive.js";
import { checkConsumer, copyConsumerEvidence } from "./release/consumers.js";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const json = async (path) =>
	JSON.parse(await readFile(join(root, path), "utf8"));
const [ui, cli, workspace, registry, fixture] = await Promise.all([
	json("packages/ui/package.json"),
	json("packages/cli/package.json"),
	json("package.json"),
	json("apps/docs/app/docs-registry-data.json"),
	json("apps/docs/tests/package-consumer/package.json"),
]);
validateVersions(ui, cli, workspace);
// Outside the workspace, with spaces and Unicode to exercise path quoting.
const staging = await mkdtemp(join(tmpdir(), "mizen release café "));
try {
	const archives = await Promise.all(
		["ui", "cli"].map((name) => {
			// Do not rely on prepack: users may disable lifecycle scripts globally.
			const cwd = join(root, "packages", name);
			execute("pnpm", ["run", "build"], { cwd });
			const file = join(staging, `mizen-${name}.tgz`);
			execute("pnpm", ["pack", "--config.ignoreScripts=true", "--out", file], {
				cwd,
			});
			return inspectArchive(file, name === "ui" ? ui : cli);
		})
	);
	validateCatalog(
		archives[0],
		archives[1],
		registry.map((item) => item.slug)
	);
	const consumers = [];
	for (const manager of ["npm", "pnpm"]) {
		console.log(`Checking isolated ${manager} consumer…`);
		consumers.push(
			// biome-ignore lint/performance/noAwaitInLoops: Attribute installation failures to one isolated consumer at a time.
			await checkConsumer(
				staging,
				manager,
				ui.version,
				fixture.dependencies.react,
				workspace.packageManager
			)
		);
	}
	const output = join(root, "artifacts/release");
	await mkdir(output, { recursive: true });
	const destination = await mkdtemp(join(output, `mizen-${ui.version}-`));
	await Promise.all(
		["ui", "cli"].map((name) =>
			copyFile(
				join(staging, `mizen-${name}.tgz`),
				join(destination, `mizen-${name}.tgz`)
			)
		)
	);
	await Promise.all(
		consumers.map((consumer) =>
			copyConsumerEvidence(staging, destination, consumer)
		)
	);
	const manifest = {
		architecture: arch(),
		checkedAt: new Date().toISOString(),
		consumers,
		git: {
			commit: execute("git", ["rev-parse", "HEAD"], { cwd: root }).trim(),
			dirty: Boolean(
				execute("git", ["status", "--porcelain"], { cwd: root }).trim()
			),
		},
		lockfileSha256: createHash("sha256")
			.update(await readFile(join(root, "pnpm-lock.yaml")))
			.digest("hex"),
		node: process.versions.node,
		packages: archives.map((archive) => archive.record),
		platform: platform(),
		schemaVersion: 1,
	};
	await writeFile(
		join(destination, "release-manifest.json"),
		`${JSON.stringify(manifest, null, 2)}\n`
	);
	console.log(`Release checks passed. Candidate: ${destination}`);
} finally {
	await rm(staging, { force: true, recursive: true });
}
