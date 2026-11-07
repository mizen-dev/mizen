import { execFile } from "node:child_process";
import { mkdir, readFile, realpath, rename, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";
import { promisify } from "node:util";
import { expect } from "vitest";

const MISSING_TRANSITIVE = /(?:TS7016|TS2307).*closed/u;
const execute = promisify(execFile);
const modes = [
	{
		customConditions: [],
		extension: "ts",
		module: "preserve",
		moduleResolution: "bundler",
		name: "bundler",
	},
	{
		customConditions: [],
		extension: "mts",
		module: "nodenext",
		moduleResolution: "nodenext",
		name: "node-import",
	},
	{
		customConditions: [],
		extension: "cts",
		module: "nodenext",
		moduleResolution: "nodenext",
		name: "node-require",
	},
	{
		customConditions: ["source"],
		extension: "ts",
		module: "preserve",
		moduleResolution: "bundler",
		name: "source",
	},
] as const;
function publicImport(name: string, index: number): string {
	if (name.includes("*")) {
		throw new Error("Add packed import cases for export patterns.");
	}
	const specifier = name === "." ? "@mizen/ui" : `@mizen/ui${name.slice(1)}`;
	return name.endsWith(".css")
		? `import ${JSON.stringify(specifier)};`
		: `import type * as Entry${index} from ${JSON.stringify(specifier)};\nexport type Surface${index} = typeof Entry${index};`;
}
/** Resolve real package imports from the installed archive, with no workspace paths. */
export async function verifyPackedPublicTypes(
	consumerRoot: string
): Promise<void> {
	const installed = join(consumerRoot, "node_modules/@mizen/ui");
	const actual = await realpath(installed);
	if (!actual.startsWith(`${await realpath(consumerRoot)}${sep}`)) {
		throw new Error("Public type audit must use the installed archive.");
	}
	const manifest = JSON.parse(
		await readFile(join(installed, "package.json"), "utf8")
	) as {
		exports: Record<string, unknown>;
		peerDependencies: Record<string, string>;
		peerDependenciesMeta: Record<string, { optional?: boolean }>;
	};
	const source = Object.keys(manifest.exports).map(publicImport).join("\n");
	const directory = join(consumerRoot, "public-type-audit");
	await mkdir(directory);
	await writeFile(
		join(directory, "assets.d.ts"),
		'declare module "*.css" {}\n'
	);

	await checkModes(
		consumerRoot,
		directory,
		source,
		modes.filter((mode) => mode.name !== "source")
	);
	// A negative control proves neither skipLibCheck nor workspace sources can
	// hide a missing transitive declaration in the installed package.
	const declaration = join(installed, "dist/closed.d.ts");
	const withheld = `${declaration}.withheld`;
	await rename(declaration, withheld);
	try {
		await expect(
			checkModes(consumerRoot, directory, source, [modes[0]])
		).rejects.toThrow(MISSING_TRANSITIVE);
	} finally {
		await rename(withheld, declaration);
	}
	// Source conditions expose optional feature implementations, so check them
	// with their declared peers after proving compiled imports work without them.
	const peers = Object.entries(manifest.peerDependenciesMeta)
		.filter(([, metadata]) => metadata.optional)
		.map(([name]) => `${name}@${manifest.peerDependencies[name]}`);
	if (peers.length) {
		await execute(
			"pnpm",
			[
				"add",
				"--save-dev",
				"--ignore-scripts",
				"--no-frozen-lockfile",
				...peers,
			],
			{ cwd: consumerRoot, timeout: 120_000 }
		);
	}
	await checkModes(
		consumerRoot,
		directory,
		source,
		modes.filter((mode) => mode.name === "source")
	);
}
async function checkModes(
	consumerRoot: string,
	directory: string,
	source: string,
	selected: readonly (typeof modes)[number][]
): Promise<void> {
	const results = await Promise.all(
		selected.map(async (mode) => {
			const file = `${mode.name}.${mode.extension}`;
			const config = join(directory, `${mode.name}.json`);
			await writeFile(join(directory, file), source);
			await writeFile(
				config,
				JSON.stringify({
					compilerOptions: {
						customConditions: mode.customConditions,
						jsx: "react-jsx",
						lib: ["esnext", "dom", "dom.iterable"],
						module: mode.module,
						moduleResolution: mode.moduleResolution,
						noEmit: true,
						skipLibCheck: false,
						strict: true,
						target: "es2022",
						types: ["react", "react-dom"],
					},
					files: [file, "assets.d.ts"],
				})
			);
			return execute("pnpm", ["exec", "tsc", "--project", config], {
				cwd: consumerRoot,
				maxBuffer: 8_000_000,
				timeout: 60_000,
			}).then(
				() => null,
				(failure: Error & { stdout?: string; stderr?: string }) =>
					`${mode.name}: ${failure.message}\n${failure.stdout ?? ""}\n${failure.stderr ?? ""}`
			);
		})
	);
	const failures = results.filter((result) => result !== null);
	if (failures.length) {
		throw new Error(failures.join("\n"));
	}
}
