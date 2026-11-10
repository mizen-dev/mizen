import { chmod, readFile, writeFile } from "node:fs/promises";

const readJson = async (path) =>
	JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const [components, guidance, ui, cli] = await Promise.all([
	readJson(
		"../../../apps/docs/src/entities/documentation/model/docs-registry-data.json"
	),
	readJson(
		"../../../apps/docs/src/entities/documentation/model/component-guidance-data.json"
	),
	readJson("../../ui/package.json"),
	readJson("../package.json"),
]);
const slugs = new Set();
const catalog = components.map((component) => {
	const { slug } = component;
	if (slugs.has(slug) || !ui.exports[`./${slug}`] || !guidance[slug]) {
		throw new Error(
			`Duplicate component, missing guidance, or missing package export: ${slug}`
		);
	}
	slugs.add(slug);
	return {
		...component,
		documentationPath: `/docs/components/${slug}`,
		entryPoint: `@mizen-labs/ui/${slug}`,
		guidance: guidance[slug],
	};
});
await writeFile(
	new URL("../dist/catalog.json", import.meta.url),
	`${JSON.stringify({ cliVersion: cli.version, components: catalog, nodeRange: cli.engines.node, uiPeerDependencies: ui.peerDependencies, uiVersion: ui.version }, null, 2)}\n`
);
await chmod(new URL("../dist/cli.js", import.meta.url), 0o755);
