const SPACES = /\p{Zs}+/gu;
const WORD = /^[\p{L}\p{M}\p{N}_.’'-]$/u;
const SPACE = /^\p{Zs}$/u;
const BOUNDARY = /\s/u;

/** Find the nearest trigger, then scan the query without crossing punctuation. */
export function getComposerQuery(
	text: string,
	caret: number,
	triggers: readonly string[]
) {
	const candidates = triggers
		.filter((character) => character.length > 0 && character.length <= caret)
		.map((character) => ({
			character,
			start: text.lastIndexOf(character, caret - character.length),
		}))
		.sort((a, b) => b.start - a.start);
	const [match] = candidates;
	if (!match || match.start < 0) {
		return null;
	}
	if (match.start > 0 && !BOUNDARY.test(text.charAt(match.start - 1))) {
		return null;
	}
	const prefix = text.slice(match.start + match.character.length, caret);
	if (SPACE.test(Array.from(prefix)[0] ?? "")) {
		return null;
	}
	if (
		!Array.from(prefix).every(
			(letter) => WORD.test(letter) || SPACE.test(letter)
		)
	) {
		return null;
	}
	let end = caret;
	for (const letter of text.slice(caret)) {
		if (!WORD.test(letter)) {
			break;
		}
		end += letter.length;
	}
	return {
		...match,
		end,
		text: text
			.slice(match.start + match.character.length, end)
			.replace(SPACES, " ")
			.trim(),
	};
}
