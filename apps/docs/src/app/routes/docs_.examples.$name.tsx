import { createFileRoute, notFound } from "@tanstack/react-router";
import ExamplePage from "../../pages/example/ui/page";

// One example on its own, at the full width of the window. The docs stage is
// narrower than a screen, so wide layouts are only visible here.
export const Route = createFileRoute("/docs_/examples/$name")({
	component: Component,
	loader: async ({ params }) => {
		const { usageComponents } = await import(
			"../../entities/documentation/ui/example-components.gen"
		);
		const example = usageComponents[params.name];
		if (!example) {
			throw notFound();
		}
		await example.preload();
		return params.name;
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: `${loaderData} · Mizen UI` },
			{ content: "noindex", name: "robots" },
		],
	}),
});
function Component() {
	return <ExamplePage name={Route.useLoaderData()} />;
}
