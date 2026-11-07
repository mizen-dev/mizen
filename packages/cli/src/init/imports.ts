import {
	imports,
	isNode,
	literal,
	nameOf,
	nodes,
	type SyntaxNode,
} from "../doctor/syntax.js";
import { conflict, position } from "./edit.js";

export function uniqueName(ast: SyntaxNode, preferred: string): string {
	const used = new Set(nodes(ast).map((node) => nameOf(node)));
	let name = preferred;
	let suffix = 1;
	while (used.has(name)) {
		name = `${preferred}${suffix}`;
		suffix += 1;
	}
	return name;
}

/** The export's own name when the module leaves it free, else a Mizen alias. */
export function bindingName(ast: SyntaxNode, exported: string): string {
	const used = new Set(nodes(ast).map((node) => nameOf(node)));
	if (!used.has(exported)) {
		return exported;
	}
	const alias = `Mizen${exported[0]?.toUpperCase()}${exported.slice(1)}`;
	return uniqueName(ast, alias);
}

/** An import specifier, aliased only when the local name differs. */
export function specifier(exported: string, local: string): string {
	return exported === local ? exported : `${exported} as ${local}`;
}

export function importedName(
	ast: SyntaxNode,
	exported: string,
	source: string
): string | null {
	const found = imports(ast)
		.filter((node) => literal(node.source) === source)
		.flatMap((node) => (Array.isArray(node.specifiers) ? node.specifiers : []))
		.filter(
			(node) =>
				isNode(node) &&
				node.importKind !== "type" &&
				nameOf(node.imported) === exported
		);
	if (found.length > 1) {
		return conflict(`Multiple ${exported} imports require manual review.`);
	}
	return found.length ? nameOf((found[0] as SyntaxNode).local) : null;
}

export function defaultImport(ast: SyntaxNode, source: string): string | null {
	const specifiers = imports(ast)
		.filter((node) => literal(node.source) === source)
		.flatMap((node) => (Array.isArray(node.specifiers) ? node.specifiers : []))
		.filter((node) => isNode(node) && node.type === "ImportDefaultSpecifier");
	return specifiers.length === 1
		? nameOf((specifiers[0] as SyntaxNode).local)
		: null;
}

function insertAt(at: number, text: string) {
	return { end: at, start: at, text };
}

// Where a module with no imports takes its first one: after its directives,
// else before its first statement.
function firstImport(program: SyntaxNode, statement: string, newline: string) {
	const directives = Array.isArray(program.directives)
		? program.directives
		: [];
	const directive = directives.at(-1);
	if (isNode(directive) && typeof directive.end === "number") {
		return insertAt(directive.end, `${newline}${newline}${statement}`);
	}
	const body = Array.isArray(program.body) ? program.body : [];
	const [first] = body;
	if (isNode(first) && typeof first.start === "number") {
		return insertAt(first.start, `${statement}${newline}${newline}`);
	}
	return insertAt(0, `${statement}${newline}`);
}

// New imports go after the module's last import, or before its first
// statement when it has none, so the file keeps its own spacing. A
// stylesheet goes first instead, so the app's own CSS can override it.
export function importEdit(
	ast: SyntaxNode,
	statement: string,
	source: string,
	place: "first" | "last" = "last"
) {
	const { program } = ast;
	if (!isNode(program)) {
		return conflict("No editable module body was found.");
	}
	const newline = source.includes("\r\n") ? "\r\n" : "\n";
	const found = (Array.isArray(program.body) ? program.body : []).filter(
		(node): node is SyntaxNode =>
			isNode(node) && node.type === "ImportDeclaration"
	);
	if (!found.length) {
		return firstImport(program, statement, newline);
	}
	return place === "first"
		? insertAt(position(found[0], "start"), `${statement}${newline}`)
		: insertAt(position(found.at(-1), "end"), `${newline}${statement}`);
}
