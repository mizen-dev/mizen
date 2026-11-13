import { createFileRoute } from "@tanstack/react-router";
import { GET } from "../../entities/documentation/api/app-markdown";
import { readOnlyHandlers } from "../../shared/lib/read-only-handlers";
export const Route = createFileRoute("/apps_/$app_/markdown")({
	server: {
		handlers: {
			...readOnlyHandlers,
			GET: ({ params }) => GET(params.app),
		},
	},
});
