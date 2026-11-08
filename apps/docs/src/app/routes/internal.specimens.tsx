import { createFileRoute } from "@tanstack/react-router";
import Page from "../../pages/specimens/ui/page";
import Layout from "../layouts/specimens-layout";
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
