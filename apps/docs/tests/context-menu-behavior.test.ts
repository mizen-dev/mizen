// @vitest-environment happy-dom
import { act, createElement, createRef } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuLinkItem,
	ContextMenuPopup,
	ContextMenuPrimitive,
	ContextMenuSub,
	ContextMenuSubPopup,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "../../../packages/ui/src/components/context-menu/context-menu";

const h = createElement;
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
		item: () =>
			document.body.querySelector<HTMLDivElement>(
				'[data-slot="context-menu-item"]'
			),
		linkItem: () =>
			document.body.querySelector<HTMLAnchorElement>(
				'[data-slot="context-menu-link-item"]'
			),
		popup: () =>
			document.body.querySelector<HTMLDivElement>(
				'[data-slot="context-menu-popup"]'
			),
		subContent: () =>
			document.body.querySelector<HTMLDivElement>(
				'[data-slot="context-menu-sub-content"]'
			),
		subTrigger: () =>
			document.body.querySelector<HTMLDivElement>(
				'[data-slot="context-menu-sub-trigger"]'
			),
		trigger: () =>
			container.querySelector<HTMLDivElement>(
				'[data-slot="context-menu-trigger"]'
			),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

describe("ContextMenu behavior", () => {
	it.each(["ContextMenu", "F10"])(
		"opens from %s through the native context-menu handler",
		(key) => {
			const view = mount(
				h(
					ContextMenu,
					null,
					h(ContextMenuTrigger, { tabIndex: 0 }, "Workspace"),
					h(ContextMenuPopup, null, h(ContextMenuItem, null, "Open"))
				)
			);
			act(() =>
				view.trigger()?.dispatchEvent(
					new KeyboardEvent("keydown", {
						bubbles: true,
						cancelable: true,
						key,
						shiftKey: key === "F10",
					})
				)
			);
			expect(view.popup()).not.toBeNull();
			view.unmount();
		}
	);
	it("respects consumer cancellation of keyboard opening", () => {
		const view = mount(
			h(
				ContextMenu,
				null,
				h(
					ContextMenuTrigger,
					{ onKeyDown: preventKeyboardOpening },
					"Workspace"
				),
				h(ContextMenuPopup, null, h(ContextMenuItem, null, "Open"))
			)
		);
		act(() =>
			view.trigger()?.dispatchEvent(
				new KeyboardEvent("keydown", {
					bubbles: true,
					cancelable: true,
					key: "ContextMenu",
				})
			)
		);
		expect(view.popup()).toBeNull();
		view.unmount();
	});

	it("renders trigger, manages open state, and forwards refs to core wrappers", () => {
		const [triggerRef, popupRef, itemRef, linkRef] = [
			createRef<HTMLDivElement>(),
			createRef<HTMLDivElement>(),
			createRef<HTMLDivElement>(),
			createRef<HTMLAnchorElement>(),
		];

		const { item, linkItem, popup, trigger, unmount } = mount(
			h(
				ContextMenu,
				{ defaultOpen: true },
				h(ContextMenuTrigger, { ref: triggerRef }, "Trigger area"),
				h(
					ContextMenuPopup,
					{ ref: popupRef },
					h(ContextMenuItem, { ref: itemRef }, "Action"),
					h(ContextMenuLinkItem, { href: "/dest", ref: linkRef }, "Destination")
				)
			)
		);

		expect(triggerRef.current).toBe(trigger());
		expect(popupRef.current).toBe(popup());
		expect(itemRef.current).toBe(item());
		expect(linkRef.current).toBe(linkItem());
		expect(trigger()?.tagName).toBe("DIV");
		expect(trigger()?.getAttribute("data-slot")).toBe("context-menu-trigger");
		expect(popup()?.getAttribute("data-slot")).toBe("context-menu-popup");
		expect(linkItem()?.getAttribute("href")).toBe("/dest");
		unmount();
	});

	it("renders submenu hierarchy with chevron icon and forwards submenu refs", () => {
		const subTriggerRef = createRef<HTMLDivElement>();
		const { subContent, subTrigger, unmount } = mount(
			h(
				ContextMenu,
				{ defaultOpen: true },
				h(ContextMenuTrigger, null, "Surface"),
				h(
					ContextMenuPopup,
					null,
					h(
						ContextMenuSub,
						{ defaultOpen: true },
						h(ContextMenuSubTrigger, { ref: subTriggerRef }, "Sub trigger"),
						h(ContextMenuSubPopup, null, h(ContextMenuItem, null, "Sub item"))
					)
				)
			)
		);

		expect(subTriggerRef.current).toBe(subTrigger());
		expect(subTrigger()?.getAttribute("data-slot")).toBe(
			"context-menu-sub-trigger"
		);
		expect(subTrigger()?.querySelector("svg")).not.toBeNull();
		expect(subContent()?.getAttribute("data-slot")).toBe(
			"context-menu-sub-content"
		);
		unmount();
	});

	it("supports controlled open state and Escape key dismissal", () => {
		const onOpenChange = vi.fn();
		const { popup, trigger, unmount } = mount(
			h(
				ContextMenu,
				{ onOpenChange, open: true },
				h(ContextMenuTrigger, null, "Dismiss target"),
				h(ContextMenuPopup, null, "Context content")
			)
		);

		expect(popup()).not.toBeNull();
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

	it("forwards implicit and explicit alignOffset to ContextMenuPrimitive.Positioner", () => {
		const descriptor = Object.getOwnPropertyDescriptor(
			ContextMenuPrimitive.Positioner,
			"render"
		);
		if (!descriptor || typeof descriptor.value !== "function") {
			throw new Error("Missing render function");
		}
		const originalRender = descriptor.value;
		const capturedCalls: Array<{ alignOffset?: unknown; side?: unknown }> = [];
		const probeRender = (...args: unknown[]) => {
			const [props] = args;
			if (typeof props === "object" && props !== null) {
				const alignOffset =
					"alignOffset" in props ? props.alignOffset : undefined;
				const side = "side" in props ? props.side : undefined;
				capturedCalls.push({ alignOffset, side });
			}
			return Reflect.apply(
				originalRender,
				ContextMenuPrimitive.Positioner,
				args
			);
		};
		Object.defineProperty(ContextMenuPrimitive.Positioner, "render", {
			...descriptor,
			value: probeRender,
		});

		try {
			const renderSubPopup = (
				subPopupProps?: Parameters<typeof ContextMenuSubPopup>[0]
			) => {
				capturedCalls.length = 0;
				const { unmount } = mount(
					h(
						ContextMenu,
						{ defaultOpen: true },
						h(ContextMenuTrigger, null, "Surface"),
						h(
							ContextMenuPopup,
							null,
							h(
								ContextMenuSub,
								{ defaultOpen: true },
								h(ContextMenuSubTrigger, null, "Sub trigger"),
								h(
									ContextMenuSubPopup,
									subPopupProps,
									h(ContextMenuItem, null, "Sub item")
								)
							)
						)
					)
				);
				const subPositioner = capturedCalls.find(
					(call) => call.side === "inline-end"
				);
				unmount();
				return subPositioner?.alignOffset;
			};

			expect(renderSubPopup()).toBe(-5);
			expect(renderSubPopup({ align: "center" })).toBeUndefined();
			expect(renderSubPopup({ align: "center", alignOffset: 12 })).toBe(12);
			expect(renderSubPopup({ align: "start", alignOffset: 0 })).toBe(0);
		} finally {
			Object.defineProperty(
				ContextMenuPrimitive.Positioner,
				"render",
				descriptor
			);
		}
	});
});

function preventKeyboardOpening(event: { preventDefault: () => void }) {
	event.preventDefault();
}
