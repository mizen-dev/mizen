import { createFileRoute } from "@tanstack/react-router";
import DocumentationPage from "../../app/docs/page";
export const Route = createFileRoute("/docs/")({
	component: DocumentationPage,
});
