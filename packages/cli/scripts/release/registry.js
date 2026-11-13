import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { validatePublished } from "./publication.js";

export async function registryVersion(name, version) {
	const response = await fetch(
		`https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
		{
			signal: AbortSignal.timeout(30_000),
		}
	);
	if (response.status === 404) {
		return null;
	}
	assert.ok(
		response.ok,
		`npm registry returned ${response.status} for ${name}@${version}.`
	);
	return response.json();
}

// npm can list a version several minutes before it serves the archive, so a
// missing archive of a listed version is waited for, up to ten minutes.
async function download(url, pause, attempt = 0) {
	const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
	if (response.status === 404 && attempt < 60) {
		await delay(pause);
		return download(url, pause, attempt + 1);
	}
	assert.ok(
		response.ok,
		`Could not download published archive: ${response.status}. If npm lists the version, wait until it serves the archive, then re-run the failed jobs.`
	);
	return Buffer.from(await response.arrayBuffer());
}

export async function verifyPublished(record, candidate, pause = 10_000) {
	const url = new URL(record.dist.tarball);
	assert.equal(url.origin, "https://registry.npmjs.org");
	validatePublished(record, await download(url, pause), candidate);
}

export async function waitForPackage(candidate, attempt = 0) {
	const record = await registryVersion(candidate.name, candidate.version);
	if (record) {
		await verifyPublished(record, candidate);
		return;
	}
	// npm can take several minutes to list a version it has accepted.
	assert.ok(
		attempt < 60,
		"Published version is not visible yet. Wait until npm view lists it, then re-run the failed jobs."
	);
	await delay(10_000);
	return waitForPackage(candidate, attempt + 1);
}
