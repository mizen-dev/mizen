// @vitest-environment happy-dom
import { act, createElement, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vite-plus/test";
import type { ComposerValue } from "../../../packages/ui/src/components/composer/composer-document";
import { useComposerEditor } from "../../../packages/ui/src/components/composer/use-composer-editor";

const EMPTY: ComposerValue = [];
const cleanups: (() => Promise<void>)[] = [];
function Harness({
	reject = false,
	change,
}: {
	reject?: boolean;
	change: (value: ComposerValue) => void;
}) {
	const [value, setValue] = useState(EMPTY);
	const editor = useComposerEditor({
		onValueChange(next) {
			change(next);
			if (!reject) {
				setValue(next);
			}
		},
		value,
	});
	return createElement(
		"form",
		{
			ref: editor.syncRootRef,
		},
		createElement("div", editor.inputProps),
		createElement("output", null, JSON.stringify(value))
	);
}
async function mount(reject = false) {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);
	const change = vi.fn();
	await act(() =>
		root.render(
			createElement(
				StrictMode,
				null,
				createElement(Harness, { change, reject })
			)
		)
	);
	cleanups.push(async () => {
		await act(() => root.unmount());
		container.remove();
	});
	const input = container.querySelector("[role=textbox]") as HTMLDivElement;
	return { change, container, input };
}
afterEach(async () => {
	await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
});
it.each([false, true])(
	"reconciles React commits when reject=%s",
	async (reject) => {
		const { input, change } = await mount(reject);
		await act(() => {
			input.textContent = "Hello";
			input.dispatchEvent(new InputEvent("input", { bubbles: true }));
		});
		expect(input.textContent).toBe(reject ? "" : "Hello");
		expect(change).toHaveBeenCalledExactlyOnceWith([
			{ text: "Hello", type: "text" },
		]);
	}
);
it("keeps accepted IME text through React commit and suppresses the final duplicate input", async () => {
	const { input, change } = await mount();
	await act(() => {
		input.dispatchEvent(
			new CompositionEvent("compositionstart", { bubbles: true })
		);
	});
	await act(() => {
		input.textContent = "你好";
		input.dispatchEvent(
			new InputEvent("input", { bubbles: true, isComposing: true })
		);
	});
	expect(change).not.toHaveBeenCalled();
	await act(() => {
		input.dispatchEvent(
			new CompositionEvent("compositionend", { bubbles: true, data: "你好" })
		);
		input.dispatchEvent(new InputEvent("input", { bubbles: true }));
	});
	expect(input.textContent).toBe("你好");
	expect(change).toHaveBeenCalledExactlyOnceWith([
		{ text: "你好", type: "text" },
	]);
});
