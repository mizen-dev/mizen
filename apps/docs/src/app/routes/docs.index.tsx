import { createFileRoute } from "@tanstack/react-router";
import DocumentationPage from "../../pages/docs-index/ui/page";
import { canonical } from "../lib/canonical";
export const Route = createFileRoute("/docs/")({
	component: DocumentationPage,
	head: () => ({
		links: [canonical("/docs/")],
		meta: [
			{ title: "Documentation · Mizen UI" },
			{
				name: "description",
				content:
					"Install Mizen UI and explore its components, guides, and executable examples.",
			},
		],
	}),
});
