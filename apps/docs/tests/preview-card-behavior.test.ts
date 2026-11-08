// @vitest-environment happy-dom
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	PreviewCard,
	PreviewCardPopup,
	PreviewCardTrigger,
} from "../../../packages/ui/src/components/preview-card/preview-card";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		container,
		content: () =>
			document.body.querySelector<HTMLDivElement>(
				'[data-slot="preview-card-content"]'
			),
		positioner: () =>
			document.body.querySelector<HTMLDivElement>(
				'[data-slot="preview-card-positioner"]'
			),
		rerender: (next: typeof element) => act(() => root.render(next)),
		trigger: () =>
			container.querySelector<HTMLAnchorElement>(
				'[data-slot="preview-card-trigger"]'
			),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

describe("PreviewCard behavior", () => {
	it("renders trigger element, manages open state, and forwards refs", () => {
		const triggerRef = createRef<HTMLAnchorElement>();
		const popupRef = createRef<HTMLDivElement>();

		const { content, positioner, trigger, unmount } = mount(
			h(
				PreviewCard,
				{ defaultOpen: true },
				h(
					PreviewCardTrigger,
					{ href: "/dest", ref: triggerRef },
					"Trigger link"
				),
				h(PreviewCardPopup, { ref: popupRef }, "Supplementary details")
			)
		);

		expect(triggerRef.current).toBe(trigger());
		expect(trigger()?.tagName).toBe("A");
		expect(trigger()?.getAttribute("href")).toBe("/dest");
		expect(popupRef.current).toBe(content());
		expect(positioner()).not.toBeNull();
		expect(content()?.getAttribute("data-slot")).toBe("preview-card-content");
		unmount();
	});

	it("supports controlled open state and calls onOpenChange on Escape dismissal", () => {
		const onOpenChange = vi.fn();
		const { content, trigger, unmount } = mount(
			h(
				PreviewCard,
				{ onOpenChange, open: true },
				h(PreviewCardTrigger, { href: "/docs" }, "Docs link"),
				h(PreviewCardPopup, null, "Preview body")
			)
		);

		expect(content()).not.toBeNull();

		act(() => {
			trigger()?.focus();
			const event = new KeyboardEvent("keydown", {
				bubbles: true,
				cancelable: true,
				key: "Escape",
			});
			document.dispatchEvent(event);
		});

		expect(onOpenChange).toHaveBeenCalledWith(
			false,
			expect.objectContaining({ reason: "escape-key" })
		);
		unmount();
	});

	it("triggers open on trigger focus with zero delay", () => {
		const onOpenChange = vi.fn();
		const { trigger, unmount } = mount(
			h(
				PreviewCard,
				{ onOpenChange },
				h(
					PreviewCardTrigger,
					{ closeDelay: 0, delay: 0, href: "/item" },
					"Focusable target"
				),
				h(PreviewCardPopup, null, "Item preview")
			)
		);

		act(() => {
			trigger()?.focus();
		});

		expect(onOpenChange).toHaveBeenCalledWith(
			true,
			expect.objectContaining({ reason: "trigger-focus" })
		);
		unmount();
	});
});
