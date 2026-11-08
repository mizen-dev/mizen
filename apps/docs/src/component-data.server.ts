import { getComponentGuidance } from "../app/component-guidance";
import { getAdjacentComponents, getComponentDoc } from "../app/docs-registry";
import {
	getComponentUsage,
	getExampleSource,
	getUsageExamples,
} from "../app/example-sources";

const standaloneSpecimens = new Set([
	"input",
	"textarea",
	"field",
	"select",
	"combobox",
]);

export function getComponentPageData(slug: string) {
	const component = getComponentDoc(slug);
	if (!component) {
		return null;
	}
	const allExamples = getUsageExamples(slug);
	const presentation = standaloneSpecimens.has(slug)
		? undefined
		: allExamples[0];
	return {
		adjacent: getAdjacentComponents(slug),
		component,
		example: presentation
			? { files: [{ code: presentation.code, path: presentation.path }] }
			: getExampleSource(slug),
		guidance: getComponentGuidance(component),
		presentation,
		usage: getComponentUsage(slug),
		usageExamples: presentation ? allExamples.slice(1) : allExamples,
	};
}
