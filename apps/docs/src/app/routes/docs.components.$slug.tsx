import { createFileRoute, notFound } from "@tanstack/react-router";
import { loadComponent } from "../../entities/documentation/api/docs-functions";
import ComponentPage from "../../pages/component/ui/page";
import { canonical } from "../lib/canonical";

export const Route = createFileRoute("/docs/components/$slug")({
	component: Component,
	staleTime: import.meta.env.DEV ? 0 : Number.POSITIVE_INFINITY,
	loader: async ({ params }) => {
		const [data, { getSpecimen, usageComponents }] = await Promise.all([
			loadComponent({ data: params.slug }),
			import("../../entities/documentation/ui/example-components.gen"),
		]);
		if (!data) {
			throw notFound();
		}
		await Promise.all([
			(data.presentation
				? usageComponents[data.presentation.name]
				: getSpecimen(params.slug)
			)?.preload(),
			...data.usageExamples.map(({ name }) => usageComponents[name]?.preload()),
		]);
		return data;
	},
	head: ({ loaderData }) =>
		loaderData
			? {
					links: [canonical(`/docs/components/${loaderData.component.slug}/`)],
					meta: [
						{ title: `${loaderData.component.name} · Mizen UI` },
						{ name: "description", content: loaderData.component.description },
					],
				}
			: {},
});
function Component() {
	return <ComponentPage data={Route.useLoaderData()} />;
}
