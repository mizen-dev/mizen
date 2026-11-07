import { getComponentGuidance } from "./component-guidance";
import componentDocsData from "./docs-registry-data.json";

export interface ApiProperty {
	defaultValue: string;
	description: string;
	name: string;
	type: string;
}

// Build order: structure, text, actions, input, movement, layers, state,
// records, charts, diagrams, content, then agent interfaces.
export const componentCategories = [
	"Layout",
	"Typography",
	"Actions",
	"Forms",
	"Navigation",
	"Overlays",
	"Feedback",
	"Data",
	"Charts",
	"Diagrams",
	"Content",
	"Agentic",
] as const;

type ComponentCategory = (typeof componentCategories)[number];

export interface ComponentDoc {
	api: readonly ApiProperty[];
	apiSections?: readonly {
		name: string;
		description: string;
		properties: readonly ApiProperty[];
	}[];
	category: ComponentCategory;
	contract?: {
		anatomy: { nesting: string; parts: readonly string[]; root: string };
		clientBoundary: string;
		dependencies: readonly string[];
		featureDependencies?: Record<string, readonly string[]>;
		focusBehavior?: string;
		imports: Record<string, readonly string[]>;
		stateOwnership: string;
		stateProps?: Record<
			string,
			{ forbidden: readonly string[]; required: readonly string[] }
		>;
	};
	description: string;
	name: string;
	slug: string;
	status: "stable" | "preview";
	usageSections?: readonly {
		id: string;
		title: string;
		description: string;
		code: string;
	}[];
}

export interface ComponentCategoryGroup {
	category: ComponentCategory;
	components: readonly ComponentDoc[];
}

export const componentDocs: readonly ComponentDoc[] =
	componentDocsData as readonly ComponentDoc[];

export const groupedComponentDocs: readonly ComponentCategoryGroup[] =
	componentCategories.map((category) => ({
		category,
		components: componentDocs
			.filter((component) => component.category === category)
			.toSorted((a, b) => a.name.localeCompare(b.name)),
	}));

// Neighbors in the aside's order, for previous and next links.
export function getAdjacentComponents(slug: string) {
	const ordered = groupedComponentDocs.flatMap(({ components }) => components);
	const index = ordered.findIndex((component) => component.slug === slug);
	return { next: ordered[index + 1], previous: ordered[index - 1] };
}

export function getComponentDoc(slug: string) {
	return componentDocs.find((component) => component.slug === slug);
}

function markdownCell(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\|/g, "\\|")
		.replace(/\r?\n/g, " ");
}

function renderApiTable(properties: readonly ApiProperty[]) {
	return [
		"| Name | Type | Default | Description |",
		"| --- | --- | --- | --- |",
		...properties.map(
			({ defaultValue, description, name, type }) =>
				`| ${markdownCell(name)} | ${markdownCell(type)} | ${markdownCell(defaultValue)} | ${markdownCell(description)} |`
		),
		"",
	];
}

function renderApiMarkdown(component: ComponentDoc) {
	return component.apiSections
		? component.apiSections.flatMap((section) => [
				`### ${section.name}`,
				"",
				section.description,
				"",
				...renderApiTable(section.properties),
			])
		: renderApiTable(component.api);
}

export function renderComponentMarkdown(component: ComponentDoc) {
	const guidance = getComponentGuidance(component);

	return [
		`# ${component.name}`,
		"",
		component.description,
		"",
		`Category: ${component.category}`,
		`Status: ${component.status}`,
		`Metadata: /docs/components/${component.slug}/metadata`,
		"",
		...(component.usageSections ?? []).flatMap((section) => [
			`## ${section.title}`,
			"",
			section.description,
			"",
			"```tsx",
			section.code,
			"```",
			"",
		]),
		"## Recommendations",
		"",
		...guidance.recommendations.map((text) => `- ${text}`),
		"",
		"## Usage boundaries",
		"",
		...guidance.boundaries.map((text) => `- ${text}`),
		"",
		"## API",
		"",
		...renderApiMarkdown(component),
		"",
		`Import the public component and exported prop types from \`@mizen/ui\`. See the rendered example at \`/docs/components/${component.slug}\`.`,
		"",
	].join("\n");
}
