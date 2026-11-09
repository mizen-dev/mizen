import assert from "node:assert/strict";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import semver from "semver";
import { execute } from "../process.js";
import { loadCandidate } from "./candidate.js";
import { github, verifyTag } from "./github.js";
import { finishGithubRelease } from "./github-release.js";
import {
	publishMissing,
	REPOSITORY,
	validateLatest,
	validateRun,
} from "./publication.js";
import {
	registryVersion,
	verifyPublished,
	waitForPackage,
} from "./registry.js";
import { verifyRegistryConsumer } from "./verify-consumer.js";

const RUN_ID_PATTERN = /^\d+$/u;
const root = fileURLToPath(new URL("../../../../", import.meta.url));
const [mode, directory, version] = process.argv.slice(2);
assert.ok(
	["verify", "publish", "smoke", "finalize"].includes(mode),
	"Use verify, publish, smoke, or finalize mode."
);
assert.ok(
	directory && version,
	"Provide the downloaded artifact directory and version."
);
const candidate = await loadCandidate(root, resolve(directory), version);
console.log(`Verified ${version} archives from ${candidate.commit}.`);

async function guardPublication() {
	assert.equal(
		process.env.GITHUB_ACTIONS,
		"true",
		"Publish only through the manual workflow."
	);
	assert.equal(process.env.GITHUB_REPOSITORY, REPOSITORY);
	assert.equal(process.env.GITHUB_EVENT_NAME, "workflow_dispatch");
	assert.equal(process.env.GITHUB_REF, "refs/heads/main");
	assert.match(process.env.CI_RUN_ID ?? "", RUN_ID_PATTERN);
	const npmVersion = execute("npm", ["--version"]).trim();
	assert.ok(
		semver.satisfies(npmVersion, ">=11.21.0 <12 || >=12.2.0"),
		`npm ${npmVersion} does not support OIDC dist-tag management. Check PATH.`
	);
	const commit = validateRun(
		await github(`actions/runs/${process.env.CI_RUN_ID}`)
	);
	assert.equal(candidate.commit, commit);
	assert.equal(
		commit,
		process.env.GITHUB_SHA,
		"Provenance must identify the tested source commit."
	);
	await verifyTag(`v${version}`, commit);
}

async function checkLatest() {
	await Promise.all(
		candidate.archives.map(async ({ manifest }) => {
			const latest = await registryVersion(manifest.name, "latest");
			validateLatest(version, latest?.version);
		})
	);
}

async function publish() {
	await guardPublication();
	await checkLatest();
	const packages = candidate.archives.map(({ record, file }) => ({
		...record,
		file,
	}));
	await publishMissing(
		packages,
		(item) => registryVersion(item.name, version),
		(item) =>
			execute(
				"npm",
				[
					"publish",
					item.file,
					"--access",
					"public",
					"--tag",
					"release-candidate",
					"--provenance",
					"--ignore-scripts",
					"--registry",
					"https://registry.npmjs.org/",
				],
				{ cwd: root }
			),
		verifyPublished
	);
	await Promise.all(packages.map((item) => waitForPackage(item)));
}

async function finalize() {
	await guardPublication();
	await Promise.all(
		candidate.archives.map(({ record }) => waitForPackage(record))
	);
	await checkLatest();
	for (const { record: item } of candidate.archives) {
		execute(
			"npm",
			[
				"dist-tag",
				"add",
				`${item.name}@${version}`,
				"latest",
				"--registry",
				"https://registry.npmjs.org/",
			],
			{ cwd: root }
		);
	}
	await finishGithubRelease(candidate);
	console.log(
		`Released ${version}. Verify this version in the original consumer workflow separately.`
	);
}

if (mode === "publish") {
	await publish();
}
if (mode === "smoke") {
	await Promise.all(
		candidate.archives.map(({ record }) => waitForPackage(record))
	);
	await verifyRegistryConsumer(root, version);
}
if (mode === "finalize") {
	await finalize();
}
