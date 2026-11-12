import { execFile } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { expect, it } from "vite-plus/test";
import { cleanup } from "../../../scripts/cleanup.mjs";

const uiRoot = new URL("../../../packages/ui/", import.meta.url).pathname;
const execute = promisify(execFile);
const CLIENT_BOUNDARY = /^"use client";/u;
// A length needs a unit. Browsers drop `border-width: 1`, and the border
// falls back to 3px. The docs build repairs such values; the archive must not
// need the repair.
const UNITLESS_LENGTH =
	/(?<![\w-])(?:(?:border|outline|inset|margin|padding|min|max)-[\w-]+|width|height|inset|gap|top|right|bottom|left|flex-basis|outline-offset|border-radius):-?(?:\d*\.)?\d*[1-9]\d*(?=[;}])/gu;

interface PackageExport {
	default: string;
	types: string;
}

interface PackageManifest {
	exports: Record<string, string | PackageExport>;
}

interface PackedPackage {
	files: { path: string }[];
}

it("packs every public export and preserves client boundaries", async () => {
	const destination = await mkdtemp(join(tmpdir(), "mizen-package-"));
	try {
		// Build explicitly so lifecycle settings cannot change the archive contents.
		await execute("pnpm", ["run", "build"], {
			cwd: uiRoot,
			killSignal: "SIGKILL",
			timeout: 180_000,
		});
		const { stdout } = await execute(
			"pnpm",
			[
				"pack",
				"--config.ignoreScripts=true",
				"--json",
				"--out",
				join(destination, "ui.tgz"),
			],
			{ cwd: uiRoot, killSignal: "SIGKILL", timeout: 30_000 }
		);
		const packed: PackedPackage = JSON.parse(stdout);
		const paths = packed.files.map(({ path }) => `./${path}`);
		const manifest: PackageManifest = JSON.parse(
			await readFile(join(uiRoot, "package.json"), "utf8")
		);
		const cssExport = manifest.exports["./styles.css"];
		expect(typeof cssExport).toBe("string");
		const css = await readFile(join(uiRoot, cssExport as string), "utf8");
		expect(css).not.toContain("@stylex;");
		// Both the default tokens and dark overrides must ship in the archive.
		expect(css).toContain("oklch(0.55 0.19 5)");
		expect(css).toContain("oklch(1 0 0)");
		expect(css).toContain("@media");
		expect(css.match(UNITLESS_LENGTH) ?? []).toEqual([]);
		// Every public token has a stable variable in the tokens layer. A themed
		// one holds the light and the dark value, and its hashed variable reads it.
		expect(css.startsWith("@layer mizen-tokens{")).toBe(true);
		expect(css.split("--mizen-color-content:oklch(").length - 1).toBe(2);
		expect(css.split(":var(--mizen-color-content)").length - 1).toBe(2);
		// Spacing, sizes, shadows and motion have one value for both themes.
		for (const scale of [
			"--mizen-space-1-5",
			"--mizen-control-size-md",
			"--mizen-shadow-floating",
			"--mizen-duration-fast",
			"--mizen-easing-spring",
		]) {
			expect(css.split(`${scale}:`).length - 1).toBe(1);
			expect(css.split(`:var(${scale})`).length - 1).toBe(1);
		}
		expect(css).toContain("--mizen-space-4:1rem");
		for (const constant of [
			"--mizen-border-width-thin:1px",
			"--mizen-palette-green500:oklch(0.63 0.14 150)",
			"--mizen-font-size-14:0.875rem",
		]) {
			expect(css).toContain(constant);
		}
		await Promise.all(
			Object.entries(manifest.exports).map(async ([name, entry]) => {
				const targets =
					typeof entry === "string" ? [entry] : Object.values(entry);
				for (const target of targets) {
					expect(paths, `${name} must ship ${target}`).toContain(target);
				}
				if (typeof entry === "string") {
					return;
				}
				const source = await readFile(join(uiRoot, entry.types), "utf8");
				if (source.startsWith('"use client";')) {
					const compiled = await readFile(join(uiRoot, entry.default), "utf8");
					expect(compiled, `${name} must retain its client boundary`).toMatch(
						CLIENT_BOUNDARY
					);
				}
			})
		);
	} finally {
		await cleanup(destination);
	}
}, 240_000);
