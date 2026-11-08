import { createFileRoute } from "@tanstack/react-router";
import Page from "../../pages/press/ui/page";
import Layout from "../layouts/press-layout";
export const Route = createFileRoute("/internal/press")({
	component: InternalPage,
	head: () => ({
		meta: [
			{ title: "Press surfaces · Mizen UI" },
			{ content: "noindex", name: "robots" },
		],
	}),
});
function InternalPage() {
	return (
		<Layout>
			<Page />
		</Layout>
	);
}
