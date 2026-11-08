import type { ApiProperty, Component } from "./catalog.js";
import { CliError } from "./errors.js";
import { closest } from "./help.js";
import { indent, row, type Style } from "./output.js";

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

export function formatInfo(style: Style, component: Component): string {
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
