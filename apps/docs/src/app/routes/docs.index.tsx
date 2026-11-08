import { createFileRoute } from "@tanstack/react-router";
import DocumentationPage from "../../pages/docs-index/ui/page";
export const Route = createFileRoute("/docs/")({
	component: DocumentationPage,
});
