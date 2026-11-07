/** How a run of output looks: Mizen keeps red, bold, and dim. */
export interface AnsiSpan {
	bold: boolean;
	muted: boolean;
	red: boolean;
	text: string;
}

interface AnsiState {
	bold: boolean;
	muted: boolean;
	red: boolean;
}

const PLAIN: AnsiState = { bold: false, muted: false, red: false };

// Escape sequences: CSI codes such as colors and cursor moves, and OSC
// codes such as window titles and links. Built from character codes, so
// the source holds no raw control characters.
const ESC = String.fromCharCode(27);
const BEL = String.fromCharCode(7);
const CSI = `${ESC}\\[([0-9;?]*)([A-Za-z])`;
const OSC = `${ESC}\\][^${BEL}${ESC}]*(?:${BEL}|${ESC}\\\\)`;
const ESCAPE = new RegExp(`${CSI}|${OSC}`, "g");

// Each SGR code sets one part of the style. Hues other than red, and the
// background colors, keep the text plain: Mizen has text-safe tokens only
// for red and muted ink.
const CODES: Record<number, Partial<AnsiState>> = {
	0: PLAIN,
	1: { bold: true },
	2: { muted: true },
	22: { bold: false, muted: false },
	30: { muted: true, red: false },
	31: { muted: false, red: true },
	39: { muted: false, red: false },
	90: { muted: true, red: false },
	91: { muted: false, red: true },
};

function applyCodes(state: AnsiState, params: string) {
	const codes = params === "" ? [0] : params.split(";").map(Number);
	const next = { ...state };
	for (const code of codes) {
		Object.assign(next, CODES[code]);
	}
	return next;
}

/**
 * A line that redraws itself with carriage returns, such as a progress
 * bar, keeps only what it shows last.
 */
function settleRedraws(output: string) {
	return output
		.split("\n")
		.map((line) => line.split("\r").findLast((part) => part !== "") ?? "")
		.join("\n");
}

/** Output with its styles, ready to render as spans. */
export function parseAnsi(output: string): AnsiSpan[] {
	const text = settleRedraws(output);
	const spans: AnsiSpan[] = [];
	let state = PLAIN;
	let from = 0;
	for (const match of text.matchAll(ESCAPE)) {
		if (match.index > from) {
			spans.push({ ...state, text: text.slice(from, match.index) });
		}
		// Only "m" sequences style text; cursor moves and titles drop out.
		if (match[2] === "m") {
			state = applyCodes(state, match[1] ?? "");
		}
		from = match.index + match[0].length;
	}
	if (from < text.length) {
		spans.push({ ...state, text: text.slice(from) });
	}
	return spans;
}

/** Output as plain text, for copying. */
export function plainOutput(output: string) {
	return settleRedraws(output).replace(ESCAPE, "");
}
