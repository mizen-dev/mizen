import { createFileRoute } from "@tanstack/react-router";
import { GET } from "../../entities/documentation/api/component-metadata";
import { readOnlyHandlers } from "../../shared/lib/read-only-handlers";
export const Route = createFileRoute("/docs_/components_/$slug_/metadata")({
	server: {
		handlers: {
			...readOnlyHandlers,
			GET: ({ request, params }) =>
				GET(request, { params: Promise.resolve(params) }),
		},
	},
});
