import assert from "node:assert/strict";
import { appendFile } from "node:fs/promises";
import { github } from "./github.js";
import { ARTIFACT, REPOSITORY, validateRun } from "./publication.js";

assert.equal(process.env.GITHUB_REPOSITORY, REPOSITORY);
assert.equal(process.env.GITHUB_REF, "refs/heads/main");
assert.match(process.env.CI_RUN_ID ?? "", /^\d+$/u);
const run = await github(`actions/runs/${process.env.CI_RUN_ID}`);
const commit = validateRun(run);
assert.equal(
	commit,
	process.env.GITHUB_SHA,
	"Dispatch Release from the commit that passed CI. Re-run the original release workflow when retrying."
);
const { artifacts } = await github(
	`actions/runs/${run.id}/artifacts?per_page=100`
);
const candidates = artifacts.filter((item) => item.name === ARTIFACT);
assert.equal(
	candidates.length,
	1,
	"CI must retain exactly one canonical artifact."
);
assert.equal(
	candidates[0].expired,
	false,
	"Release artifact expired. Re-run CI for the same commit."
);
assert.equal(candidates[0].workflow_run.head_sha, commit);
await appendFile(process.env.GITHUB_OUTPUT, `commit=${commit}\n`);
console.log(`Selected ${ARTIFACT} from CI run ${run.id}, commit ${commit}.`);
