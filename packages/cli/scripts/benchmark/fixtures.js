import { createHash } from "node:crypto";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { execute } from "../process.js";

export async function writeJson(path, value) {
	await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export async function prepare(root, staging, from) {
	if (from) {
		for (const name of ["mizen-cli.tgz", "mizen-ui.tgz", "cli-only", "app"]) {
			// biome-ignore lint/performance/noAwaitInLoops: Copy the small evidence set without copying installed dependencies.
			await retain(join(from, name), join(staging, name));
		}
		return;
	}
	for (const name of ["cli", "ui"]) {
		execute("pnpm", ["pack", "--out", join(staging, `mizen-${name}.tgz`)], {
			cwd: join(root, "packages", name),
		});
	}
	const vite = JSON.parse(
		await readFile(
			join(root, "apps/docs/tests/package-consumer-vite/package.json"),
			"utf8"
		)
	);
	await mkdir(join(staging, "cli-only"));
	await mkdir(join(staging, "app/src"), { recursive: true });
	await writeJson(join(staging, "cli-only/package.json"), {
		dependencies: { "@mizen-labs/cli": "file:../mizen-cli.tgz" },
		private: true,
	});
	await writeJson(join(staging, "app/package.json"), {
		dependencies: {
			...vite.dependencies,
			"@mizen-labs/cli": "file:../mizen-cli.tgz",
			"@mizen-labs/ui": "file:../mizen-ui.tgz",
			vite: vite.devDependencies.vite,
		},
		name: "mizen-cli-benchmark-app",
		private: true,
		type: "module",
	});
	await writeFile(
		join(staging, "app/index.html"),
		'<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>\n'
	);
	await writeFile(
		join(staging, "app/src/main.jsx"),
		`import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mizen-labs/ui/theme";
import { initializeTheme } from "@mizen-labs/ui/theme/initialize";
import "@mizen-labs/ui/styles.css";
initializeTheme();
createRoot(document.getElementById("root")).render(<ThemeProvider><main>Benchmark</main></ThemeProvider>);
`
	);
}

export function install(directory, replay) {
	execute(
		"npm",
		[
			replay ? "ci" : "install",
			"--ignore-scripts",
			"--no-audit",
			"--no-fund",
			"--omit=dev",
		],
		{ cwd: directory }
	);
}

export async function retain(staging, destination) {
	await cp(staging, destination, {
		filter: (source) => basename(source) !== "node_modules",
		recursive: true,
	});
}

export function inputHashes(directory) {
	const paths = [
		"mizen-cli.tgz",
		"mizen-ui.tgz",
		"cli-only/package.json",
		"cli-only/package-lock.json",
		"app/package.json",
		"app/package-lock.json",
		"app/src/main.jsx",
		"app/index.html",
	];
	return hashFiles(directory, paths);
}

export async function hashFiles(directory, paths) {
	return Object.fromEntries(
		await Promise.all(
			paths.map(async (path) => [
				path,
				createHash("sha256")
					.update(await readFile(join(directory, path)))
					.digest("hex"),
			])
		)
	);
}
