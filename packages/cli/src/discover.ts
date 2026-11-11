import type { ApiProperty, Component } from "./catalog.js";
import { CliError, commandLine } from "./errors.js";
import { closest } from "./help.js";
import {
	indent,
	nextStep,
	row,
	type Style,
	status as statusLine,
} from "./output.js";

/** The app's installed UI: its version, and whether it has a component. */
export interface InstalledUi {
	exports: unknown;
	path: string;
	version: string | null;
}

const UI = "@mizen-labs/ui";

// Without an exports map there is no evidence either way.
function lacks(
	installed: InstalledUi | null,
	slug: string
): installed is InstalledUi {
	const map = installed?.exports;
	return (
		typeof map === "object" && map !== null && !Object.hasOwn(map, `./${slug}`)
	);
}

/**
 * Fails when the installed UI lacks the component, so nobody builds on an
 * import the app does not have.
 */
export function requireInstalled(
	component: Component,
	uiVersion: string,
	installed: InstalledUi | null
): void {
	if (!lacks(installed, component.slug)) {
		return;
	}
	const { path, version } = installed;
	const other = version !== null && version !== uiVersion;
	throw new CliError(
		"unavailable",
		`${component.name} is not in the installed ${UI} ${version ?? "(unknown version)"}. ${other ? `This catalog describes ${uiVersion}.` : "The installed package is another build of this version."}`,
		1,
		{
			data: {
				entryPoint: component.entryPoint,
				installedUiVersion: version,
				uiVersion,
			},
			...(other
				? {
						next: {
							argv: ["npx", `@mizen-labs/cli@${version}`, "search"],
							benefit: "List the components of the installed version",
						},
					}
				: {}),
			rows: [
				["Evidence", path],
				[
					"Next step",
					`Build with the installed components. Upgrade ${UI} only when the user asks for it.`,
				],
			],
		}
	);
}

/** The warning for a catalog of another version than the installed UI. */
export function versionNote(
	style: Style,
	uiVersion: string,
	installed: InstalledUi | null,
	args: readonly string[]
): string | undefined {
	const version = installed?.version;
	if (!version || version === uiVersion) {
		return;
	}
	return [
		statusLine(
			style,
			"warn",
			`This describes ${UI} ${uiVersion}. The app has ${version}; props and examples can differ.`
		),
		"",
		nextStep(
			style,
			"See the installed version",
			commandLine(["npx", `@mizen-labs/cli@${version}`, ...args])
		),
	].join("\n");
}

function normalize(value: string): string {
	return value.toLowerCase().trim().replaceAll(/\s+/gu, " ");
}

export type ComponentSummary = Pick<
	Component,
	"category" | "description" | "entryPoint" | "name" | "slug" | "status"
>;

/** Components matching every query word, in slug order. */
export function search(
	components: Component[],
	query: string
): ComponentSummary[] {
	const words = normalize(query).split(" ").filter(Boolean);
	return components
		.filter((component) => {
			const text = normalize(
				[
					component.slug,
					component.name,
					component.category,
					component.description,
					...component.guidance.recommendations,
					...component.guidance.boundaries,
				].join(" ")
			);
			return words.every((word) => text.includes(word));
		})
		.toSorted((a, b) => a.slug.localeCompare(b.slug, "en"))
		.map(({ slug, name, category, description, status, entryPoint }) => ({
			category,
			description,
			entryPoint,
			name,
			slug,
			status,
		}));
}

/** One component by slug or name; a near miss gets one suggestion. */
export function info(components: Component[], query: string): Component {
	const slug = normalize(query).replaceAll(" ", "-");
	const component = components.find((item) => item.slug === slug);
	if (component) {
		return component;
	}
	const suggestion = closest(
		slug,
		components.map((item) => item.slug)
	);
	throw new CliError(
		"not_found",
		`Couldn't find component ${query}.${suggestion ? ` Did you mean ${suggestion}?` : ""}`,
		1,
		{
			...(suggestion ? { data: { suggestion } } : {}),
			next: suggestion
				? { argv: ["mizen", "info", suggestion], benefit: "Show it" }
				: { argv: ["mizen", "search", query], benefit: "Search for it" },
		}
	);
}

function fit(text: string, width: number): string {
	return text.length > width
		? `${text.slice(0, Math.max(width - 1, 0))}…`
		: text;
}

/**
 * A table on a terminal, the description shortened to fit; tab-separated
 * values, never shortened, anywhere else.
 */
export function formatSearch(
	style: Style,
	results: ComponentSummary[],
	stream: NodeJS.WriteStream
): string {
	if (!stream.isTTY) {
		return [
			"Component\tDescription",
			...results.map((item) => `${item.slug}\t${item.description}`),
		].join("\n");
	}
	const width = Math.max(...results.map((item) => item.slug.length), 9) + 3;
	const room = (stream.columns || 80) - width - 2;
	return [
		`  ${style.bold(`${"Component".padEnd(width)}Description`)}`,
		...results.map(
			(item) => `  ${item.slug.padEnd(width)}${fit(item.description, room)}`
		),
	].join("\n");
}

function propertyRow(property: ApiProperty): string {
	const fallback = property.defaultValue.replaceAll("—", "").trim();
	return row(property.name, [
		property.type,
		`${property.description}${fallback ? ` (default: ${fallback})` : ""}`,
	]);
}

function heading(style: Style, title: string, lines: string[]): string[] {
	return lines.length ? ["", style.bold(title), ...lines] : [];
}

export function formatInfo(
	style: Style,
	component: Component,
	uiVersion: string
): string {
	const examples = (component.usageSections ?? []).flatMap((section) => [
		"",
		style.bold(section.title),
		...(section.description ? [indent(section.description)] : []),
		indent(section.code, 2),
	]);
	return [
		style.bold(component.name),
		component.description,
		"",
		row("Category", component.category),
		row("Import", component.entryPoint),
		row("Version", `${UI} ${uiVersion}`),
		row("Docs", component.documentationPath),
		...heading(
			style,
			"Guidance",
			component.guidance.recommendations.map((line) => indent(line))
		),
		...heading(
			style,
			"Boundaries",
			component.guidance.boundaries.map((line) => indent(line))
		),
		...heading(style, "API", component.api.map(propertyRow)),
		...(component.apiSections ?? []).flatMap((section) =>
			heading(style, section.name, [
				indent(section.description),
				...section.properties.map(propertyRow),
			])
		),
		...(component.contract
			? heading(style, "Contract", [
					indent(JSON.stringify(component.contract, null, 2)),
				])
			: []),
		...examples,
	].join("\n");
}
