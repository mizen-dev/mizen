// One source: the docs serve the skill the package publishes.
import skill from "@mizen-labs/ui/skills/mizen-ui/SKILL.md?raw";

export function GET() {
	return new Response(skill, {
		headers: { "content-type": "text/markdown; charset=utf-8" },
	});
}
