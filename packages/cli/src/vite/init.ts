import { lstat } from "node:fs/promises";
import { join } from "node:path";
import { imports, isNode, literal, parseSource } from "../doctor/syntax.js";
import {
	type Change,
	changes,
	conflict,
	fileEdit,
	position,
	sourceFile,
	wrapElement,
} from "../init/edit.js";
import {
	bindingName,
	importEdit,
	importedName,
	specifier,
} from "../init/imports.js";
import { themeImport } from "../init/preset.js";
import { bootstrapEdits } from "./bootstrap.js";
import { viteEntry } from "./entry.js";
import { hasProvider, providerCovers, renderArgument } from "./render.js";

export async function viteRootEdit(project: string, theme = false) {
	const entry = await viteEntry(project);
	if (!entry) {
		return conflict(
			"index.html must load one conventional src/main.tsx or src/main.jsx module before init."
		);
	}
	const htmlStat = await lstat(join(project, "index.html"));
	if (!htmlStat.isFile()) {
		return conflict(
			"Review the linked or custom Vite index.html before setup."
		);
	}
	const file = await sourceFile(project, [entry.path]);
	const after = clientTheme(file.source);
	return fileEdit(file.path, file.before, theme ? themeImport(after) : after);
}

function clientTheme(source: string): string {
	const ast = parseSource(source);
	const tree = renderArgument(ast);
	if (!tree) {
		return conflict(
			"Use a conventional top-level createRoot(...).render(<App />) entry, or configure Mizen manually."
		);
	}
	const namespace = imports(ast)
		.filter((node) =>
			[
				"@mizen-labs/ui/theme",
				"@mizen-labs/ui",
				"@mizen-labs/ui/theme/initialize",
			].includes(literal(node.source) ?? "")
		)
		.flatMap((node) => (Array.isArray(node.specifiers) ? node.specifiers : []))
		.some((node) => isNode(node) && node.type === "ImportNamespaceSpecifier");
	if (namespace) {
		return conflict("Namespace Mizen imports require manual provider review.");
	}
	const provider =
		importedName(ast, "ThemeProvider", "@mizen-labs/ui/theme") ??
		importedName(ast, "ThemeProvider", "@mizen-labs/ui");
	if (hasProvider(ast, tree) && !providerCovers(ast, tree)) {
		return conflict(
			"An existing provider covers only part of the render tree. Review it before init."
		);
	}
	const edits: Change[] = [];
	const covered = providerCovers(ast, tree);
	if (!covered) {
		const name = provider ?? bindingName(ast, "ThemeProvider");
		const start = position(tree, "start");
		const end = position(tree, "end");
		edits.push(wrapElement(source, start, end, name));
		if (!provider) {
			edits.push(
				importEdit(
					ast,
					`import { ${specifier("ThemeProvider", name)} } from "@mizen-labs/ui/theme";`,
					source
				)
			);
		}
	}
	edits.push(...bootstrapEdits(source, ast, tree));
	const themed = changes(source, edits);
	const result = parseSource(themed);
	const css = imports(result).some(
		(node) =>
			literal(node.source) === "@mizen-labs/ui/styles.css" &&
			Array.isArray(node.specifiers) &&
			node.specifiers.length === 0
	);
	const after = css
		? themed
		: changes(themed, [
				importEdit(
					result,
					'import "@mizen-labs/ui/styles.css";',
					themed,
					"first"
				),
			]);
	return after;
}
