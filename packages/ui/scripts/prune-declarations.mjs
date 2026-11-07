import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import {
	mkdtemp,
	readdir,
	readFile,
	rm,
	unlink,
	writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TYPESCRIPT_FILE = /\.(?:[cm]?ts|tsx)$/u;
const DECLARATION_FILE = /\.d\.[cm]?ts$/u;
const NEWLINE = /\r?\n/u;
const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const manifest = JSON.parse(
	await readFile(resolve(root, "package.json"), "utf8")
);

// Unknown export layouts must stop the build, never silently lose type roots.
function targets(value) {
	if (value === null || value === undefined) {
		return [];
	}
	if (typeof value === "string") {
		if (value.includes("*")) {
			throw new Error("Expand wildcard exports before pruning declarations.");
		}
		return [value];
	}
	if (typeof value !== "object") {
		throw new Error("Invalid package export target.");
	}
	return Object.values(value).flatMap(targets);
}
function typeRoots(target) {
	const file = resolve(root, target);
	if (TYPESCRIPT_FILE.test(file)) {
		return [file];
	}
	const suffixes = { ".cjs": ".d.cts", ".js": ".d.ts", ".mjs": ".d.mts" };
	const suffix = Object.keys(suffixes).find((extension) =>
		file.endsWith(extension)
	);
	if (!suffix) {
		return [];
	}
	const declaration = file.slice(0, -suffix.length) + suffixes[suffix];
	return existsSync(declaration) ? [declaration] : [];
}
if (manifest.typesVersions || manifest.imports) {
	throw new Error(
		"Account for typesVersions and package imports before pruning declarations."
	);
}
const entries = [
	...new Set(
		[
			...targets(manifest.exports),
			...targets(manifest.types),
			...targets(manifest.typings),
		].flatMap(typeRoots)
	),
];
if (!entries.length) {
	throw new Error(
		"Cannot prune declarations without public type entry points."
	);
}

async function publicGraph() {
	const temporary = await mkdtemp(join(tmpdir(), "mizen-declaration-graph-"));
	try {
		const assets = join(temporary, "assets.d.ts");
		// CSS is consumed by the bundler; checking declarations still must diagnose
		// missing TypeScript imports, references and semantic errors.
		await writeFile(assets, 'declare module "*.css" {}\n');
		const graph = execFileSync(
			process.execPath,
			[
				resolve(dirname(require.resolve("typescript/package.json")), "bin/tsc"),
				"--ignoreConfig",
				"--listFiles",
				"--noEmit",
				"--strict",
				"--skipLibCheck",
				"false",
				"--module",
				"preserve",
				"--moduleResolution",
				"bundler",
				"--target",
				"es2022",
				"--lib",
				"esnext,dom,dom.iterable",
				"--jsx",
				"react-jsx",
				...entries,
				assets,
			],
			{ cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
		);
		return new Set(
			graph
				.trim()
				.split(NEWLINE)
				.map((file) => resolve(file))
		);
	} finally {
		await rm(temporary, { force: true, recursive: true });
	}
}
const retained = await publicGraph();
for (const entry of entries) {
	if (!retained.has(entry)) {
		throw new Error(`Public declaration missing from compiler graph: ${entry}`);
	}
}
const dist = resolve(root, "dist");
const files = await readdir(dist, { recursive: true });
const unused = files.filter(
	(file) => DECLARATION_FILE.test(file) && !retained.has(resolve(dist, file))
);
const removed = unused.flatMap((file) => [
	file,
	...(files.includes(`${file}.map`) ? [`${file}.map`] : []),
]);
await Promise.all(removed.map((file) => unlink(resolve(dist, file))));
console.log(
	`Removed ${unused.length} declarations outside the public type graph.`
);
