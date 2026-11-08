import { createFileRoute } from "@tanstack/react-router";
import Page from "../../pages/composer-fixtures/ui/page";
import Layout from "../layouts/composer-fixtures-layout";
export const Route = createFileRoute("/internal/composer-fixtures")({
	component: InternalPage,
	head: () => ({
		meta: [
			{ title: "Composer fixtures · Mizen UI" },
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
