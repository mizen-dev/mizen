import {
	isNode,
	nameOf,
	parseSource,
	property,
	type SyntaxNode,
	staticArrayContains,
	staticConfig,
} from "../doctor/syntax.js";
import {
	addProperty,
	type Change,
	changes,
	conflict,
	fileEdit,
	position,
	sourceFile,
} from "./edit.js";

function literalObject(value: unknown): value is SyntaxNode {
	if (
		!isNode(value) ||
		value.type !== "ObjectExpression" ||
		!Array.isArray(value.properties)
	) {
		return false;
	}
	return value.properties.every(
		(item) =>
			isNode(item) &&
			!item.computed &&
			["ObjectProperty", "ObjectMethod"].includes(item.type)
	);
}

export function member(object: SyntaxNode, key: string): boolean {
	if (!literalObject(object)) {
		return conflict(
			"Computed keys or spreads can override configuration. Configure Mizen manually before init."
		);
	}
	const matches = (object.properties as SyntaxNode[]).filter(
		(item) => nameOf(item.key) === key
	);
	if (matches.length > 1) {
		return conflict(`Duplicate ${key} configuration requires manual review.`);
	}
	return matches.length === 1;
}

function arrayChange(value: unknown): Change | null {
	const present = staticArrayContains(value, "@mizen-labs/ui");
	if (present === null) {
		return conflict(
			"The bundling setting is not a literal string array. Configure Mizen manually."
		);
	}
	if (present) {
		return null;
	}
	const at = position(value, "start") + 1;
	const node = value as SyntaxNode;
	const comma = (node.elements as unknown[]).length ? ", " : "";
	return { end: at, start: at, text: `"@mizen-labs/ui"${comma}` };
}

function bundlingChange(
	_source: string,
	config: SyntaxNode,
	framework: "next" | "start"
): Change | null {
	if (framework === "next") {
		if (!member(config, "transpilePackages")) {
			return addProperty(config, "transpilePackages", '["@mizen-labs/ui"]');
		}
		return arrayChange(property(config, "transpilePackages"));
	}
	if (!member(config, "ssr")) {
		return addProperty(config, "ssr", '{ noExternal: ["@mizen-labs/ui"] }');
	}
	const ssr = property(config, "ssr");
	if (!literalObject(ssr)) {
		return conflict("Computed ssr configuration needs manual setup.");
	}
	if (!member(ssr, "noExternal")) {
		return addProperty(ssr, "noExternal", '["@mizen-labs/ui"]');
	}
	const external = property(ssr, "noExternal");
	if (
		isNode(external) &&
		external.type === "BooleanLiteral" &&
		external.value === true
	) {
		return null;
	}
	return arrayChange(external);
}

export async function configEdit(
	project: string,
	framework: "next" | "start" | "vite"
) {
	if (framework === "vite") {
		return null;
	}
	const prefix = framework === "next" ? "next.config" : "vite.config";
	const template = framework === "next" ? "export default {};\n" : undefined;
	const file = await sourceFile(
		project,
		["mjs", "js", "ts", "mts", "cjs", "cts"].map(
			(extension) => `${prefix}.${extension}`
		),
		template
	);
	const config = staticConfig(parseSource(file.source));
	if (!config) {
		return conflict(
			`${file.path} has a wrapped or computed export. Configure Mizen bundling manually before init.`
		);
	}
	const edit = bundlingChange(file.source, config, framework);
	const after = edit ? changes(file.source, [edit]) : file.source;
	return fileEdit(file.path, file.before, after);
}
