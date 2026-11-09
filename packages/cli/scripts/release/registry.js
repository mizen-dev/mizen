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

export async function verifyPublished(record, candidate) {
	const url = new URL(record.dist.tarball);
	assert.equal(url.origin, "https://registry.npmjs.org");
	const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
	assert.ok(
		response.ok,
		`Could not download published archive: ${response.status}`
	);
	validatePublished(
		record,
		Buffer.from(await response.arrayBuffer()),
		candidate
	);
}

export async function waitForPackage(candidate, attempt = 0) {
	const record = await registryVersion(candidate.name, candidate.version);
	if (record) {
		await verifyPublished(record, candidate);
		return;
	}
	assert.ok(
		attempt < 5,
		"Published version is not visible yet. Retry this release with the same CI run."
	);
	await delay(5000);
	return waitForPackage(candidate, attempt + 1);
}
