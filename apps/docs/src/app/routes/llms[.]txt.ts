import { createFileRoute } from "@tanstack/react-router";
import { GET } from "../../entities/documentation/api/llms";
import { readOnlyHandlers } from "../../shared/lib/read-only-handlers";
export const Route = createFileRoute("/llms.txt")({
	server: { handlers: { ...readOnlyHandlers, GET } },
});
