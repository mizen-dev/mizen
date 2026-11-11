import { componentCategories, componentDocs } from "../model/docs-registry";
import { guides } from "../model/guides";

const examples = [
	["Analytics workspace", "/internal/specimens#analytics-workspace-example"],
] as const;

export function GET() {
	const categories = componentCategories.map((category) => {
		const links = componentDocs
			.filter((component) => component.category === category)
			.toSorted((a, b) => a.name.localeCompare(b.name))
			.map(
				(component) =>
					`- [${component.name}](/docs/components/${component.slug}/markdown): ${component.description}`
			);

		return [`## ${category}`, "", ...links].join("\n");
	});
	const content = [
		"# Mizen UI",
		"",
		"React components with documented APIs, accessible anatomy, and local examples.",
		"",
		"## Getting started",
		"",
		"- [Mizen consumer skill](/skills/mizen-ui/SKILL.md): Instructions for composing existing components, for the latest release. An app's own version is at node_modules/@mizen-labs/ui/skills/mizen-ui/SKILL.md. Reviewed anatomy and client boundaries: /docs/components/<slug>/metadata. Unreviewed contracts omit those fields.",
		...guides
			.filter((guide) => guide.group === undefined)
			.map(
				(guide) =>
					`- [${guide.title}](/docs/${guide.slug}/markdown): ${guide.description}`
			),
		"",
		"## Hooks",
		"",
		...guides
			.filter((guide) => guide.group === "Hooks")
			.map(
				(guide) =>
					`- [${guide.title}](/docs/${guide.slug}/markdown): ${guide.description}`
			),
		"",
		"## Workflow examples",
		"",
		...examples.map(([name, href]) => `- [${name}](${href})`),
		"",
		...categories,
		"",
	].join("\n");

	return new Response(content, {
		headers: { "content-type": "text/plain; charset=utf-8" },
	});
}
