import {
	getComponentUsage,
	getExampleSource,
	getUsageExamples,
} from "../lib/example-sources";
import { getComponentGuidance } from "../model/component-guidance";
import {
	type ComponentDoc,
	getAdjacentComponents,
	getComponentDoc,
} from "../model/docs-registry";

const standaloneSpecimens = new Set([
	"input",
	"textarea",
	"field",
	"select",
	"combobox",
]);

function pagerLink(component: ComponentDoc | undefined) {
	return component ? { name: component.name, slug: component.slug } : undefined;
}

export function getComponentPageData(slug: string) {
	const component = getComponentDoc(slug);
	if (!component) {
		return null;
	}
	const allExamples = getUsageExamples(slug);
	const presentation = standaloneSpecimens.has(slug)
		? undefined
		: allExamples[0];
	const adjacent = getAdjacentComponents(slug);
	return {
		adjacent: {
			next: pagerLink(adjacent.next),
			previous: pagerLink(adjacent.previous),
		},
		component,
		example: presentation
			? { files: [{ code: presentation.code, path: presentation.path }] }
			: getExampleSource(slug),
		guidance: getComponentGuidance(component),
		presentation: presentation ? { name: presentation.name } : undefined,
		usage: getComponentUsage(slug),
		usageExamples: presentation ? allExamples.slice(1) : allExamples,
	};
}
