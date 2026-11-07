// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	currentQuery,
	equalValue,
	getComposerText,
	readSelection,
	readValue,
	restoreSelection,
	writeValue,
} from "../../../packages/ui/src/components/composer/composer-document";
import type { UseComposerEditorOptions } from "../../../packages/ui/src/components/composer/composer-options";
import { ComposerSession } from "../../../packages/ui/src/components/composer/composer-session";
import type { ComposerValue } from "../../../packages/ui/src/components/composer/composer-value";

const draft = (text: string): ComposerValue =>
	text ? [{ text, type: "text" }] : [];
const token: ComposerValue = [
	{ text: "A😀", type: "text" },
	{
		data: "1",
		id: "m",
		label: "Maya",
		text: "@m",
		trigger: "@",
		type: "mention",
	},
	{ text: "Z", type: "text" },
];
const cleanups: (() => void)[] = [];
function editor(value = draft("Initial"), accept = true) {
	const form = document.createElement("form");
	const input = document.createElement("div");
	input.contentEditable = "true";
	input.tabIndex = 0;
	form.append(input);
	document.body.append(form);
	const changed = vi.fn((next: ComposerValue) => {
		if (accept) {
			session.commit({ ...options, value: next }, value);
		}
	});
	const options: UseComposerEditorOptions = { onValueChange: changed, value };
	const session = new ComposerSession(options);
	session.rootRef.current = form;
	const releaseRoot = session.bindRoot(form);
	const releaseInput = session.bind(input);
	const cleanup = () => {
		session.rootRef.current = null;
		releaseRoot();
		releaseInput?.();
	};
	cleanups.push(cleanup);
	session.commit(options, value);
	input.focus();
	return { changed, cleanup, form, input, options, session };
}
afterEach(() => {
	for (const cleanup of cleanups.splice(0)) {
		cleanup();
	}
	document.body.replaceChildren();
	vi.restoreAllMocks();
});

describe("Composer element session", () => {
	it("publishes edits synchronously and restores a rejected parent value", () => {
		const { input, session, changed } = editor(draft("Initial"), false);
		input.textContent = "Rejected";
		session.inputChanged();
		expect(changed).toHaveBeenCalledExactlyOnceWith(draft("Rejected"), {
			reason: "input",
		});
		expect(readValue(input)).toEqual(draft("Initial"));
	});
	it("keeps composition private until completion", () => {
		const { input, session, changed } = editor();
		session.startComposition();
		input.textContent = "你好😀";
		session.inputChanged();
		expect(changed).not.toHaveBeenCalled();
		session.endComposition();
		session.inputChanged();
		expect(changed).toHaveBeenCalledExactlyOnceWith(draft("你好😀"), {
			reason: "input",
		});
		expect(readValue(input)).toEqual(draft("你好😀"));
	});
	it("defers external replacement until composition ends", () => {
		const { input, session, options, changed } = editor();
		session.startComposition();
		input.textContent = "未完成";
		session.commit({ ...options, value: draft("External") }, []);
		expect(input.textContent).toBe("未完成");
		session.endComposition();
		expect(input.textContent).toBe("External");
		expect(changed).not.toHaveBeenCalled();
	});
	it("replaces owner values without publishing an edit", () => {
		const { input, session, options, changed } = editor();
		session.commit({ ...options, value: token }, []);
		expect(equalValue(readValue(input), token)).toBe(true);
		expect(changed).not.toHaveBeenCalled();
	});
	it("maps backward selection through token metadata and Unicode", () => {
		const { input } = editor(token);
		restoreSelection(input, { anchor: 6, focus: 1 });
		expect(readSelection(input)).toEqual({ anchor: 6, focus: 1 });
		writeValue(input, token);
		restoreSelection(input, { anchor: 3, focus: 5 });
		expect(readSelection(input)).toEqual({ anchor: 3, focus: 5 });
	});
	it("reads native multiline blocks and restores their selection", () => {
		const { input } = editor();
		input.innerHTML = "one<div>two</div><div><br></div>";
		expect(getComposerText(readValue(input))).toBe("one\ntwo\n");
		restoreSelection(input, { anchor: 5, focus: 5 });
		expect(readSelection(input)).toEqual({ anchor: 5, focus: 5 });
	});
	it("ignores reset after unbinding, including a pending microtask", async () => {
		const { form, changed, cleanup } = editor();
		form.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
		cleanup();
		await Promise.resolve();
		expect(changed).not.toHaveBeenCalled();
		form.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
		await Promise.resolve();
		expect(changed).not.toHaveBeenCalled();
	});
	it("honors cancellation and runs a mounted form reset once", async () => {
		const { form, changed } = editor();
		const canceled = new Event("reset", { bubbles: true, cancelable: true });
		canceled.preventDefault();
		form.dispatchEvent(canceled);
		await Promise.resolve();
		expect(changed).not.toHaveBeenCalled();
		form.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
		await Promise.resolve();
		expect(changed).toHaveBeenCalledExactlyOnceWith(draft("Initial"), {
			reason: "reset",
		});
	});
});

it("reads queries split across native text nodes without rewriting them", () => {
	const { input } = editor([]);
	const first = document.createTextNode("Hello @M");
	const second = document.createTextNode("aya more");
	input.replaceChildren(first, second);
	document.getSelection()?.collapse(second, 1);
	const query = currentQuery(input, [{ character: "@", items: [] }]);
	expect(query?.text).toBe("Maya");
	expect(query?.range.toString()).toBe("@Maya");
	expect(input.childNodes).toHaveLength(2);
	expect(document.getSelection()?.anchorNode).toBe(second);
});
it("groups consecutive input but splits edits after caret movement", () => {
	const { input, session } = editor([]);
	const type = (text: string, before: number, after: number) => {
		restoreSelection(input, { anchor: before, focus: before });
		input.dispatchEvent(
			new InputEvent("beforeinput", { bubbles: true, inputType: "insertText" })
		);
		input.textContent = text;
		restoreSelection(input, { anchor: after, focus: after });
		session.inputChanged();
	};
	type("a", 0, 1);
	type("ab", 1, 2);
	type("abc", 2, 3);
	input.dispatchEvent(
		new InputEvent("beforeinput", {
			bubbles: true,
			cancelable: true,
			inputType: "historyUndo",
		})
	);
	expect(readValue(input)).toEqual([]);
	input.dispatchEvent(
		new InputEvent("beforeinput", {
			bubbles: true,
			cancelable: true,
			inputType: "historyRedo",
		})
	);
	expect(readValue(input)).toEqual(draft("abc"));
	type("aXbc", 1, 2);
	input.dispatchEvent(
		new InputEvent("beforeinput", {
			bubbles: true,
			cancelable: true,
			inputType: "historyUndo",
		})
	);
	expect(readValue(input)).toEqual(draft("abc"));
});

it("ends abandoned composition when another input replaces the composing element", () => {
	const { input, session, changed } = editor();
	session.startComposition();
	input.textContent = "未完成";
	const replacement = document.createElement("div");
	input.replaceWith(replacement);
	const release = session.bind(replacement);
	if (release) {
		cleanups.push(release);
	}
	expect(session.getSnapshot().composing).toBe(false);
	expect(readValue(replacement)).toEqual(draft("Initial"));
	replacement.textContent = "Next";
	session.inputChanged();
	expect(changed).toHaveBeenCalledExactlyOnceWith(draft("Next"), {
		reason: "input",
	});
});
