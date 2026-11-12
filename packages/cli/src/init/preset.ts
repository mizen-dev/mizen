import { join } from "node:path";
import { readOptional } from "../doctor/files.js";
import { imports, literal, parseSource } from "../doctor/syntax.js";
import {
	changes,
	conflict,
	type FileEdit,
	fileEdit,
	position,
} from "./edit.js";

export const THEME_FILE = "mizen-theme.css";
const CRLF = /\r\n/gu;

// A side-effect import of the app's theme file, right after Mizen's
// stylesheet, so the app's own CSS still comes later.
export function themeImport(source: string): string {
	const found = imports(parseSource(source));
	if (found.some((node) => literal(node.source) === `./${THEME_FILE}`)) {
		return source;
	}
	const styles = found.find(
		(node) => literal(node.source) === "@mizen-labs/ui/styles.css"
	);
	const at = position(styles, "end");
	const newline = source.includes("\r\n") ? "\r\n" : "\n";
	return changes(source, [
		{ end: at, start: at, text: `${newline}import "./${THEME_FILE}";` },
	]);
}

// The theme file belongs to the app: init writes it once and never
// replaces a file that differs from the preset.
export async function themeFile(
	project: string,
	path: string,
	preset: string
): Promise<FileEdit | null> {
	const before = await readOptional(join(project, path));
	if (before === null) {
		return fileEdit(path, null, preset);
	}
	if (before.replace(CRLF, "\n") !== preset) {
		return conflict(
			`${path} already exists and differs from the preset. The file is yours: edit it directly, or delete it to start from the preset.`
		);
	}
	return null;
}
