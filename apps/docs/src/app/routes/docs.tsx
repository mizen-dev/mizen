import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import DocumentationLayout from "../layouts/docs-layout";
export const Route = createFileRoute("/docs")({ component: Docs });
function Docs() {
	return (
		<DocumentationLayout>
			<Suspense fallback={null}>
				<Outlet />
			</Suspense>
		</DocumentationLayout>
	);
}
