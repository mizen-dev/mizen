import { createFileRoute } from "@tanstack/react-router";
import { GET } from "../../app/docs/[guide]/markdown/route";
import { readOnlyHandlers } from "../read-only-handlers";
export const Route = createFileRoute("/docs_/$guide_/markdown")({
	server: {
		handlers: {
			...readOnlyHandlers,
			GET: ({ request, params }) =>
				GET(request, { params: Promise.resolve(params) }),
		},
	},
});
