import { dirname, join } from "node:path";
import { viteSetupChecks } from "../vite/doctor.js";
import { type Manifest, readOptional } from "./files.js";
import { check, type Diagnostic } from "./report.js";
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
	property,
	type SyntaxNode,
	staticArrayContains,
	staticConfig,
	topLevelFunction,
} from "./syntax.js";

async function sourceAt(project: string, candidates: string[]) {
	const found = (
		await Promise.all(
			candidates.map(async (candidate) => {
				const path = join(project, candidate);
				const source = await readOptional(path);
				return source === null ? null : { path, source };
			})
		)
	).filter((item) => item !== null);
	return found.length === 1 ? found[0] : null;
}

async function configCheck(
	project: string,
	framework: "next" | "start"
): Promise<Diagnostic> {
	const prefix = framework === "next" ? "next.config" : "vite.config";
	const file = await sourceAt(
		project,
		["js", "mjs", "cjs", "ts", "mts", "cts"].map(
			(extension) => `${prefix}.${extension}`
		)
	);
	const repair =
		framework === "next"
			? 'Include "@mizen-labs/ui" in transpilePackages.'
			: 'Include "@mizen-labs/ui" in ssr.noExternal.';
	if (!file) {
		return check(
			"setup.bundling",
			"unverified",
			"No single supported framework configuration was found.",
			[],
			repair
		);
	}
	let ast: SyntaxNode;
	try {
		ast = parseSource(file.source);
	} catch {
		return check(
			"setup.bundling",
			"unverified",
			"The configuration could not be parsed; it was not executed.",
			[file.path],
			"Check its syntax and verify the Mizen bundling setting manually."
		);
	}
	const config = staticConfig(ast);
	const value =
		framework === "next"
			? property(config, "transpilePackages")
			: property(property(config, "ssr"), "noExternal");
	const present =
		framework === "start" && literalTrue(value)
			? true
			: staticArrayContains(value, "@mizen-labs/ui");
	return check(
		"setup.bundling",
		present === true ? "pass" : "unverified",
		present === true
			? "The static configuration includes Mizen in framework bundling."
			: "Bundling could not be verified. Doctor reads an object literal that the configuration exports, passes to defineConfig, or returns at the end of a config function. It does not run the file, so a computed, spread, or conditional setting stays unverified.",
		[file.path],
		`${repair} If the setting is computed, confirm that the production server build renders a Mizen component.`
	);
}

const THEME_SOURCES = ["@mizen-labs/ui/theme", "@mizen-labs/ui"];

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

// TanStack Router renders Wrap and InnerWrap around every route, the root
// document included, so a provider there covers the app.
function routerWraps(ast: SyntaxNode): boolean {
	const providers = aliases(ast, "ThemeProvider");
	const routers = aliases(ast, "createRouter", ["@tanstack/react-router"]);
	const wrappers = nodes(ast)
		.filter(
			(node) =>
				node.type === "CallExpression" &&
				routers.includes(nameOf(node.callee) ?? "") &&
				Array.isArray(node.arguments)
		)
		.flatMap((call) =>
			["Wrap", "InnerWrap"].map((key) =>
				property((call.arguments as unknown[])[0], key)
			)
		)
		.map((value) =>
			isNode(value) && value.type === "Identifier"
				? topLevelFunction(ast, nameOf(value))
				: value
		);
	return nodes(wrappers).some((node) =>
		providers.includes(jsxName(node) ?? "")
	);
}

// The router module beside the routes directory, when it wraps the app in
// ThemeProvider.
async function wrappingRouter(root: string): Promise<string | null> {
	const router = await sourceAt(
		dirname(dirname(root)),
		["tsx", "jsx", "ts", "js"].map((extension) => `router.${extension}`)
	);
	try {
		return router && routerWraps(parseSource(router.source))
			? router.path
			: null;
	} catch {
		return null;
	}
}

const THEME_REPAIR =
	"Render ThemeScript before body content and ThemeProvider around the app. If another component renders them, confirm in a browser that the first paint has the stored theme and that hydration reports no mismatch.";

function themeCheck(
	ast: SyntaxNode,
	path: string,
	document: SyntaxNode | null,
	router: string | null = null
): Diagnostic {
	const scripts = aliases(ast, "ThemeScript");
	const providers = aliases(ast, "ThemeProvider");
	const heads = nodes(document).filter((node) => jsxName(node) === "head");
	const bodies = nodes(document).filter((node) => jsxName(node) === "body");
	const scriptInHead = heads.some((head) =>
		nodes(head).some((node) => scripts.includes(jsxName(node) ?? ""))
	);
	const providerInBody = bodies.some((body) =>
		nodes(body).some((node) => providers.includes(jsxName(node) ?? ""))
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
		`${scriptInHead ? "ThemeProvider was not found in the root document body, or in the Wrap or InnerWrap of a createRouter call in the router module beside the routes" : "ThemeScript was not found in the head of the root document"}. Doctor reads these places only and does not follow other components.`,
		[path],
		THEME_REPAIR
	);
}

function stylesheetCheck(ast: SyntaxNode, path: string): Diagnostic {
	const cssImports = imports(ast).filter(
		(node) => literal(node.source) === "@mizen-labs/ui/styles.css"
	);
	const direct = cssImports.some(
		(node) => Array.isArray(node.specifiers) && node.specifiers.length === 0
	);
	const urlBindings = imports(ast)
		.filter((node) => literal(node.source) === "@mizen-labs/ui/styles.css?url")
		.flatMap((node) => (Array.isArray(node.specifiers) ? node.specifiers : []))
		.map((node) => (isNode(node) ? nameOf(node.local) : null))
		.filter((name): name is string => name !== null);
	const link = nodes(ast).some(
		(node) =>
			urlBindings.includes(nameOf(property(node, "href")) ?? "") &&
			literal(property(node, "rel")) === "stylesheet"
	);
	const present = direct || link;
	return check(
		"setup.stylesheet",
		present ? "pass" : "unverified",
		present
			? "Root syntax declares Mizen's compiled stylesheet. Verify delivery in a browser."
			: "No direct stylesheet import or URL/link declaration was verified. Indirect CSS or custom extraction may supply it.",
		[path],
		"Import @mizen-labs/ui/styles.css at the app root, or verify your equivalent CSS pipeline manually."
	);
}

// Two separately compiled StyleX stylesheets do not agree on rule priority.
export function stylexCheck(
	project: string,
	manifest: Manifest,
	setup: Diagnostic[]
): Diagnostic[] {
	const declared = Object.keys({
		...manifest.dependencies,
		...manifest.devDependencies,
	}).filter((name) => name.includes("stylex") && !name.includes("eslint"));
	const compiled = setup.some(
		(item) => item.id === "setup.stylesheet" && item.status === "pass"
	);
	return declared.length && compiled
		? [
				check(
					"setup.stylex",
					"unverified",
					`This app declares StyleX (${declared.join(", ")}) and imports Mizen's compiled stylesheet. Two separately compiled StyleX stylesheets do not agree on rule priority.`,
					[join(project, "package.json")],
					"Style app-owned elements in plain CSS with the --mizen-* variables and remove StyleX. To keep StyleX, compile the Mizen source in the same StyleX build and remove the styles.css import."
				),
			]
		: [];
}

export async function setupChecks(
	project: string,
	framework: "next" | "start" | "vite"
): Promise<Diagnostic[]> {
	if (framework === "vite") {
		return viteSetupChecks(project);
	}
	const candidates =
		framework === "next"
			? ["app/layout", "src/app/layout"]
			: ["src/routes/__root", "app/routes/__root"];
	const root = await sourceAt(
		project,
		candidates.flatMap((path) =>
			["tsx", "jsx", "ts", "js"].map((extension) => `${path}.${extension}`)
		)
	);
	const config = await configCheck(project, framework);
	if (!root) {
		return [
			config,
			check(
				"setup.root",
				"unverified",
				"No single conventional root layout was found.",
				[],
				"Use Next App Router or review the custom Start root configuration manually."
			),
		];
	}
	try {
		const ast = parseSource(root.source);
		return [
			config,
			stylesheetCheck(ast, root.path),
			themeCheck(
				ast,
				root.path,
				documentFunction(ast, framework),
				framework === "start" ? await wrappingRouter(root.path) : null
			),
		];
	} catch {
		return [
			config,
			check(
				"setup.root",
				"unverified",
				"The root module could not be parsed; it was not executed.",
				[root.path],
				"Check root module syntax and verify styles and theme setup manually."
			),
		];
	}
}
