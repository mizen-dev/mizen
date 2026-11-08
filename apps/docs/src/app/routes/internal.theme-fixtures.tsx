import { createFileRoute } from "@tanstack/react-router";
import Page from "../../pages/theme-fixtures/ui/page";
import Layout from "../layouts/theme-fixtures-layout";
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
