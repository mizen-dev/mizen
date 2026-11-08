import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vite-plus/test";
import { GET } from "../src/entities/documentation/api/component-metadata";
import { GET as getIndex } from "../src/entities/documentation/api/llms";
import { componentDocs } from "../src/entities/documentation/model/docs-registry";

it("publishes reviewed contracts without inventing metadata for other components", async () => {
	await Promise.all(
		componentDocs.map(async (component) => {
			const response = await GET(new Request("http://localhost/metadata"), {
				params: Promise.resolve({ slug: component.slug }),
			});
			expect(response.status).toBe(200);
			expect(await response.json()).toEqual(component);
		})
	);
	const missing = await GET(new Request("http://localhost/metadata"), {
		params: Promise.resolve({ slug: "not-a-component" }),
	});
	expect(missing.status).toBe(404);
	expect(await getIndex().text()).toContain("/skills/mizen-ui/SKILL.md");
});

it("resolves reviewed imports and feature dependencies against the installed public APIs", () => {
	const root = new URL("..", import.meta.url).pathname;
	const directory = mkdtempSync(join(root, ".consumer-contract-"));
	try {
		for (const component of componentDocs) {
			if (!component.contract) {
				continue;
			}
			const imports = { ...component.contract.imports };
			const features = Object.values(
				component.contract.featureDependencies ?? {}
			).flat();
			if (features.length) {
				imports["@tanstack/react-table"] = [...new Set(features)];
			}
			const names = Object.values(imports).flat();
			writeFileSync(
				join(directory, `${component.slug}.ts`),
				`${Object.entries(imports)
					.map(
						([path, symbols]) =>
							`import { ${symbols.join(", ")} } from ${JSON.stringify(path)};`
					)
					.join("\n")}\nexport const imported = [${names.join(", ")}];\n`
			);
		}
		writeFileSync(
			join(directory, "tsconfig.json"),
			JSON.stringify({
				exclude: [],
				extends: "../tsconfig.json",
				include: ["*.ts"],
			})
		);
		execFileSync("pnpm", ["exec", "tsc", "-p", directory], {
			cwd: root,
			stdio: "inherit",
		});
	} finally {
		rmSync(directory, { force: true, recursive: true });
	}
});
