import { createFileRoute } from "@tanstack/react-router";
import { GET } from "../../entities/documentation/api/skill";
import { readOnlyHandlers } from "../../shared/lib/read-only-handlers";
export const Route = createFileRoute("/skills/mizen-ui/SKILL.md")({
	server: { handlers: { ...readOnlyHandlers, GET } },
});
