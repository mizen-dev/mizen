import { componentDocs, groupedComponentDocs } from "../model/docs-registry";
import { guides } from "../model/guides";

export function getDocsNavigation() {
	return {
		componentCount: componentDocs.length,
		componentGroups: groupedComponentDocs.map(({ category, components }) => ({
			category,
			components: components.map(({ name, slug }) => ({
				category,
				name,
				slug,
			})),
		})),
		guides: guides.map(({ slug, title, description, group }) => ({
			description,
			group,
			slug,
			title,
		})),
	};
}
