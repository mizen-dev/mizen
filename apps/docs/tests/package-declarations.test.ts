import { execFile } from "node:child_process";
import {
	copyFile,
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	symlink,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { expect, it } from "vitest";

const execute = promisify(execFile);
const workspace = new URL("../../../", import.meta.url).pathname;
async function fixture(overrides: Record<string, unknown> = {}) {
	const root = await mkdtemp(join(tmpdir(), "mizen-type-graph-"));
	await Promise.all([mkdir(join(root, "scripts")), mkdir(join(root, "dist"))]);
	await copyFile(
		join(workspace, "packages/ui/scripts/prune-declarations.mjs"),
		join(root, "scripts/prune-declarations.mjs")
	);
	await symlink(
		join(workspace, "node_modules"),
		join(root, "node_modules"),
		"dir"
	);
	await writeFile(
		join(root, "package.json"),
		JSON.stringify({
			exports: {
				".": { default: "./dist/index.js", types: "./dist/index.d.ts" },
			},
			name: "type-graph-fixture",
			type: "module",
			...overrides,
		})
	);
	return root;
}
it("keeps transitive public types and leaves runtime assets intact", async () => {
	const root = await fixture();
	const files = {
		"details.d.ts":
			'import type { Color } from "./required.styles"; export interface Public { color: Color; value: import("./dynamic.js").Value; }',
		"dynamic.d.ts": "export interface Value { id: string; }",
		"index.d.ts": 'export type { Public } from "./details";',
		"index.js": 'export const value = "unchanged";',
		"required.styles.d.ts": 'export type Color = "red" | "blue";',
		"styles.css": ".control { color: red; }",
		"unused.d.ts": "export declare const internal: string;",
		"unused.js": 'export const internal = "also unchanged";',
	};
	try {
		await Promise.all(
			Object.entries(files).map(([name, source]) =>
				writeFile(join(root, "dist", name), source)
			)
		);
		await execute(process.execPath, [
			join(root, "scripts/prune-declarations.mjs"),
		]);
		expect((await readdir(join(root, "dist"))).sort()).toEqual(
			Object.keys(files)
				.filter((name) => name !== "unused.d.ts")
				.sort()
		);
		await Promise.all(
			["index.js", "unused.js", "styles.css"].map(async (name) => {
				expect(await readFile(join(root, "dist", name), "utf8")).toBe(
					files[name as keyof typeof files]
				);
			})
		);
	} finally {
		await rm(root, { force: true, recursive: true });
	}
});
it("leaves declarations intact when a public entry is missing", async () => {
	const root = await fixture();
	try {
		await writeFile(
			join(root, "dist", "keep.d.ts"),
			"export type Keep = string;"
		);
		await expect(
			execute(process.execPath, [join(root, "scripts/prune-declarations.mjs")])
		).rejects.toThrow();
		expect(await readFile(join(root, "dist", "keep.d.ts"), "utf8")).toBe(
			"export type Keep = string;"
		);
	} finally {
		await rm(root, { force: true, recursive: true });
	}
});

async function populate(root: string, files: Record<string, string>) {
	await Promise.all(
		Object.entries(files).map(async ([name, contents]) => {
			const file = join(root, name);
			await mkdir(dirname(file), { recursive: true });
			await writeFile(file, contents);
		})
	);
}
async function prune(root: string) {
	await execute(process.execPath, [
		join(root, "scripts/prune-declarations.mjs"),
	]);
}
it("retains nested conditions, fallback targets, source imports and implicit declarations", async () => {
	const root = await fixture({
		exports: {
			".": { default: "./dist/index.js", types: "./dist/index.d.ts" },
			"./blocked": null,
			"./dual": {
				import: { default: "./dist/esm.mjs", types: "./dist/esm.d.mts" },
				require: { default: "./dist/cjs.cjs", types: "./dist/cjs.d.cts" },
			},
			"./fallback": [
				null,
				{ default: "./dist/fallback.js", types: "./dist/fallback.d.ts" },
			],
			"./implicit": "./dist/implicit.js",
			"./source": "./src/public.ts",
		},
		types: "./dist/legacy.d.ts",
	});
	const required = {
		"dist/cjs-helper.d.cts": "export interface CJS { id:number; }",
		"dist/cjs.d.cts":
			'import helper = require("./cjs-helper.cjs"); export type CJS = helper.CJS;',
		"dist/esm-helper.d.mts": "export interface ESM { id:string; }",
		"dist/esm.d.mts": 'export type { ESM } from "./esm-helper.mjs";',
		"dist/fallback.d.ts": "export type Fallback = string;",
		"dist/from-source.d.ts": "export type Source = string;",
		"dist/from-source.d.ts.map": "kept map",
		"dist/implicit.d.ts": "export type Implicit = boolean;",
		"dist/index.d.ts": "export type Root = string;",
		"dist/legacy.d.ts": "export type Legacy = string;",
		"src/public.ts": 'export type { Source } from "../dist/from-source";',
	};
	try {
		await populate(root, {
			...required,
			"dist/unused.d.cts": "export {};",
			"dist/unused.d.mts": "export {};",
			"dist/unused.d.mts.map": "orphan map",
			"dist/unused.d.ts": "export {};",
		});
		await prune(root);
		expect((await readdir(join(root, "dist"))).sort()).toEqual(
			Object.keys(required)
				.filter((name) => name.startsWith("dist/"))
				.map((name) => name.slice(5))
				.sort()
		);
		expect(await readFile(join(root, "src/public.ts"), "utf8")).toBe(
			required["src/public.ts"]
		);
	} finally {
		await rm(root, { force: true, recursive: true });
	}
});
it("retains cyclic imports and triple-slash ambient references", async () => {
	const root = await fixture();
	try {
		await populate(root, {
			"dist/a.d.ts":
				'import type { B } from "./b"; export interface A { next?: B; }',
			"dist/b.d.ts":
				'import type { A } from "./a"; export interface B { next?: A; }',
			"dist/global.d.ts": "interface SharedContext { id: string; }",
			"dist/index.d.ts":
				'/// <reference path="./global.d.ts" />\nexport type { A } from "./a"; export type Context = SharedContext;',
			"dist/unused.d.ts": "export {};",
		});
		await prune(root);
		expect((await readdir(join(root, "dist"))).sort()).toEqual([
			"a.d.ts",
			"b.d.ts",
			"global.d.ts",
			"index.d.ts",
		]);
	} finally {
		await rm(root, { force: true, recursive: true });
	}
});
it.each([
	'export type { Missing } from "./missing";',
	'export type Missing = import("./missing").Missing;',
	'/// <reference path="./missing.d.ts" />\nexport {};',
	"export type Invalid = UnknownType;",
	"export interface Invalid {",
])(
	"does not delete anything after invalid transitive type input: %s",
	async (source) => {
		const root = await fixture();
		try {
			await populate(root, {
				"dist/index.d.ts": source,
				"dist/keep.d.ts": "export type Keep = string;",
			});
			await expect(prune(root)).rejects.toThrow();
			expect((await readdir(join(root, "dist"))).sort()).toEqual([
				"index.d.ts",
				"keep.d.ts",
			]);
		} finally {
			await rm(root, { force: true, recursive: true });
		}
	}
);
it.each([
	{ exports: { ".": { types: "./dist/index.d.ts" }, "./*": "./dist/*.js" } },
	{ typesVersions: { "*": { "*": ["dist/*"] } } },
	{ imports: { "#internal": "./dist/internal.js" } },
])(
	"stops before pruning when the manifest needs additional resolution rules: %j",
	async (overrides) => {
		const root = await fixture(overrides);
		try {
			await populate(root, {
				"dist/index.d.ts": "export {};",
				"dist/keep.d.ts": "export {};",
			});
			await expect(prune(root)).rejects.toThrow();
			expect((await readdir(join(root, "dist"))).sort()).toEqual([
				"index.d.ts",
				"keep.d.ts",
			]);
		} finally {
			await rm(root, { force: true, recursive: true });
		}
	}
);
