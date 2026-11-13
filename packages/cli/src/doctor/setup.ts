import { dirname, join } from "node:path";
import { viteSetupChecks } from "../vite/doctor.js";
import { type Manifest, readOptional } from "./files.js";
import { check, type Diagnostic } from "./report.js";
import {
	documentFunction,
	imports,
	isNode,
	literal,
	literalTrue,
	member,
	nameOf,
	nodes,
	parseSource,
	property,
	type SyntaxNode,
	staticArrayContains,
	staticConfig,
} from "./syntax.js";
import { routerWraps, themeCheck } from "./theme.js";

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

// Vite still externalizes a package that ssr.external lists, whatever
// ssr.noExternal says.
function bundledBySsr(ssr: unknown): boolean | null {
	const included = property(ssr, "noExternal");
	const excluded =
		member(ssr, "external") &&
		staticArrayContains(property(ssr, "external"), "@mizen-labs/ui") !== false;
	if (excluded) {
		return null;
	}
	return literalTrue(included)
		? true
		: staticArrayContains(included, "@mizen-labs/ui");
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
	let present: boolean | null;
	try {
		const config = staticConfig(parseSource(file.source));
		present =
			framework === "next"
				? staticArrayContains(
						property(config, "transpilePackages"),
						"@mizen-labs/ui"
					)
				: bundledBySsr(property(config, "ssr"));
	} catch {
		return check(
			"setup.bundling",
			"unverified",
			"The configuration could not be read; it was not executed.",
			[file.path],
			"Check its syntax and verify the Mizen bundling setting manually."
		);
	}
	return check(
		"setup.bundling",
		present === true ? "pass" : "unverified",
		present === true
			? "The static configuration includes Mizen in framework bundling."
			: "Bundling could not be verified. Doctor reads an object literal that the configuration exports, passes to defineConfig, or returns at the end of a config function. It does not run the file, so a computed, spread, or conditional setting stays unverified, and so does a Vite config that sets ssr.external.",
		[file.path],
		`${repair} If the setting is computed, confirm that the production server build renders a Mizen component.`
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
