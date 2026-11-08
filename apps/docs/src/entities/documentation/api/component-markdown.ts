import {
	renderExampleMarkdown,
	renderUsageMarkdown,
} from "../lib/example-sources";
import {
	getComponentDoc,
	renderComponentMarkdown,
} from "../model/docs-registry";

interface RouteContext {
	params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
	const { slug } = await context.params;
	const component = getComponentDoc(slug);

	if (!component) {
		return new Response("Component not found.\n", {
			headers: { "content-type": "text/plain; charset=utf-8" },
			status: 404,
		});
	}

	return new Response(
		`${renderComponentMarkdown(component)}\n${renderUsageMarkdown(slug)}\n${renderExampleMarkdown(slug)}`,
		{
			headers: { "content-type": "text/markdown; charset=utf-8" },
		}
	);
}
