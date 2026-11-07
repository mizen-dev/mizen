import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getComponentGuidance } from "../app/component-guidance";
import { componentDocs, renderComponentMarkdown } from "../app/docs-registry";
import {
	findExampleSource,
	getUsageExamples,
	renderExampleMarkdown,
} from "../app/example-sources";

const themeOnlyTitle = /dark.?theme|local theme/i;
const themeOnlyName = /DarkThemeComposition|LocallyThemed/;

describe("documentation sources", () => {
	it("omits dedicated theme previews from public component examples", () => {
		for (const component of componentDocs) {
			for (const usage of getUsageExamples(component.slug)) {
				expect(usage.title).not.toMatch(themeOnlyTitle);
				expect(usage.name).not.toMatch(themeOnlyName);
			}
		}
	});
	it("typechecks and lints copied usage examples independently", () => {
		const docsRoot = new URL("..", import.meta.url).pathname;
		const directory = mkdtempSync(join(docsRoot, ".usage-check-"));
		const names = new Map<string, string>();
		try {
			for (const component of componentDocs) {
				for (const usage of getUsageExamples(component.slug)) {
					const previous = names.get(usage.name.toLowerCase());
					if (previous) {
						expect(usage.code).toBe(previous);
						continue;
					}
					names.set(usage.name.toLowerCase(), usage.code);
					writeFileSync(
						join(directory, `${usage.name.toLowerCase()}.tsx`),
						usage.code
					);
				}
			}
			writeFileSync(
				join(directory, "tsconfig.json"),
				JSON.stringify({
					exclude: [],
					extends: "../tsconfig.json",
					include: ["*.tsx"],
				})
			);
			execFileSync(
				"pnpm",
				["exec", "tsc", "--project", join(directory, "tsconfig.json")],
				{ cwd: docsRoot, stdio: "inherit" }
			);
			execFileSync(
				"pnpm",
				["exec", "biome", "lint", "--vcs-enabled=false", directory],
				{
					cwd: docsRoot,
					stdio: "inherit",
				}
			);
		} finally {
			rmSync(directory, { force: true, recursive: true });
		}
	});
	it("keeps every published example and supporting file equal to its preview source", () => {
		execFileSync(process.execPath, [
			new URL("../scripts/sync-example-sources.mjs", import.meta.url).pathname,
			"--check",
		]);
		for (const component of componentDocs) {
			// A component previews its specimen, or else its first usage example.
			const example = findExampleSource(component.slug);
			expect(getUsageExamples(component.slug).length).toBeGreaterThan(0);
			expect(example === null || example.files.length > 0).toBe(true);
			const markdown = renderExampleMarkdown(component.slug);
			for (const usage of getUsageExamples(component.slug)) {
				const source = readFileSync(
					new URL(`../app/${usage.path}`, import.meta.url),
					"utf8"
				);
				expect(source).toContain(
					usage.code
						.slice(usage.code.indexOf(`export function ${usage.name}(`))
						.trimEnd()
				);
				expect(markdown).toContain(usage.code.trimEnd());
			}
			for (const file of example?.files ?? []) {
				expect(file.code).toBe(
					readFileSync(new URL(`../app/${file.path}`, import.meta.url), "utf8")
				);
				expect(markdown).toContain(file.code.trimEnd());
			}
			const guidance = getComponentGuidance(component);
			expect(guidance.recommendations.length).toBeGreaterThan(0);
			expect(guidance.boundaries.length).toBeGreaterThan(0);
			for (const boundary of guidance.boundaries) {
				expect(renderComponentMarkdown(component)).toContain(boundary);
			}
		}
	});
});
