// Shared terminal output: semantic styles, the status gutter, aligned rows,
// and counts. Commands format through these so every screen reads alike.

const LABEL_WIDTH = 16;
const GUTTER = "  ";

type Paint = (text: string) => string;

export interface Style {
	bold: Paint;
	/** A complete command offered on its own line. */
	command: Paint;
	fail: Paint;
	heading: Paint;
	pass: Paint;
	warn: Paint;
}

const plain: Paint = (text) => text;

function sgr(open: number, close: number): Paint {
	return (text) => `\u001b[${open}m${text}\u001b[${close}m`;
}

// --no-color and NO_COLOR win, then FORCE_COLOR, then the stream itself:
// color only on a terminal whose TERM is not dumb.
function colorOn(stream: NodeJS.WriteStream): boolean {
	if (process.env.NO_COLOR) {
		return false;
	}
	const forced = process.env.FORCE_COLOR;
	if (forced !== undefined) {
		return forced !== "0";
	}
	return Boolean(stream.isTTY) && process.env.TERM !== "dumb";
}

/** No styling, for JSON and pipes. */
export const unstyled: Style = {
	bold: plain,
	command: plain,
	fail: plain,
	heading: plain,
	pass: plain,
	warn: plain,
};

/** Styles for one stream; each stream decides for itself. */
export function styleFor(stream: NodeJS.WriteStream): Style {
	if (!colorOn(stream)) {
		return unstyled;
	}
	const bold = sgr(1, 22);
	const magenta = sgr(35, 39);
	return {
		bold,
		command: sgr(36, 39),
		fail: sgr(31, 39),
		heading: (text) => bold(magenta(text)),
		pass: sgr(32, 39),
		warn: sgr(33, 39),
	};
}

export const glyphs = { fail: "✗", pass: "✓", warn: "!" } as const;

/** A status line: the glyph in column 0, the text from column 2. */
export function status(
	style: Style,
	kind: keyof typeof glyphs,
	text: string
): string {
	return `${style[kind](glyphs[kind])} ${text}`;
}

/**
 * A label and value in the shared columns: label from column 2, value from
 * column 18. A long label puts its value on the next line; each further
 * line of the value aligns under the first.
 */
export function row(label: string, value: string | readonly string[]): string {
	const lines = typeof value === "string" ? value.split("\n") : [...value];
	const pad = " ".repeat(GUTTER.length + LABEL_WIDTH);
	const head =
		label.length < LABEL_WIDTH
			? `${GUTTER}${label.padEnd(LABEL_WIDTH)}${lines[0] ?? ""}`
			: `${GUTTER}${label}\n${pad}${lines[0] ?? ""}`;
	return [head, ...lines.slice(1).map((line) => `${pad}${line}`)].join("\n");
}

/** A next step: what it gets you, then the command on its own line. */
export function nextStep(style: Style, benefit: string, command: string) {
	return `${GUTTER}${benefit}:\n${GUTTER}${GUTTER}${style.command(command)}`;
}

export function plural(count: number, one: string, many = `${one}s`) {
	return `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`;
}

/** Indents every line of a block by the gutter. */
export function indent(text: string, depth = 1): string {
	const prefix = GUTTER.repeat(depth);
	return text
		.split("\n")
		.map((line) => (line ? `${prefix}${line}` : line))
		.join("\n");
}
