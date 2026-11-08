import { createFileRoute } from "@tanstack/react-router";
import { GET } from "../../app/llms.txt/route";
import { readOnlyHandlers } from "../read-only-handlers";
export const Route = createFileRoute("/llms.txt")({
	server: { handlers: { ...readOnlyHandlers, GET } },
});
