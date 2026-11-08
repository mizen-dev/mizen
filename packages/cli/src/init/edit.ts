import { lstat } from "node:fs/promises";
import { join } from "node:path";
import { createTwoFilesPatch } from "diff";
import { readOptional } from "../doctor/files.js";
import { isNode, parseSource, type SyntaxNode } from "../doctor/syntax.js";
import { CliError, type Failure } from "../errors.js";

export interface Change {
	end: number;
	start: number;
	text: string;
}
export interface FileEdit {
	after: string;
	before: string | null;
	diff: string;
	path: string;
}

/** Stops init before any change. The headline names what init can't do. */
export function conflict(message: string, detail?: Failure): never {
	throw new CliError("conflict", `Can't set up Mizen. ${message}`, 1, detail);
}

export function position(value: unknown, key: "start" | "end"): number {
	if (!isNode(value) || typeof value[key] !== "number") {
		return conflict("The parser did not provide a safe edit range.");
	}
	return value[key];
}

const TAB_INDENT = /^\t/mu;

// Wraps the element at start..end in <name>. An element that starts its
// line is wrapped as a block, one indent deeper; one inline stays inline.
export function wrapElement(
	source: string,
	start: number,
	end: number,
	name: string
): Change {
	const element = source.slice(start, end);
	const lineStart = source.lastIndexOf("\n", start - 1) + 1;
	const indent = source.slice(lineStart, start);
	if (indent.trim()) {
		return { end, start, text: `<${name}>${element}</${name}>` };
	}
	const unit = TAB_INDENT.test(source) ? "\t" : "  ";
	const newline = source.includes("\r\n") ? "\r\n" : "\n";
	const inner = element.split(newline).join(`${newline}${unit}`);
	return {
		end,
		start,
		text: `<${name}>${newline}${indent}${unit}${inner}${newline}${indent}</${name}>`,
	};
}

export function changes(source: string, edits: Change[]): string {
	let cursor = source.length;
	let result = source;
	for (const edit of edits.toSorted(
		(a, b) => b.start - a.start || b.end - a.end
	)) {
		if (edit.end > cursor) {
			return conflict("Overlapping source edits require manual setup.");
		}
		result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
		cursor = edit.start;
	}
	parseSource(result);
	return result;
}

export function fileEdit(
	path: string,
	before: string | null,
	after: string
): FileEdit | null {
	if (before === after) {
		return null;
	}
	return {
		after,
		before,
		diff: createTwoFilesPatch(path, path, before ?? "", after),
		path,
	};
}

export function addProperty(
	object: SyntaxNode,
	key: string,
	value: string
): Change {
	if (!Array.isArray(object.properties)) {
		return conflict("Computed configuration needs manual setup.");
	}
	const last = object.properties.at(-1);
	if (!last) {
		return {
			end: position(object, "start") + 1,
			start: position(object, "start") + 1,
			text: `${key}: ${value}`,
		};
	}
	// Insert before the first member, leaving trailing comments and commas untouched.
	const at = position(object.properties[0], "start");
	return { end: at, start: at, text: `${key}: ${value}, ` };
}

export async function sourceFile(
	project: string,
	candidates: string[],
	create?: string
) {
	const results = await Promise.all(
		candidates.map(async (path) => ({
			path,
			source: await readOptional(join(project, path)),
		}))
	);
	const found = results.filter((item) => item.source !== null);
	if (found.length > 1) {
		return conflict(
			`Multiple candidates exist: ${found.map((candidate) => candidate.path).join(", ")}. Select one before setup.`
		);
	}
	if (!(found.length || create)) {
		return conflict(
			`No conventional root file found: ${candidates.join(", ")}.`
		);
	}
	if (!found.length) {
		return { before: null, path: candidates[0], source: create as string };
	}
	const [file] = found;
	const metadata = await lstat(join(project, file.path));
	if (!metadata.isFile() || metadata.nlink !== 1) {
		return conflict(`Use a regular, unlinked source file for ${file.path}.`);
	}
	validateSyntax(file.source as string, file.path);
	return {
		before: file.source,
		path: file.path,
		source: file.source as string,
	};
}

export async function unchanged(
	path: string,
	expected: string | null
): Promise<void> {
	const source = await readOptional(path);
	if (source !== expected) {
		conflict(
			`File changed since planning: ${path}. Rerun init to review a fresh plan.`
		);
	}
}

function validateSyntax(source: string, path: string): void {
	try {
		parseSource(source);
	} catch (error) {
		if (!(error instanceof SyntaxError)) {
			throw error;
		}
		conflict(
			`${path} has invalid or unsupported syntax. Repair it before setup.`
		);
	}
}
