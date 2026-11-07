import sourceData from "./example-sources.json";

interface ExampleEntry {
	exportName: string;
	files: string[];
}

const entries: Record<string, ExampleEntry> = sourceData.entries;
const files: Record<string, string> = sourceData.files;

interface UsageExample {
	code: string;
	description: string;
	name: string;
	path: string;
	title: string;
}

export function getUsageExamples(slug: string): UsageExample[] {
	const usage: Record<string, UsageExample[]> = sourceData.usage;
	return usage[slug] ?? [];
}

/** The full preview source, when the component has a dedicated specimen. */
export function findExampleSource(slug: string) {
	const entry = entries[slug];
	return entry
		? {
				exportName: entry.exportName,
				files: entry.files.map((path) => ({ code: files[path], path })),
			}
		: null;
}

export function getExampleSource(slug: string) {
	const example = findExampleSource(slug);
	if (!example) {
		throw new Error(`Example source is missing for ${slug}`);
	}
	return example;
}

function specimenMarkdown(
	example: NonNullable<ReturnType<typeof findExampleSource>>
) {
	return [
		"## Example code",
		"",
		`Render \`${example.exportName}\` from the first file. Keep supporting files at the shown relative paths. These are the full preview sources, including demo layout and sample data.`,
		"",
		...example.files.flatMap(({ code, path }) => [
			`### ${path}`,
			"",
			...renderCodeFence(code),
			"",
		]),
	];
}

// The usage examples, then the specimen's full source when there is one. A
// component without a specimen previews its first usage example instead,
// which the usage examples already include.
export function renderExampleMarkdown(slug: string) {
	const example = findExampleSource(slug);
	return [
		...getUsageExamples(slug).flatMap(({ title, description, code }) => [
			`## ${title}`,
			"",
			description,
			"",
			...renderCodeFence(code),
			"",
		]),
		...(example ? specimenMarkdown(example) : []),
	].join("\n");
}

function renderCodeFence(code: string) {
	const runs = code.match(/`+/g) ?? [];
	const fence = "`".repeat(Math.max(3, ...runs.map((run) => run.length + 1)));
	return [`${fence}tsx`, code.trimEnd(), fence];
}

// The import line and part anatomy derived from a component's first example.
export function getComponentUsage(slug: string): {
	anatomy: string | null;
	imports: readonly string[];
} {
	return sourceData.components[slug as keyof typeof sourceData.components];
}

// The import line, wrapped the way the formatter would past 80 columns.
export function importStatement(names: readonly string[]) {
	const sorted = names.toSorted();
	const line = `import { ${sorted.join(", ")} } from "@mizen/ui";`;
	return line.length <= 80
		? line
		: `import {\n${sorted.map((name) => `\t${name},`).join("\n")}\n} from "@mizen/ui";`;
}

// Usage and anatomy for the Markdown export, matching the page.
export function renderUsageMarkdown(slug: string) {
	const { anatomy, imports } = getComponentUsage(slug);
	return [
		"## Usage",
		"",
		"```tsx",
		importStatement(imports),
		"```",
		"",
		...(anatomy ? ["## Anatomy", "", "```tsx", anatomy, "```", ""] : []),
	].join("\n");
}
