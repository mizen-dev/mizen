import assert from "node:assert/strict";
import { test } from "node:test";
import {
	validateCatalog,
	validateEntries,
	validateVersions,
} from "../scripts/release/archive.js";

const ERROR_6 = /catalog must match/u;
const ERROR_5 = /Unexpected archive path/u;
const ERROR_4 = /missing LICENSE/u;
const ERROR_3 = /missing export/u;
const ERROR_2 = /Node ranges must match/u;
const ERROR_1 = /publishable/u;
const ERROR_0 = /versions must match/u;

const ui = {
	exports: { ".": { default: "./dist/index.js", types: "./dist/index.d.ts" } },
	license: "MIT",
	name: "@mizen-labs/ui",
	publishConfig: { access: "public" },
	version: "0.1.0",
};
const cli = {
	...ui,
	engines: { node: ">=22.18.0 <23 || >=24.11.0" },
	name: "@mizen-labs/cli",
};

function entries() {
	return new Map(
		[
			"package.json",
			"LICENSE",
			"README.md",
			"dist/index.js",
			"dist/index.d.ts",
		].map((path) => [path, { path, size: 1, type: "File" }])
	);
}

test("release rejects version skew and incompatible publication metadata", () => {
	validateVersions(ui, cli, cli);
	assert.throws(
		() => validateVersions(ui, { ...cli, version: "0.2.0" }, cli),
		ERROR_0
	);
	assert.throws(
		() => validateVersions(ui, { ...cli, private: true }, cli),
		ERROR_1
	);
	assert.throws(
		() => validateVersions(ui, cli, { engines: { node: ">=24" } }),
		ERROR_2
	);
});

test("release checks actual archive exports, licenses, and unexpected entries", () => {
	const files = entries();
	validateEntries(ui, files);
	// The UI archive ships its agent skill beside dist.
	const skill = "skills/mizen-ui/SKILL.md";
	const shipped = {
		...ui,
		exports: { ...ui.exports, [`./${skill}`]: `./${skill}` },
	};
	assert.throws(() => validateEntries(shipped, files), ERROR_3);
	files.set(skill, { path: skill, size: 1, type: "File" });
	validateEntries(shipped, files);
	files.delete("dist/index.d.ts");
	assert.throws(() => validateEntries(ui, files), ERROR_3);
	files.set("dist/index.d.ts", {
		path: "dist/index.d.ts",
		size: 1,
		type: "File",
	});
	files.delete("LICENSE");
	assert.throws(() => validateEntries(ui, files), ERROR_4);
	files.set("LICENSE", { path: "LICENSE", size: 1, type: "File" });
	files.set("dist/.env", { path: "dist/.env", size: 1, type: "File" });
	assert.throws(() => validateEntries(ui, files), ERROR_5);
});

test("release rejects a stale packed catalog even when package versions match", () => {
	const catalog = {
		cliVersion: cli.version,
		components: [{ slug: "button" }],
		nodeRange: cli.engines.node,
		uiPeerDependencies: { react: "^19.2.8" },
		uiVersion: ui.version,
	};
	const packed = {
		contents: new Map([
			["dist/catalog.json", JSON.stringify(catalog)],
			["dist/cli.js", "#!/usr/bin/env node\n"],
		]),
		manifest: cli,
	};
	const library = {
		manifest: {
			...ui,
			exports: { "./button": "./dist/button.js" },
			peerDependencies: catalog.uiPeerDependencies,
		},
	};
	validateCatalog(library, packed, ["button"]);
	assert.throws(
		() => validateCatalog(library, packed, ["button", "dialog"]),
		ERROR_6
	);
	packed.contents.set(
		"dist/catalog.json",
		JSON.stringify({ ...catalog, uiPeerDependencies: { react: "^18.0.0" } })
	);
	assert.throws(() => validateCatalog(library, packed, ["button"]), ERROR_6);
	packed.contents.set(
		"dist/catalog.json",
		JSON.stringify({ ...catalog, uiVersion: "0.0.1" })
	);
	assert.throws(() => validateCatalog(library, packed, ["button"]));
});

test("release checks both the CLI binary and exported schema", () => {
	const manifest = {
		...cli,
		bin: { mizen: "./dist/cli.js" },
		exports: { "./schema/v1.json": "./schema/v1.json" },
	};
	const files = entries();
	files.set("schema/v1.json", {
		path: "schema/v1.json",
		size: 1,
		type: "File",
	});
	assert.throws(() => validateEntries(manifest, files), ERROR_3);
	files.set("dist/cli.js", { path: "dist/cli.js", size: 1, type: "File" });
	validateEntries(manifest, files);
	files.delete("schema/v1.json");
	assert.throws(() => validateEntries(manifest, files), ERROR_3);
});
