import { parse } from "@babel/parser";

// A small structural view keeps diagnostics independent of parser-specific unions.
export interface SyntaxNode {
	type: string;
	[key: string]: unknown;
}

export function isNode(value: unknown): value is SyntaxNode {
	return (
		!!value &&
		typeof value === "object" &&
		"type" in value &&
		typeof value.type === "string"
	);
}

export function nodes(value: unknown): SyntaxNode[] {
	if (Array.isArray(value)) {
		return value.flatMap(nodes);
	}
	if (!isNode(value)) {
		return [];
	}
	return [value, ...Object.values(value).flatMap(nodes)];
}

export function parseSource(source: string): SyntaxNode {
	return parse(source, {
		attachComment: false,
		plugins: ["jsx", "typescript"],
		sourceType: "unambiguous",
	}) as unknown as SyntaxNode;
}

export function literal(node: unknown): string | null {
	return isNode(node) &&
		node.type === "StringLiteral" &&
		typeof node.value === "string"
		? node.value
		: null;
}

export function nameOf(node: unknown): string | null {
	if (!isNode(node)) {
		return null;
	}
	if (typeof node.name === "string") {
		return node.name;
	}
	return literal(node);
}

function unwrap(node: unknown): unknown {
	if (!isNode(node)) {
		return node;
	}
	if (
		["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression"].includes(
			node.type
		)
	) {
		return unwrap(node.expression);
	}
	return node;
}

export const FUNCTIONS = [
	"ArrowFunctionExpression",
	"ClassMethod",
	"FunctionDeclaration",
	"FunctionExpression",
	"ObjectMethod",
];

// Like nodes, but without the bodies of nested functions.
function ownNodes(value: unknown): SyntaxNode[] {
	if (Array.isArray(value)) {
		return value.flatMap(ownNodes);
	}
	if (!isNode(value)) {
		return [];
	}
	return FUNCTIONS.includes(value.type)
		? [value]
		: [value, ...Object.values(value).flatMap(ownNodes)];
}

// What a config function always returns: an arrow's expression body, or the
// one return statement that ends its block. A conditional or early return
// depends on runtime values, so it yields nothing.
export function returned(callback: SyntaxNode): unknown {
	const { body } = callback;
	// A generator returns an iterator, not the value after return.
	if (callback.generator === true) {
		return null;
	}
	if (!(isNode(body) && body.type === "BlockStatement")) {
		return unwrap(body);
	}
	const statements = Array.isArray(body.body) ? body.body : [];
	const last: unknown = statements.at(-1);
	const returns = ownNodes(statements).filter(
		(node) => node.type === "ReturnStatement"
	);
	return returns.length === 1 && returns[0] === last
		? unwrap(returns[0].argument)
		: null;
}

// A binding that is declared once and never referenced again cannot change
// before it is exported.
function declared(ast: SyntaxNode, identifier: unknown): unknown {
	if (
		nodes(ast).filter(
			(node) => node.type === "Identifier" && node.name === identifier
		).length !== 2
	) {
		return null;
	}
	const variable = nodes(ast).find(
		(node) =>
			node.type === "VariableDeclarator" && nameOf(node.id) === identifier
	);
	return unwrap(variable?.init);
}

export function staticConfig(ast: SyntaxNode): SyntaxNode | null {
	const exported = nodes(ast).find(
		(node) => node.type === "ExportDefaultDeclaration"
	);
	if (!exported) {
		return null;
	}
	let value = unwrap(exported.declaration);
	if (isNode(value) && value.type === "CallExpression") {
		value = viteConfigArgument(ast, value);
	}
	if (isNode(value) && value.type === "Identifier") {
		value = declared(ast, value.name);
	}
	if (isNode(value) && FUNCTIONS.includes(value.type)) {
		value = returned(value);
	}
	return isNode(value) && value.type === "ObjectExpression" ? value : null;
}

export function property(object: unknown, key: string): unknown {
	if (
		!isNode(object) ||
		object.type !== "ObjectExpression" ||
		!Array.isArray(object.properties)
	) {
		return null;
	}
	// Any spread or computed key can override a literal property at runtime.
	if (
		object.properties.some(
			(item) =>
				!(
					isNode(item) && ["ObjectProperty", "ObjectMethod"].includes(item.type)
				) || item.computed
		)
	) {
		return null;
	}
	const found = object.properties.filter(
		(item) => isNode(item) && nameOf(item.key) === key
	);
	if (found.length !== 1) {
		return null;
	}
	const selected = found[0] as SyntaxNode;
	return selected.type === "ObjectProperty" ? selected.value : null;
}

// True when an object literal names the key at all, readable or not.
export function member(object: unknown, key: string): boolean {
	return (
		isNode(object) &&
		Array.isArray(object.properties) &&
		object.properties.some((item) => isNode(item) && nameOf(item.key) === key)
	);
}

export function staticArrayContains(
	value: unknown,
	expected: string
): boolean | null {
	if (
		!isNode(value) ||
		value.type !== "ArrayExpression" ||
		!Array.isArray(value.elements)
	) {
		return null;
	}
	const strings = value.elements.map(literal);
	if (strings.some((item) => item === null)) {
		return null;
	}
	return strings.includes(expected);
}

export function imports(ast: SyntaxNode) {
	return nodes(ast).filter(
		(node) => node.type === "ImportDeclaration" && node.importKind !== "type"
	);
}

export function jsxName(node: unknown): string | null {
	return isNode(node) &&
		node.type === "JSXElement" &&
		isNode(node.openingElement)
		? nameOf(node.openingElement.name)
		: null;
}

function viteConfigArgument(ast: SyntaxNode, call: SyntaxNode): unknown {
	const allowed = imports(ast)
		.filter((node) => literal(node.source) === "vite")
		.flatMap((node) => (Array.isArray(node.specifiers) ? node.specifiers : []))
		.filter((node) => isNode(node) && nameOf(node.imported) === "defineConfig")
		.map((node) => (isNode(node) ? nameOf(node.local) : null));
	if (
		!(allowed.includes(nameOf(call.callee)) && Array.isArray(call.arguments)) ||
		call.arguments.length !== 1
	) {
		return null;
	}
	return unwrap(call.arguments[0]);
}

export function topLevelFunction(
	ast: SyntaxNode,
	name: string | null
): SyntaxNode | null {
	if (!(isNode(ast.program) && Array.isArray(ast.program.body))) {
		return null;
	}
	return (
		ast.program.body.find(
			(node) =>
				isNode(node) &&
				node.type === "FunctionDeclaration" &&
				nameOf(node.id) === name
		) ?? null
	);
}

export function documentFunction(
	ast: SyntaxNode,
	framework: "next" | "start"
): SyntaxNode | null {
	if (framework === "next") {
		const exported = nodes(ast).find(
			(node) => node.type === "ExportDefaultDeclaration"
		);
		const value = exported?.declaration;
		if (isNode(value) && value.type === "FunctionDeclaration") {
			return value;
		}
		return topLevelFunction(ast, nameOf(value));
	}
	const routeImports = imports(ast)
		.filter((node) => literal(node.source) === "@tanstack/react-router")
		.flatMap((node) => (Array.isArray(node.specifiers) ? node.specifiers : []))
		.filter(
			(node) => isNode(node) && nameOf(node.imported) === "createRootRoute"
		)
		.map((node) => (isNode(node) ? nameOf(node.local) : null));
	const route = nodes(ast).find(
		(node) =>
			node.type === "CallExpression" &&
			routeImports.includes(nameOf(node.callee))
	);
	const config =
		route && Array.isArray(route.arguments) ? route.arguments[0] : null;
	return topLevelFunction(ast, nameOf(property(config, "shellComponent")));
}

export function literalTrue(value: unknown): boolean {
	return (
		isNode(value) && value.type === "BooleanLiteral" && value.value === true
	);
}
