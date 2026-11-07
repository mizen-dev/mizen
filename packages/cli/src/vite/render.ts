import {
	imports,
	isNode,
	jsxName,
	literal,
	nameOf,
	nodes,
	type SyntaxNode,
} from "../doctor/syntax.js";

function bindings(ast: SyntaxNode, source: string, exported: string): string[] {
	return imports(ast)
		.filter((node) => literal(node.source) === source)
		.flatMap((node) => (Array.isArray(node.specifiers) ? node.specifiers : []))
		.filter(
			(node) =>
				isNode(node) &&
				node.importKind !== "type" &&
				nameOf(node.imported) === exported
		)
		.map((node) => (isNode(node) ? nameOf(node.local) : null))
		.filter((name): name is string => name !== null);
}

function namespaces(ast: SyntaxNode, source: string): string[] {
	return imports(ast)
		.filter((node) => literal(node.source) === source)
		.flatMap((node) => (Array.isArray(node.specifiers) ? node.specifiers : []))
		.filter(
			(node) =>
				isNode(node) &&
				["ImportDefaultSpecifier", "ImportNamespaceSpecifier"].includes(
					node.type
				)
		)
		.map((node) => (isNode(node) ? nameOf(node.local) : null))
		.filter((name): name is string => name !== null);
}

function callsCreateRoot(ast: SyntaxNode, value: unknown): boolean {
	if (!isNode(value) || value.type !== "CallExpression") {
		return false;
	}
	const { callee } = value;
	if (
		bindings(ast, "react-dom/client", "createRoot").includes(
			nameOf(callee) ?? ""
		)
	) {
		return true;
	}
	if (
		!isNode(callee) ||
		callee.type !== "MemberExpression" ||
		callee.computed
	) {
		return false;
	}
	return (
		nameOf(callee.property) === "createRoot" &&
		namespaces(ast, "react-dom/client").includes(nameOf(callee.object) ?? "")
	);
}

export function renderCall(ast: SyntaxNode): SyntaxNode | null {
	if (!(isNode(ast.program) && Array.isArray(ast.program.body))) {
		return null;
	}
	const statements = ast.program.body.filter(
		(node) => isNode(node) && node.type === "ExpressionStatement"
	);
	const renders = statements
		.map((node) => (node as SyntaxNode).expression)
		.filter((node): node is SyntaxNode => {
			if (
				!isNode(node) ||
				node.type !== "CallExpression" ||
				!isNode(node.callee)
			) {
				return false;
			}
			const { callee } = node;
			return (
				callee.type === "MemberExpression" &&
				!callee.computed &&
				nameOf(callee.property) === "render" &&
				callsCreateRoot(ast, callee.object)
			);
		});
	if (
		renders.length !== 1 ||
		!Array.isArray(renders[0].arguments) ||
		renders[0].arguments.length !== 1
	) {
		return null;
	}
	return renders[0];
}

export function renderArgument(ast: SyntaxNode): SyntaxNode | null {
	const call = renderCall(ast);
	if (!(call && Array.isArray(call.arguments))) {
		return null;
	}
	const [tree] = call.arguments;

	return isNode(tree) && ["JSXElement", "JSXFragment"].includes(tree.type)
		? tree
		: null;
}

export function providerNames(ast: SyntaxNode): string[] {
	return ["@mizen-labs/ui/theme", "@mizen-labs/ui"].flatMap((source) =>
		bindings(ast, source, "ThemeProvider")
	);
}

function transparentWrapper(ast: SyntaxNode, tree: SyntaxNode): boolean {
	if (tree.type === "JSXFragment") {
		return true;
	}
	if (bindings(ast, "react", "StrictMode").includes(jsxName(tree) ?? "")) {
		return true;
	}
	if (!(isNode(tree.openingElement) && isNode(tree.openingElement.name))) {
		return false;
	}
	const { name } = tree.openingElement;
	return (
		name.type === "JSXMemberExpression" &&
		["StrictMode", "Fragment"].includes(nameOf(name.property) ?? "") &&
		namespaces(ast, "react").includes(nameOf(name.object) ?? "")
	);
}

export function providerCovers(ast: SyntaxNode, tree: SyntaxNode): boolean {
	if (providerNames(ast).includes(jsxName(tree) ?? "")) {
		return true;
	}
	if (!(transparentWrapper(ast, tree) && Array.isArray(tree.children))) {
		return false;
	}
	const children = tree.children.filter((node) => {
		if (!isNode(node)) {
			return false;
		}
		if (node.type === "JSXText") {
			return String(node.value).trim().length > 0;
		}
		return !(
			node.type === "JSXExpressionContainer" &&
			isNode(node.expression) &&
			node.expression.type === "JSXEmptyExpression"
		);
	});
	return (
		children.length === 1 &&
		isNode(children[0]) &&
		providerCovers(ast, children[0])
	);
}

export function hasProvider(ast: SyntaxNode, tree: SyntaxNode): boolean {
	return nodes(tree).some((node) =>
		providerNames(ast).includes(jsxName(node) ?? "")
	);
}

export function bootstrapCalls(ast: SyntaxNode): SyntaxNode[] {
	if (!(isNode(ast.program) && Array.isArray(ast.program.body))) {
		return [];
	}
	const names = [
		"@mizen-labs/ui/theme/initialize",
		"@mizen-labs/ui/theme",
		"@mizen-labs/ui",
	].flatMap((source) => bindings(ast, source, "initializeTheme"));
	return ast.program.body
		.filter((node) => isNode(node) && node.type === "ExpressionStatement")
		.map((node) => (node as SyntaxNode).expression)
		.filter(
			(node): node is SyntaxNode =>
				isNode(node) &&
				node.type === "CallExpression" &&
				names.includes(nameOf(node.callee) ?? "")
		);
}

export function bootstrapBefore(ast: SyntaxNode): boolean {
	const render = renderCall(ast);
	const calls = bootstrapCalls(ast);
	return (
		render !== null &&
		calls.length === 1 &&
		typeof render.start === "number" &&
		typeof calls[0].start === "number" &&
		calls[0].start < render.start
	);
}

export function supportsInitialization(
	manifest: { exports?: unknown } | undefined
): boolean {
	const map = manifest?.exports;
	return !!map && typeof map === "object" && "./theme/initialize" in map;
}
