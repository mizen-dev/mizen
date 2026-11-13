import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { cliGuide } from "../src/entities/documentation/model/cli-guide";
import {
	guides,
	renderGuideMarkdown,
} from "../src/entities/documentation/model/guides";

const binary = fileURLToPath(
	new URL("../../../packages/cli/dist/cli.js", import.meta.url)
);

describe("Getting started CLI guide", () => {
	it("shares navigation and Markdown sources with the other guides", () => {
		const position = guides.findIndex((guide) => guide.slug === "cli");
		expect(position).toBe(
			guides.findIndex((guide) => guide.slug === "installation") + 1
		);
		expect(guides[position]).toBe(cliGuide);
		const markdown = renderGuideMarkdown(cliGuide);
		expect(markdown).toContain("mizen doctor --workspace");
		expect(markdown).toContain("@mizen-labs/cli/schema/v1.json");
		expect(markdown).toContain("npm install --save-dev @mizen-labs/cli");
		expect(markdown).toContain("npm install --save-dev @mizen-labs/cli@0.3.0");
		expect(markdown).not.toContain("unpublished");
		for (const section of cliGuide.sections) {
			expect(markdown).toContain(`## ${section.title}`);
			if (section.code) {
				expect(markdown).toContain(section.code.value);
			}
		}
	});
	it("documents flags the installed command parser accepts", () => {
		const args = ["doctor", "--workspace", "--cwd", ".", "--strict", "--json"];
		const example = cliGuide.sections.find(
			(section) => section.id === "workspace"
		)?.code?.value;
		expect(example).toContain(`npx --no-install mizen ${args.join(" ")}`);
		const result = spawnSync(process.execPath, [binary, ...args, "--help"], {
			encoding: "utf8",
		});
		expect(result.status, result.stderr).toBe(0);
		const output = JSON.parse(result.stdout);
		expect(output.command).toBe("help");
		expect(output.data.usage).toContain("--workspace");
	});
	it("uses a complete error report with internally consistent diagnostic counts", () => {
		const source = cliGuide.sections.find(
			(section) => section.id === "automation"
		)?.code?.value;
		if (!source) {
			throw new Error("Missing JSON example");
		}
		const example = JSON.parse(source);
		expect(example.schemaVersion).toBe(1);
		expect(example.command).toBe("doctor");
		expect(example.data.status).toBe("failed");
		expect(example.data.summary.errors).toBe(
			example.data.diagnostics.filter(
				(item: { status: string }) => item.status === "error"
			).length
		);
	});
});
