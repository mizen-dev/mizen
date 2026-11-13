import { check, type Diagnostic } from "./report.js";
import {
	FUNCTIONS,
	imports,
	isNode,
	jsxName,
	literal,
	nameOf,
	nodes,
	property,
	returned,
	type SyntaxNode,
	topLevelFunction,
} from "./syntax.js";

const THEME_SOURCES = ["@mizen-labs/ui/theme", "@mizen-labs/ui"];
const JSX_PARENTS = ["JSXElement", "JSXFragment"];

function aliases(
	ast: SyntaxNode,
	exported: string,
	sources = THEME_SOURCES
): string[] {
	return imports(ast)
		.filter((node) => sources.includes(literal(node.source) ?? ""))
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

// The elements that always render under an element: its JSX children, not its
// attributes, conditions, or callbacks.
function rendered(root: unknown): SyntaxNode[] {
	if (!(isNode(root) && JSX_PARENTS.includes(root.type))) {
		return [];
	}
	const children = Array.isArray(root.children) ? root.children : [];
	return [root, ...children.flatMap(rendered)];
}

// An element with one of these names that always renders and has content.
function rendersNamed(root: SyntaxNode, names: string[]): boolean {
	return rendered(root).some(
		(node) =>
			names.includes(jsxName(node) ?? "") &&
			isNode(node.openingElement) &&
			node.openingElement.selfClosing !== true
	);
}

const isChildren = (node: SyntaxNode) =>
	isNode(node.expression) &&
	node.expression.type === "Identifier" &&
	node.expression.name === "children";

// True when {children} always renders inside one of the providers.
function wrapsChildren(
	node: unknown,
	providers: string[],
	inside = false
): boolean {
	if (!isNode(node)) {
		return false;
	}
	if (node.type === "JSXExpressionContainer") {
		return inside && isChildren(node);
	}
	if (!(JSX_PARENTS.includes(node.type) && Array.isArray(node.children))) {
		return false;
	}
	const within = inside || providers.includes(jsxName(node) ?? "");
	return node.children.some((child) => wrapsChildren(child, providers, within));
}

// Where a name can get a new meaning: a variable, a parameter, an assignment,
// a catch binding, or a nested function or class of that name.
function bindingSites(node: SyntaxNode, topLevel: unknown[]): unknown[] {
	if (node.type === "VariableDeclarator") {
		return [node.id];
	}
	if (node.type === "AssignmentExpression") {
		return [node.left];
	}
	if (node.type === "CatchClause") {
		return [node.param];
	}
	if (FUNCTIONS.includes(node.type) || node.type === "ClassDeclaration") {
		return [node.params, topLevel.includes(node) ? null : node.id];
	}
	return [];
}

function rebound(ast: SyntaxNode, names: string[]): boolean {
	const topLevel =
		isNode(ast.program) && Array.isArray(ast.program.body)
			? ast.program.body
			: [];
	return nodes(nodes(ast).flatMap((node) => bindingSites(node, topLevel))).some(
		(node) => node.type === "Identifier" && names.includes(String(node.name))
	);
}

// TanStack Router renders Wrap and InnerWrap around every route, the root
// document included, so a provider there covers the app. The module must
// create one router, and the wrapper must always return {children} inside
// ThemeProvider.
export function routerWraps(ast: SyntaxNode): boolean {
	const providers = aliases(ast, "ThemeProvider");
	const routers = aliases(ast, "createRouter", ["@tanstack/react-router"]);
	const calls = nodes(ast).filter(
		(node) =>
			node.type === "CallExpression" &&
			routers.includes(nameOf(node.callee) ?? "")
	);
	const [call] = calls;
	if (!(call && calls.length === 1 && Array.isArray(call.arguments))) {
		return false;
	}
	const values = ["Wrap", "InnerWrap"].map((key) =>
		property((call.arguments as unknown[])[0], key)
	);
	const named = values
		.map((value) =>
			isNode(value) && value.type === "Identifier" ? nameOf(value) : null
		)
		.filter((name): name is string => name !== null);
	if (rebound(ast, [...providers, ...routers, ...named])) {
		return false;
	}
	return values
		.map((value) =>
			isNode(value) && value.type === "Identifier"
				? topLevelFunction(ast, nameOf(value))
				: value
		)
		.some(
			(wrapper) =>
				isNode(wrapper) &&
				FUNCTIONS.includes(wrapper.type) &&
				wrapsChildren(returned(wrapper), providers)
		);
}

const THEME_REPAIR =
	"Render ThemeScript before body content and ThemeProvider around the app. If another component renders them, or renders them under a condition, confirm in a browser that the first paint has the stored theme and that hydration reports no mismatch.";

export function themeCheck(
	ast: SyntaxNode,
	path: string,
	document: SyntaxNode | null,
	router: string | null = null
): Diagnostic {
	const scripts = aliases(ast, "ThemeScript");
	const providers = aliases(ast, "ThemeProvider");
	const named = (name: string) =>
		nodes(document).filter((node) => jsxName(node) === name);
	const scriptInHead = named("head").some((head) =>
		rendered(head).some((node) => scripts.includes(jsxName(node) ?? ""))
	);
	const providerInBody = named("body").some((body) =>
		rendersNamed(body, providers)
	);
	// Presence is evidence of syntax, not proof of runtime rendering or first paint.
	if (scriptInHead && providerInBody) {
		return check(
			"setup.theme",
			"pass",
			"Root syntax contains ThemeScript in head and ThemeProvider in body; runtime behavior still needs a browser check.",
			[path]
		);
	}
	if (scriptInHead && router) {
		return check(
			"setup.theme",
			"pass",
			"Root syntax contains ThemeScript in head, and the router renders ThemeProvider in Wrap or InnerWrap; runtime behavior still needs a browser check.",
			[path, router]
		);
	}
	return check(
		"setup.theme",
		"unverified",
		`${scriptInHead ? "ThemeProvider was not found around the content of the root document body, or around {children} in the Wrap or InnerWrap of the one createRouter call in the router module beside the routes" : "ThemeScript was not found in the head of the root document"}. Doctor reads these places only. It does not follow other components, and it does not count an element under a condition.`,
		[path],
		THEME_REPAIR
	);
}
