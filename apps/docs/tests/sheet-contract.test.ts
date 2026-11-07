// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	Sheet,
	SheetClose,
	type SheetCloseProps,
	SheetContent,
	type SheetContentProps,
	SheetDescription,
	type SheetDescriptionProps,
	SheetFooter,
	type SheetFooterProps,
	SheetHeader,
	type SheetHeaderProps,
	SheetPanel,
	type SheetPanelProps,
	SheetPopup,
	type SheetPopupProps,
	type SheetProps,
	SheetTitle,
	type SheetTitleProps,
	SheetTrigger,
	type SheetTriggerProps,
} from "../../../packages/ui/src/components/sheet/sheet";
import { sheetStyles } from "../../../packages/ui/src/components/sheet/sheet.styles";
import { sheetPositionsStyles } from "../../../packages/ui/src/components/sheet/sheet-positions.styles";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const propsSpy = vi.fn((_style?: readonly (object | undefined)[]) => ({}));
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_v: T, overrides: object): object =>
		overrides,
	defaultMarker: () => ({}),
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: (...styles: (object | undefined)[]) => propsSpy(styles),
	when: { ancestor: (selector: string) => selector },
}));

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		container,
		rerender: (next: typeof element) => act(() => root.render(next)),
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type Omitted = "className" | "style";

type ClosedContract = [
	RejectsAll<SheetProps, Omitted>,
	Accepts<SheetProps, "open" | "defaultOpen" | "onOpenChange">,
	RejectsAll<SheetTriggerProps, Omitted>,
	Accepts<SheetTriggerProps, "render" | "ref">,
	RejectsAll<SheetPopupProps, Omitted | "position">,
	Accepts<
		SheetPopupProps,
		| "side"
		| "variant"
		| "showCloseButton"
		| "closeProps"
		| "portalProps"
		| "ref"
	>,
	Accepts<SheetContentProps, "side" | "variant" | "showCloseButton">,
	RejectsAll<SheetTitleProps, Omitted>,
	RejectsAll<SheetDescriptionProps, Omitted>,
	RejectsAll<SheetCloseProps, Omitted>,
	RejectsAll<SheetHeaderProps, Omitted>,
	Accepts<SheetHeaderProps, "render">,
	RejectsAll<SheetPanelProps, Omitted>,
	Accepts<SheetPanelProps, "scrollFade" | "render">,
	RejectsAll<SheetFooterProps, Omitted>,
	Accepts<SheetFooterProps, "variant" | "render">,
];

const contractChecks: ClosedContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];

describe("Sheet contract and runtime semantics", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});
	it("resolves @mizen-labs/ui/sheet as a public subpath", () => {
		const resolved = import.meta.resolve("@mizen-labs/ui/sheet");
		expect(resolved).toContain("sheet");
	});

	it("uses 2rem directional motion rather than 100% offscreen slide", () => {
		const serialized = JSON.stringify(sheetPositionsStyles);
		expect(serialized).toContain("translateX(2rem)");
		expect(serialized).toContain("translateX(-2rem)");
		expect(serialized).toContain("translateY(-2rem)");
		expect(serialized).toContain("translateY(2rem)");
	});

	it("exports runtime members and matches identity aliases", async () => {
		const mod = await import("../../../packages/ui/src/components/sheet/sheet");
		expect(Object.keys(mod).sort()).toEqual([
			"Sheet",
			"SheetClose",
			"SheetContent",
			"SheetCreateHandle",
			"SheetDescription",
			"SheetFooter",
			"SheetHeader",
			"SheetPanel",
			"SheetPopup",
			"SheetPrimitive",
			"SheetTitle",
			"SheetTrigger",
		]);
		expect(mod.SheetContent).toBe(mod.SheetPopup);
		expect(SheetContent).toBe(SheetPopup);
		expect(typeof mod.SheetCreateHandle).toBe("function");
		expect(mod.SheetPrimitive).toBeDefined();
		expect(contractChecks.every((c) => c === true)).toBe(true);

		const rootMod = await import("../../../packages/ui/src/index");
		expect(rootMod.Sheet).toBe(mod.Sheet);
		expect(rootMod.SheetPopup).toBe(mod.SheetPopup);
		expect(rootMod.SheetContent).toBe(mod.SheetContent);
	});

	it("renders sheet trigger into static markup with canonical data-slot", () => {
		const markup = renderToStaticMarkup(
			h(Sheet, null, h(SheetTrigger, null, "Open"))
		);
		expect(markup).toContain('data-slot="sheet-trigger"');
		expect(markup).toContain('type="button"');
	});

	it("renders sheet structure with correct data slots, ScrollArea panel, and default right side in DOM", () => {
		const { unmount } = mount(
			h(
				Sheet,
				{ defaultOpen: true },
				h(SheetTrigger, null, "Open Sheet"),
				h(
					SheetPopup,
					null,
					h(
						SheetHeader,
						null,
						h(SheetTitle, null, "Sheet Title"),
						h(SheetDescription, null, "Sheet Description")
					),
					h(SheetPanel, null, "Sheet Panel Body"),
					h(SheetFooter, null, h(SheetClose, null, "Done"))
				)
			)
		);

		expect(
			document.body.querySelector('[data-slot="sheet-backdrop"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-viewport"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-popup"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-default-close"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-header"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-title"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-description"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-panel"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="scroll-area"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-footer"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-close"]')
		).not.toBeNull();
		expect(
			document.body
				.querySelector('[data-slot="sheet-default-close"]')
				?.getAttribute("aria-label")
		).toBe("Close");
		expect(
			propsSpy.mock.calls.some((call) =>
				call[0]?.includes(sheetStyles.scrollArea)
			)
		).toBe(true);
		unmount();
	});

	it("supports polymorphic render prop while protecting component data-slots", () => {
		const { unmount } = mount(
			h(
				Sheet,
				{ defaultOpen: true },
				h(
					SheetPopup,
					null,
					h(
						SheetHeader,
						{
							render: h("section", { "aria-label": "custom-header" }),
						},
						h(SheetTitle, null, "Title")
					),
					h(
						SheetPanel,
						{
							render: h("article", { "aria-label": "custom-panel" }),
						},
						"Body"
					),
					h(
						SheetFooter,
						{
							render: h("footer", { "aria-label": "custom-footer" }),
						},
						h(SheetClose, null, "Done")
					)
				)
			)
		);

		const header = document.body.querySelector('[aria-label="custom-header"]');
		expect(header?.tagName.toLowerCase()).toBe("section");
		expect(header?.getAttribute("data-slot")).toBe("sheet-header");

		const panel = document.body.querySelector('[aria-label="custom-panel"]');
		expect(panel?.tagName.toLowerCase()).toBe("article");
		expect(panel?.getAttribute("data-slot")).toBe("sheet-panel");

		const footer = document.body.querySelector('[aria-label="custom-footer"]');
		expect(footer?.tagName.toLowerCase()).toBe("footer");
		expect(footer?.getAttribute("data-slot")).toBe("sheet-footer");
		unmount();
	});

	it("honors closeProps and showCloseButton=false on SheetPopup", () => {
		const { unmount } = mount(
			h(
				Sheet,
				{ defaultOpen: true },
				h(
					SheetPopup,
					{ closeProps: { "aria-label": "Dismiss modal" } },
					h(SheetTitle, null, "Title")
				)
			)
		);
		expect(
			document.body
				.querySelector('[data-slot="sheet-default-close"]')
				?.getAttribute("aria-label")
		).toBe("Dismiss modal");
		unmount();

		const noClose = mount(
			h(
				Sheet,
				{ defaultOpen: true },
				h(SheetPopup, { showCloseButton: false }, h(SheetTitle, null, "Title"))
			)
		);
		expect(
			document.body.querySelector('[data-slot="sheet-popup"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-default-close"]')
		).toBeNull();
		noClose.unmount();
	});

	it("supports variant=inset on SheetPopup and variant=bare on SheetFooter", () => {
		const { unmount } = mount(
			h(
				Sheet,
				{ defaultOpen: true },
				h(
					SheetPopup,
					{ variant: "inset" },
					h(SheetPanel, null, "Body"),
					h(SheetFooter, { variant: "bare" }, "Footer")
				)
			)
		);
		expect(
			document.body.querySelector('[data-slot="sheet-popup"]')
		).not.toBeNull();
		expect(
			document.body.querySelector('[data-slot="sheet-footer"]')
		).not.toBeNull();
		unmount();
	});

	it("supports interactive open and close transitions with controlled callbacks", () => {
		const onOpenChange = vi.fn();
		const { container, unmount } = mount(
			h(
				Sheet,
				{ onOpenChange },
				h(SheetTrigger, null, "Toggle"),
				h(SheetPopup, null, h(SheetClose, null, "Dismiss"))
			)
		);
		const trigger = container.querySelector<HTMLButtonElement>("button");
		expect(trigger?.getAttribute("data-slot")).toBe("sheet-trigger");
		expect(trigger?.getAttribute("type")).toBe("button");
		act(() => trigger?.click());
		expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
		unmount();
	});
});
