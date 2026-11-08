import { createFileRoute } from "@tanstack/react-router";
import Layout from "../../app/internal/press/layout";
import Page, { metadata } from "../../app/internal/press/page";
export const Route = createFileRoute("/internal/press")({
	component: InternalPage,
	head: () => ({
		meta: [{ title: metadata.title }, { content: "noindex", name: "robots" }],
	}),
});
function InternalPage() {
	return (
		<Layout>
			<Page />
		</Layout>
	);
}
