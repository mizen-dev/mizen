import { createRequire } from "node:module";
import { join } from "node:path";
import { check, type Diagnostic } from "../doctor/report.js";
import { imports, literal, parseSource } from "../doctor/syntax.js";
import { viteEntry } from "./entry.js";
import { bootstrapBefore, providerCovers, renderArgument } from "./render.js";

export async function viteSetupChecks(project: string): Promise<Diagnostic[]> {
	const entry = await viteEntry(project);
	if (!entry) {
		return [
			check(
				"setup.root",
				"unverified",
				"index.html does not select one supported src/main entry.",
				[join(project, "index.html")],
				"Use a single module entry at src/main.tsx or src/main.jsx, or review custom Vite entry wiring manually."
			),
		];
	}
	const path = join(project, entry.path);
	try {
		const ast = parseSource(entry.source);
		const css = imports(ast).some(
			(node) =>
				literal(node.source) === "@mizen-labs/ui/styles.css" &&
				Array.isArray(node.specifiers) &&
				node.specifiers.length === 0
		);
		const tree = renderArgument(ast);
		const provider = tree !== null && providerCovers(ast, tree);
		return [
			bootstrapCheck(project, ast, path),
			check(
				"setup.bundling",
				"pass",
				"Client Vite bundles package CSS imports; no SSR bundling setting is required.",
				[path]
			),
			check(
				"setup.stylesheet",
				css ? "pass" : "unverified",
				css
					? "The client entry imports Mizen's compiled stylesheet."
					: "No direct Mizen stylesheet import was verified in the client entry.",
				[path],
				"Import @mizen-labs/ui/styles.css in the module loaded by index.html."
			),
			check(
				"setup.theme",
				provider ? "pass" : "unverified",
				provider
					? "ThemeProvider covers the mounted client tree. No SSR ThemeScript is needed for this client-only entry."
					: "A ThemeProvider covering createRoot(...).render(...) was not verified.",
				[path],
				"Wrap the mounted React tree in ThemeProvider from @mizen-labs/ui/theme; keep existing StrictMode and app providers."
			),
		];
	} catch {
		return [
			check(
				"setup.root",
				"unverified",
				"The Vite client entry could not be parsed; it was not executed.",
				[path],
				"Check entry syntax and review custom mounting code manually."
			),
		];
	}
}

function bootstrapCheck(
	project: string,
	ast: import("../doctor/syntax.js").SyntaxNode,
	path: string
): Diagnostic {
	if (!bootstrapBefore(ast)) {
		return check(
			"setup.bootstrap",
			"unverified",
			"A synchronous initializeTheme call before React mounting was not verified.",
			[path],
			"Call initializeTheme from @mizen-labs/ui/theme/initialize before createRoot, using options matching ThemeProvider."
		);
	}
	try {
		createRequire(join(project, "package.json")).resolve(
			"@mizen-labs/ui/theme/initialize"
		);
	} catch {
		return check(
			"package.bootstrap",
			"error",
			"This installed UI build does not expose client theme initialization.",
			[join(project, "package.json")],
			"Rebuild and install a matching Mizen UI archive before initializing the app."
		);
	}
	return check(
		"setup.bootstrap",
		"pass",
		"Theme initialization is declared before the client render call.",
		[path]
	);
}
