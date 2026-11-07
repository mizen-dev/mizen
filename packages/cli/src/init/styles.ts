import {
	imports,
	isNode,
	literal,
	nameOf,
	nodes,
	parseSource,
	property,
	type SyntaxNode,
} from "../doctor/syntax.js";
import { viteRootEdit } from "../vite/init.js";
import { member } from "./config.js";
import {
	addProperty,
	type Change,
	changes,
	conflict,
	fileEdit,
	position,
	sourceFile,
} from "./edit.js";
import { defaultImport, importEdit, uniqueName } from "./imports.js";
import { themeSource } from "./theme.js";

function startRoute(ast: SyntaxNode): SyntaxNode {
	const bindings = imports(ast)
		.filter((node) => literal(node.source) === "@tanstack/react-router")
		.flatMap((node) => (Array.isArray(node.specifiers) ? node.specifiers : []))
		.filter(
			(node) => isNode(node) && nameOf(node.imported) === "createRootRoute"
		)
		.map((node) => (isNode(node) ? nameOf(node.local) : null));
	const calls = nodes(ast).filter(
		(node) =>
			node.type === "CallExpression" && bindings.includes(nameOf(node.callee))
	);
	if (calls.length !== 1 || !Array.isArray(calls[0].arguments)) {
		return conflict("A single conventional createRootRoute call is required.");
	}
	const [config] = calls[0].arguments;
	if (!isNode(config) || config.type !== "ObjectExpression") {
		return conflict("Computed root route configuration requires manual setup.");
	}
	return config;
}

function headObject(head: unknown): SyntaxNode {
	if (
		!isNode(head) ||
		head.type !== "ArrowFunctionExpression" ||
		!isNode(head.body) ||
		head.body.type !== "ObjectExpression"
	) {
		return conflict(
			"Root head must be an arrow returning a literal object. Configure the stylesheet link manually."
		);
	}
	return head.body;
}

function linksChange(head: unknown, binding: string): Change | null {
	const object = headObject(head);
	const link = `{ href: ${binding}, rel: "stylesheet" }`;
	if (!member(object, "links")) {
		return addProperty(object, "links", `[${link}]`);
	}
	const links = property(object, "links");
	if (
		!isNode(links) ||
		links.type !== "ArrayExpression" ||
		!Array.isArray(links.elements)
	) {
		return conflict("Computed head links require manual setup.");
	}
	if (
		links.elements.some(
			(node) =>
				nameOf(property(node, "href")) === binding &&
				literal(property(node, "rel")) === "stylesheet"
		)
	) {
		return null;
	}
	const at = position(links, "start") + 1;
	return {
		end: at,
		start: at,
		text: `${link}${links.elements.length ? ", " : ""}`,
	};
}

function startStyles(source: string): string {
	const ast = parseSource(source);
	const imported = defaultImport(ast, "@mizen-labs/ui/styles.css?url");
	const binding = imported ?? uniqueName(ast, "mizenStylesheet");
	const config = startRoute(ast);
	const edits: Change[] = [];
	if (!imported) {
		edits.push(
			importEdit(
				ast,
				`import ${binding} from "@mizen-labs/ui/styles.css?url";`,
				source
			)
		);
	}
	if (member(config, "head")) {
		const link = linksChange(property(config, "head"), binding);
		if (link) {
			edits.push(link);
		}
	} else {
		edits.push(
			addProperty(
				config,
				"head",
				`() => ({ links: [{ href: ${binding}, rel: "stylesheet" }] })`
			)
		);
	}
	return changes(source, edits);
}

function nextStyles(source: string): string {
	const ast = parseSource(source);
	const existing = imports(ast).filter(
		(node) => literal(node.source) === "@mizen-labs/ui/styles.css"
	);
	if (existing.length) {
		return source;
	}
	return changes(source, [
		importEdit(ast, 'import "@mizen-labs/ui/styles.css";', source, "first"),
	]);
}

export async function rootEdit(
	project: string,
	framework: "next" | "start" | "vite"
) {
	if (framework === "vite") {
		return viteRootEdit(project);
	}
	const roots =
		framework === "next"
			? ["app/layout", "src/app/layout"]
			: ["src/routes/__root", "app/routes/__root"];
	const file = await sourceFile(
		project,
		roots.flatMap((path) =>
			["tsx", "jsx", "ts", "js"].map((extension) => `${path}.${extension}`)
		)
	);
	const themed = themeSource(file.source, framework);
	const after = framework === "next" ? nextStyles(themed) : startStyles(themed);
	return fileEdit(file.path, file.before, after);
}
