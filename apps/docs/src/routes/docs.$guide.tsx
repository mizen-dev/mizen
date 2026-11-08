import { createFileRoute, notFound } from "@tanstack/react-router";
import GuidePage from "../../app/docs/[guide]/page";
import { getGuide } from "../../app/guides";
export const Route = createFileRoute("/docs/$guide")({
	component: Guide,
	loader: ({ params }) => {
		const guide = getGuide(params.guide);
		if (!guide) {
			throw notFound();
		}
		return guide;
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: loaderData?.title },
			{ content: loaderData?.description, name: "description" },
		],
	}),
});
function Guide() {
	return <GuidePage guide={Route.useLoaderData()} />;
}
