import { createFileRoute, Outlet } from "@tanstack/react-router";
import DocumentationLayout from "../../app/docs/layout";
export const Route = createFileRoute("/docs")({ component: Docs });
function Docs() {
	return (
		<DocumentationLayout>
			<Outlet />
		</DocumentationLayout>
	);
}
