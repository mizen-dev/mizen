import { createFileRoute } from "@tanstack/react-router";
import Layout from "../../app/internal/specimens/layout";
import Page from "../../app/internal/specimens/page";
export const Route = createFileRoute("/internal/specimens")({
	component: InternalPage,
});
function InternalPage() {
	return (
		<Layout>
			<Page />
		</Layout>
	);
}
