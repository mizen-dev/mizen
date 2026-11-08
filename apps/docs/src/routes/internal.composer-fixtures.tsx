import { createFileRoute } from "@tanstack/react-router";
import Layout from "../../app/internal/composer-fixtures/layout";
import Page, { metadata } from "../../app/internal/composer-fixtures/page";
export const Route = createFileRoute("/internal/composer-fixtures")({
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
