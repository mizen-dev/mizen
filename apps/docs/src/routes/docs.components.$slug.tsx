import { createFileRoute, notFound } from "@tanstack/react-router";
import ComponentPage from "../../app/docs/components/[slug]/page";
import { loadComponent } from "../docs-functions";
export const Route = createFileRoute("/docs/components/$slug")({
	component: Component,
	loader: async ({ params }) => {
		const data = await loadComponent({ data: params.slug });
		if (!data) {
			throw notFound();
		}
		return data;
	},
});
function Component() {
	return <ComponentPage data={Route.useLoaderData()} />;
}
