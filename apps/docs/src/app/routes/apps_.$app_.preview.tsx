import { createFileRoute, notFound } from "@tanstack/react-router";
import AppPreview from "../../pages/apps/ui/preview";

// One app on its own, at the full size of the window, in its own theme. The
// app page frames this route.
export const Route = createFileRoute("/apps_/$app_/preview")({
	component: Preview,
	loader: async ({ params }) => {
		// Imported here, so the app stays out of the site's first chunk.
		const { apps } = await import("../../entities/documentation/ui/apps");
		const app = apps[params.app];
		if (!app) {
			throw notFound();
		}
		return { name: params.app, theme: app.theme };
	},
	head: ({ loaderData }) =>
		loaderData
			? {
					links: [{ href: loaderData.theme, rel: "stylesheet" }],
					meta: [
						{ title: `${loaderData.name} preview · Mizen UI` },
						{ content: "noindex", name: "robots" },
					],
				}
			: {},
});
function Preview() {
	return <AppPreview name={Route.useLoaderData().name} />;
}
