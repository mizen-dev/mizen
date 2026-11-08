import { createFileRoute } from "@tanstack/react-router";
import { GET } from "../../app/docs/components/[slug]/metadata/route";
import { readOnlyHandlers } from "../read-only-handlers";
export const Route = createFileRoute("/docs_/components_/$slug_/metadata")({
	server: {
		handlers: {
			...readOnlyHandlers,
			GET: ({ request, params }) =>
				GET(request, { params: Promise.resolve(params) }),
		},
	},
});
