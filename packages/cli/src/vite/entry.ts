import { join } from "node:path";
import { type DefaultTreeAdapterTypes, parse } from "parse5";
import { readOptional } from "../doctor/files.js";

const ENTRIES = new Set([
	"src/main.tsx",
	"src/main.jsx",
	"src/main.ts",
	"src/main.js",
]);
const DOT_PREFIX = /^\.\//;
type HtmlNode = DefaultTreeAdapterTypes.Node;

function htmlNodes(node: HtmlNode): HtmlNode[] {
	return [
		node,
		...("childNodes" in node ? node.childNodes.flatMap(htmlNodes) : []),
	];
}

function attribute(node: HtmlNode, name: string): string | undefined {
	return "attrs" in node
		? node.attrs.find((item) => item.name === name)?.value
		: undefined;
}

function htmlEntry(source: string): string | null {
	const document = htmlNodes(parse(source));
	if (document.some((node) => node.nodeName === "base")) {
		return null;
	}
	const scripts = document.filter(
		(node) => node.nodeName === "script" && attribute(node, "type") === "module"
	);
	if (scripts.length !== 1) {
		return null;
	}
	const src = attribute(scripts[0], "src");
	if (!src) {
		return null;
	}
	const path = src.startsWith("/") ? src.slice(1) : src.replace(DOT_PREFIX, "");
	return ENTRIES.has(path) ? path : null;
}

export async function viteEntry(project: string) {
	const html = await readOptional(join(project, "index.html"));
	const path = html === null ? null : htmlEntry(html);
	if (!path) {
		return null;
	}
	const source = await readOptional(join(project, path));
	return source === null ? null : { html, path, source };
}
