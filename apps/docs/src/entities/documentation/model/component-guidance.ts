import componentGuidanceData from "./component-guidance-data.json";
import type { ComponentDoc } from "./docs-registry";

interface Guidance {
	boundaries: readonly string[];
	recommendations: readonly string[];
}

const componentGuidance: Record<string, Guidance> = componentGuidanceData;

export function getComponentGuidance(component: ComponentDoc): Guidance {
	const guidance = componentGuidance[component.slug];
	if (!guidance) {
		throw new Error(`Guidance is missing for ${component.slug}`);
	}
	return guidance;
}
