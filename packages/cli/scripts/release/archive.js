import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import semver from "semver";
import { list } from "tar";

const ALLOWED_PATH =
	/^(?:dist\/|src\/|schema\/|skills\/|package\.json$|LICENSE$|README\.md$|CHANGELOG\.md$)/u;
const RELATIVE_PREFIX = /^\.\//u;
const PACKAGE_PREFIX = /^package\//u;

export function validateVersions(ui, cli, root) {
	assert.ok(semver.valid(ui.version), "UI version must be valid semver.");
	assert.equal(cli.version, ui.version, "CLI and UI versions must match.");
	assert.equal(
		cli.engines.node,
		root.engines.node,
		"CLI and workspace Node ranges must match."
	);
	for (const manifest of [ui, cli]) {
		assert.equal(manifest.license, "MIT");
		assert.equal(manifest.publishConfig.access, "public");
		assert.ok(!manifest.private, `${manifest.name} must be publishable.`);
	}
}

function targets(value) {
	return typeof value === "string"
		? [value]
		: Object.values(value).flatMap(targets);
}

export function validateEntries(manifest, entries) {
	for (const name of ["package.json", "LICENSE", "README.md"]) {
		assert.ok(entries.get(name)?.size > 0, `${manifest.name}: missing ${name}`);
	}
	for (const entry of entries.values()) {
		assert.equal(entry.type, "File", `Unexpected archive entry: ${entry.path}`);
		assert.match(entry.path, ALLOWED_PATH);
		assert.ok(
			!entry.path
				.split("/")
				.some((part) =>
					["..", "node_modules", ".git", ".env", ".npmrc"].includes(part)
				),
			`Unexpected archive path: ${entry.path}`
		);
	}
	for (const target of [manifest.exports, manifest.bin]
		.filter(Boolean)
		.flatMap(targets)) {
		assert.ok(
			entries.get(target.replace(RELATIVE_PREFIX, ""))?.size > 0,
			`${manifest.name}: missing export ${target}`
		);
	}
}

export async function inspectArchive(file, expected) {
	const entries = new Map();
	const contents = new Map();
	await list({
		file,
		onReadEntry(entry) {
			const path = entry.path.replace(PACKAGE_PREFIX, "");
			entries.set(path, {
				mode: entry.mode,
				path,
				size: entry.size,
				type: entry.type,
			});
			if (["package.json", "dist/catalog.json", "dist/cli.js"].includes(path)) {
				const chunks = [];
				entry.on("data", (chunk) => chunks.push(chunk));
				entry.on("end", () =>
					contents.set(path, Buffer.concat(chunks).toString("utf8"))
				);
			}
		},
	});
	const manifest = JSON.parse(contents.get("package.json"));
	assert.equal(manifest.name, expected.name);
	assert.equal(manifest.version, expected.version);
	validateEntries(manifest, entries);
	const data = await readFile(file);
	return {
		contents,
		manifest,
		record: {
			bytes: data.length,
			files: [...entries.values()].sort((a, b) => a.path.localeCompare(b.path)),
			name: manifest.name,
			sha256: createHash("sha256").update(data).digest("hex"),
			version: manifest.version,
		},
	};
}

export function validateCatalog(ui, cli, slugs) {
	const catalog = JSON.parse(cli.contents.get("dist/catalog.json"));
	assert.equal(catalog.cliVersion, cli.manifest.version);
	assert.equal(catalog.uiVersion, ui.manifest.version);
	assert.equal(catalog.nodeRange, cli.manifest.engines.node);
	assert.deepEqual(
		catalog.uiPeerDependencies,
		ui.manifest.peerDependencies,
		"Packed catalog must match the UI peer ranges."
	);
	assert.deepEqual(
		catalog.components.map((item) => item.slug).sort(),
		[...slugs].sort(),
		"Packed catalog must match the documentation."
	);
	for (const item of catalog.components) {
		assert.ok(
			ui.manifest.exports[`./${item.slug}`],
			`Missing catalog export: ${item.slug}`
		);
	}
	assert.ok(
		cli.contents.get("dist/cli.js").startsWith("#!/usr/bin/env node\n"),
		"CLI must retain its executable shebang."
	);
}
