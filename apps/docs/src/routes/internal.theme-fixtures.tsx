import { createFileRoute } from "@tanstack/react-router";
import Layout from "../../app/internal/theme-fixtures/layout";
import Page from "../../app/internal/theme-fixtures/page";
export const Route = createFileRoute("/internal/theme-fixtures")({
	component: InternalPage,
});
function InternalPage() {
	return (
		<Layout>
			<Page />
		</Layout>
	);
}
