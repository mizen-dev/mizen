import {
	documentFunction,
	imports,
	isNode,
	jsxName,
	literal,
	literalTrue,
	nameOf,
	nodes,
	parseSource,
	type SyntaxNode,
} from "../doctor/syntax.js";
import {
	type Change,
	changes,
	conflict,
	position,
	wrapElement,
} from "./edit.js";
import { bindingName, importEdit, importedName, specifier } from "./imports.js";

const SELF_CLOSING = /\/\s*>$/u;
const LINE_LEAD = /^\r?\n[ \t]*/u;

function single(elements: SyntaxNode[], tag: string): SyntaxNode {
	const matches = elements.filter((node) => jsxName(node) === tag);
	if (matches.length !== 1) {
		return conflict(`Setup requires exactly one ${tag} in the root document.`);
	}
	return matches[0];
}

function inside(parent: SyntaxNode, node: SyntaxNode): boolean {
	return (
		position(node, "start") > position(parent, "start") &&
		position(node, "end") < position(parent, "end")
	);
}

function themeBinding(ast: SyntaxNode, exported: string) {
	const existing =
		importedName(ast, exported, "@mizen-labs/ui/theme") ??
		importedName(ast, exported, "@mizen-labs/ui");
	return {
		imported: existing !== null,
		name: existing ?? bindingName(ast, exported),
	};
}

function hydrationChange(html: SyntaxNode): Change[] {
	const opening = html.openingElement;
	if (!(isNode(opening) && Array.isArray(opening.attributes))) {
		return conflict("The html element is not editable.");
	}
	if (
		opening.attributes.some(
			(node) => isNode(node) && node.type === "JSXSpreadAttribute"
		)
	) {
		return conflict(
			"Spread html attributes need manual hydration-warning review."
		);
	}
	const attributes = opening.attributes.filter(
		(node) => isNode(node) && nameOf(node.name) === "suppressHydrationWarning"
	);
	if (attributes.length) {
		const { value } = attributes[0] as SyntaxNode;
		if (!hydrationEnabled(value)) {
			return conflict(
				"Keep an explicit boolean suppressHydrationWarning on html before setup."
			);
		}
		return [];
	}
	const at = position(opening, "end") - 1;
	return [{ end: at, start: at, text: " suppressHydrationWarning" }];
}

function providerChanges(
	source: string,
	elements: SyntaxNode[],
	body: SyntaxNode,
	name: string
): Change[] {
	const existing = elements.filter((node) => jsxName(node) === name);
	if (existing.length) {
		if (existing.length !== 1 || !inside(body, existing[0])) {
			return conflict(
				"Existing ThemeProvider placement requires manual review."
			);
		}
		return [];
	}
	if (!isNode(body.closingElement)) {
		return conflict("Self-closing body elements need manual setup.");
	}
	const start = position(body.openingElement, "end");
	const end = position(body.closingElement, "start");
	if (start === end) {
		return [{ end, start, text: `<${name}>{null}</${name}>` }];
	}
	const inner = source.slice(start, end);
	if (!inner.includes("\n")) {
		return [
			{ end: start, start, text: `<${name}>` },
			{ end, start: end, text: `</${name}>` },
		];
	}
	// Children on their own lines get the provider as a block around them.
	const first = start + inner.length - inner.trimStart().length;
	const last = start + inner.trimEnd().length;
	return [wrapElement(source, first, last, name)];
}

// A new head before body: on its own lines when body starts its line.
function headBefore(source: string, at: number, name: string): string {
	const lineStart = source.lastIndexOf("\n", at - 1) + 1;
	const indent = source.slice(lineStart, at);
	if (indent.trim()) {
		return `<head><${name} /></head>`;
	}
	const unit = indent.includes("\t") ? "\t" : "  ";
	const newline = source.includes("\r\n") ? "\r\n" : "\n";
	return `<head>${newline}${indent}${unit}<${name} />${newline}${indent}</head>${newline}${indent}`;
}

// An existing ThemeScript must be the first child of the only head.
function existingScript(heads: SyntaxNode[], existing: SyntaxNode[]): Change[] {
	if (
		existing.length !== 1 ||
		heads.length !== 1 ||
		!inside(heads[0], existing[0])
	) {
		return conflict("Existing ThemeScript placement requires manual review.");
	}
	const first = nodes(heads[0])
		.filter((node) => jsxName(node))
		.at(1);
	if (first !== existing[0]) {
		return conflict("Place ThemeScript first in head before setup.");
	}
	return [];
}

function scriptChanges(
	source: string,
	elements: SyntaxNode[],
	html: SyntaxNode,
	body: SyntaxNode,
	name: string
): Change[] {
	const existing = elements.filter((node) => jsxName(node) === name);
	const heads = elements.filter((node) => jsxName(node) === "head");
	if (existing.length) {
		return existingScript(heads, existing);
	}
	if (!heads.length) {
		if (!inside(html, body)) {
			return conflict("The root body is not inside html.");
		}
		const at = position(body, "start");
		return [{ end: at, start: at, text: headBefore(source, at, name) }];
	}
	const head = single(elements, "head");
	if (isNode(head.closingElement)) {
		const at = position(head.openingElement, "end");
		// Keep the head's own line break and indent before the new child.
		const lead = LINE_LEAD.exec(source.slice(at))?.[0] ?? "";
		return [{ end: at, start: at, text: `${lead}<${name} />` }];
	}
	const opening = source
		.slice(position(head, "start"), position(head, "end"))
		.replace(SELF_CLOSING, ">");
	return [
		{
			end: position(head, "end"),
			start: position(head, "start"),
			text: `${opening}<${name} /></head>`,
		},
	];
}

export function themeSource(
	source: string,
	framework: "next" | "start"
): string {
	const ast = parseSource(source);
	const document = documentFunction(ast, framework);
	if (!document) {
		return conflict(
			"The root document is delegated or computed. Configure theme setup manually before init."
		);
	}
	const elements = nodes(document).filter((node) => jsxName(node));
	const html = single(elements, "html");
	const body = single(elements, "body");
	const provider = themeBinding(ast, "ThemeProvider");
	const script = themeBinding(ast, "ThemeScript");
	assertBindings(ast, document, [provider.name, script.name]);
	const edits = [
		...hydrationChange(html),
		...providerChanges(source, elements, body, provider.name),
		...scriptChanges(source, elements, html, body, script.name),
	];
	const needed = [provider, script].filter((binding) => !binding.imported);
	if (needed.length) {
		const names = [
			provider.imported ? "" : specifier("ThemeProvider", provider.name),
			script.imported ? "" : specifier("ThemeScript", script.name),
		].filter(Boolean);
		edits.push(
			importEdit(
				ast,
				`import { ${names.join(", ")} } from "@mizen-labs/ui/theme";`,
				source
			)
		);
	}
	return changes(source, edits);
}

function assertBindings(
	ast: SyntaxNode,
	document: SyntaxNode,
	bindings: string[]
): void {
	const themeImports = imports(ast).filter((node) =>
		["@mizen-labs/ui", "@mizen-labs/ui/theme"].includes(
			literal(node.source) ?? ""
		)
	);
	const namespaces = themeImports
		.flatMap((node) => (Array.isArray(node.specifiers) ? node.specifiers : []))
		.filter((node) => isNode(node) && node.type === "ImportNamespaceSpecifier");
	if (namespaces.length) {
		conflict(
			"Namespace Mizen imports require manual theme setup; init will not risk duplicating providers."
		);
	}
	const declared = nodes(document)
		.flatMap((node) =>
			node.type === "VariableDeclarator" ? nodes(node.id) : nodes(node.params)
		)
		.map(nameOf);
	if (bindings.some((name) => declared.includes(name))) {
		conflict(
			"A theme import is shadowed in the root document. Resolve the binding before setup."
		);
	}
}

function hydrationEnabled(value: unknown): boolean {
	return (
		value === null ||
		(isNode(value) &&
			value.type === "JSXExpressionContainer" &&
			literalTrue(value.expression))
	);
}
