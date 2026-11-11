import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vite-plus/test";
import { GET } from "../src/entities/documentation/api/component-metadata";
import { GET as getIndex } from "../src/entities/documentation/api/llms";
import { componentDocs } from "../src/entities/documentation/model/docs-registry";

// A component in code or JSX: `Stack`, `Page width="narrow"`, <PageTitle>.
const COMPONENT_NAME = /[`<](?<name>[A-Z][A-Za-z]+)\b/gu;
const COMPONENT_PROP =
	/`(?<name>[A-Z][A-Za-z]+) (?<prop>[a-z][A-Za-z]*)="(?<value>[^"]+)"`/gu;

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

// Compiles the given files as a consumer of the public package would.
function compile(files: Record<string, string>) {
	const root = new URL("..", import.meta.url).pathname;
	const directory = mkdtempSync(join(root, ".consumer-contract-"));
	try {
		for (const [name, source] of Object.entries(files)) {
			writeFileSync(join(directory, name), source);
		}
		writeFileSync(
			join(directory, "tsconfig.json"),
			JSON.stringify({
				exclude: [],
				extends: "../tsconfig.json",
				include: ["*.ts", "*.tsx"],
			})
		);
		execFileSync("pnpm", ["exec", "tsc", "-p", directory], {
			cwd: root,
			stdio: "inherit",
		});
	} finally {
		rmSync(directory, { force: true, recursive: true });
	}
}

it("resolves reviewed imports and feature dependencies against the installed public APIs", () => {
	const files: Record<string, string> = {};
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
		files[`${component.slug}.ts`] = `${Object.entries(imports)
			.map(
				([path, symbols]) =>
					`import { ${symbols.join(", ")} } from ${JSON.stringify(path)};`
			)
			.join("\n")}\nexport const imported = [${names.join(", ")}];\n`;
	}
	compile(files);
});

// The skill ships with the package, so it may name only what this version has.
it("names only components and props of this version in the skill", () => {
	const skill = readFileSync(
		new URL("../../../packages/ui/skills/mizen-ui/SKILL.md", import.meta.url),
		"utf8"
	);
	const names = [
		...new Set(Array.from(skill.matchAll(COMPONENT_NAME), (match) => match[1])),
	];
	const elements = Array.from(
		skill.matchAll(COMPONENT_PROP),
		([, name, prop, value]) => `<${name} ${prop}="${value}" />`
	);
	expect(names).toContain("PageTitle");
	expect(elements).toContain('<Page width="narrow" />');
	compile({
		"skill.tsx": `import { ${names.join(", ")} } from "@mizen-labs/ui";\nexport const imported = [${names.join(", ")}];\nexport const elements = [${elements.join(", ")}];\n`,
	});
});
