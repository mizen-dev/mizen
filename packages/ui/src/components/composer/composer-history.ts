import {
	type ComposerSelection,
	type ComposerSnapshot,
	equalValue,
} from "./composer-document";
import type { ComposerValue } from "./composer-value";

type Entry = ComposerSnapshot & { input: string; time: number };
const GROUPABLE = new Set([
	"insertText",
	"deleteContentBackward",
	"deleteContentForward",
]);
function adjacent(
	a: ComposerSelection | null,
	b: ComposerSelection | null
): boolean {
	return a?.anchor === b?.anchor && a?.focus === b?.focus;
}
/** A cursor over accepted transactions. New edits truncate the redo branch. */
export class ComposerHistory {
	private entries: Entry[] = [];
	private cursor = 0;

	reset(value: ComposerValue): void {
		this.entries = [{ input: "", selection: null, time: 0, value }];
		this.cursor = 0;
	}
	matches(value: ComposerValue): boolean {
		return equalValue(this.entries[this.cursor]?.value ?? [], value);
	}
	record(
		value: ComposerValue,
		before: ComposerSelection | null,
		after: ComposerSelection | null,
		input: string
	): void {
		const previous = this.entries[this.cursor];
		if (!previous || equalValue(previous.value, value)) {
			return;
		}
		const time = Date.now();
		const group =
			GROUPABLE.has(input) &&
			previous.input === input &&
			time - previous.time < 1000 &&
			adjacent(previous.selection, before);
		this.entries.length = this.cursor + 1;
		if (group) {
			this.entries[this.cursor] = { input, selection: after, time, value };
		} else {
			previous.selection = before;
			this.entries.push({ input, selection: after, time, value });
			this.cursor += 1;
		}
		if (this.entries.length > 101) {
			this.entries.shift();
			this.cursor -= 1;
		}
	}
	move(
		direction: number,
		selection: ComposerSelection | null
	): ComposerSnapshot | undefined {
		const next = this.entries[this.cursor + direction];
		if (!next) {
			return;
		}
		this.entries[this.cursor].selection = selection;
		this.cursor += direction;
		next.input = "";
		return next;
	}
}
