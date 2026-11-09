import assert from "node:assert/strict";
import { REPOSITORY } from "./publication.js";

export async function github(
	path,
	{ method = "GET", body, missing = false } = {}
) {
	assert.ok(process.env.GH_TOKEN, "GH_TOKEN is required.");
	const response = await fetch(
		`https://api.github.com/repos/${REPOSITORY}/${path}`,
		{
			body: body && JSON.stringify(body),
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: `Bearer ${process.env.GH_TOKEN}`,
				"Content-Type": "application/json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
			method,
			signal: AbortSignal.timeout(30_000),
		}
	);
	if (missing && response.status === 404) {
		return null;
	}
	assert.ok(response.ok, `GitHub ${method} ${path}: ${response.status}`);
	return response.json();
}

export async function verifyTag(tag, commit) {
	const ref = await github(`git/ref/tags/${tag}`, { missing: true });
	if (!ref) {
		return false;
	}
	assert.equal(ref.object.type, "tag", "Release tags must be annotated.");
	const object = await github(`git/tags/${ref.object.sha}`);
	assert.equal(object.object.type, "commit");
	assert.equal(
		object.object.sha,
		commit,
		"Existing release tag points to another commit."
	);
	return true;
}

export async function ensureTag(tag, commit) {
	if (await verifyTag(tag, commit)) {
		return;
	}
	const object = await github("git/tags", {
		body: { message: `Mizen ${tag}`, object: commit, tag, type: "commit" },
		method: "POST",
	});
	await github("git/refs", {
		body: { ref: `refs/tags/${tag}`, sha: object.sha },
		method: "POST",
	});
}
