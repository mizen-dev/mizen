import { isNode, jsxName, nodes, type SyntaxNode } from "../doctor/syntax.js";
import { type Change, conflict, position } from "../init/edit.js";
import {
	bindingName,
	importEdit,
	importedName,
	specifier,
} from "../init/imports.js";
import {
	bootstrapBefore,
	bootstrapCalls,
	providerNames,
	renderCall,
} from "./render.js";

export function bootstrapEdits(
	source: string,
	ast: SyntaxNode,
	tree: SyntaxNode
): Change[] {
	if (bootstrapBefore(ast)) {
		return [];
	}
	if (bootstrapCalls(ast).length) {
		return conflict(
			"Call initializeTheme once before createRoot; review existing bootstrap order before init."
		);
	}
	ensureDefaultProvider(ast, tree);
	const existing = [
		"@mizen-labs/ui/theme/initialize",
		"@mizen-labs/ui/theme",
		"@mizen-labs/ui",
	]
		.map((sourcePath) => importedName(ast, "initializeTheme", sourcePath))
		.find((binding) => binding !== null);
	const name = existing ?? bindingName(ast, "initializeTheme");
	const call = renderCall(ast);
	if (!call) {
		return conflict("No conventional root render call was found.");
	}
	const at = position(call, "start");
	const newline = source.includes("\r\n") ? "\r\n" : "\n";
	const edits: Change[] = [
		{ end: at, start: at, text: `${name}();${newline}` },
	];
	if (!existing) {
		edits.push(
			importEdit(
				ast,
				`import { ${specifier("initializeTheme", name)} } from "@mizen-labs/ui/theme/initialize";`,
				source
			)
		);
	}
	return edits;
}

function ensureDefaultProvider(ast: SyntaxNode, tree: SyntaxNode): void {
	const provider = nodes(tree).find((node) =>
		providerNames(ast).includes(jsxName(node) ?? "")
	);
	if (
		provider &&
		isNode(provider.openingElement) &&
		Array.isArray(provider.openingElement.attributes) &&
		provider.openingElement.attributes.length
	) {
		conflict(
			"Initialize the theme with options matching your custom ThemeProvider before init."
		);
	}
}
