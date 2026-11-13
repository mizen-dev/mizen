import { createFileRoute, notFound } from "@tanstack/react-router";
import { loadApp } from "../../entities/documentation/api/docs-functions";
import AppPage from "../../pages/apps/ui/app-page";
import SiteLayout from "../layouts/site-layout";
import { canonical } from "../lib/canonical";

export const Route = createFileRoute("/apps/$app")({
	component: App,
	staleTime: import.meta.env.DEV ? 0 : Number.POSITIVE_INFINITY,
	loader: async ({ params }) => {
		const data = await loadApp({ data: params.app });
		if (!data) {
			throw notFound();
		}
		return data;
	},
	head: ({ loaderData }) =>
		loaderData
			? {
					links: [canonical(`/apps/${loaderData.app.slug}/`)],
					meta: [
						{ title: `${loaderData.app.title} · Mizen UI` },
						{ content: loaderData.app.description, name: "description" },
					],
				}
			: {},
});
function App() {
	return (
		<SiteLayout>
			<AppPage data={Route.useLoaderData()} />
		</SiteLayout>
	);
}
