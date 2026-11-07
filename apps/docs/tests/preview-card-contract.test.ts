// @vitest-environment happy-dom
import type { HTMLAttributes } from "react";
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	PreviewCard,
	PreviewCardPopup,
	type PreviewCardPopupProps,
	PreviewCardPrimitive,
	type PreviewCardProps,
	PreviewCardTrigger,
	type PreviewCardTriggerProps,
} from "../../../packages/ui/src/components/preview-card/preview-card";
import { previewCardStyles } from "../../../packages/ui/src/components/preview-card/preview-card.styles";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
const propsSpy = vi.fn((_style?: object) => ({}));
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: (style?: object) => propsSpy(style),
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
	RejectsAll<PreviewCardProps, Omitted>,
	Accepts<PreviewCardProps, "open" | "defaultOpen" | "onOpenChange">,
	RejectsAll<PreviewCardTriggerProps, Omitted>,
	Accepts<PreviewCardTriggerProps, "href" | "render" | "ref">,
	Accepts<PreviewCardPopupProps, "render">,
	Accepts<
		PreviewCardPopupProps,
		"align" | "sideOffset" | "anchor" | "portalProps" | "ref"
	>,
	Accepts<PreviewCardProps, "open">,
	Accepts<PreviewCardTriggerProps, "href">,
	Accepts<PreviewCardPopupProps, "align">,
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
];

describe("PreviewCard contract and runtime semantics", () => {
	it("exports runtime members and matches identity aliases", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/preview-card/preview-card"
		);
		expect(Object.keys(mod).sort()).toEqual([
			"PreviewCard",
			"PreviewCardPopup",
			"PreviewCardPrimitive",
			"PreviewCardTrigger",
		]);

		expect(mod).not.toHaveProperty("HoverCard");

		expect(mod.PreviewCard).toBe(mod.PreviewCardPrimitive.Root);
		expect(PreviewCard).toBe(PreviewCardPrimitive.Root);

		for (const part of ["Root", "Trigger", "Portal", "Positioner", "Popup"]) {
			expect(mod.PreviewCardPrimitive).toHaveProperty(part);
		}
		expect(contractChecks.every((c) => c === true)).toBe(true);
	});

	it("renders native anchor trigger with canonical slot and without button type", () => {
		const markup = renderToStaticMarkup(
			h(
				PreviewCard,
				null,
				h(
					PreviewCardTrigger,
					{ href: "https://example.com/project" },
					"Project link"
				)
			)
		);

		expect(markup).toContain('data-slot="preview-card-trigger"');
		expect(markup).toContain('href="https://example.com/project"');
		expect(markup).toContain("<a");
		expect(markup).not.toContain('type="button"');
	});

	it("protects data-slot and anchor semantics when forwarding custom render", () => {
		const markup = renderToStaticMarkup(
			h(
				PreviewCard,
				null,
				h(PreviewCardTrigger, {
					href: "/profile",
					render: (props: HTMLAttributes<HTMLAnchorElement>) =>
						h("a", { ...props, "aria-label": "User profile" }),
				})
			)
		);

		expect(markup).toContain('data-slot="preview-card-trigger"');
		expect(markup).toContain('href="/profile"');
		expect(markup).toContain('aria-label="User profile"');
		expect(markup).not.toContain('type="button"');
	});

	it("renders popup composition with canonical slots and default positioner styles", () => {
		propsSpy.mockClear();
		const { unmount } = mount(
			h(
				PreviewCard,
				{ defaultOpen: true },
				h(PreviewCardTrigger, { href: "/preview" }, "Preview target"),
				h(PreviewCardPopup, null, h("span", null, "Preview detail"))
			)
		);

		const positioner = document.body.querySelector(
			'[data-slot="preview-card-positioner"]'
		);
		const content = document.body.querySelector(
			'[data-slot="preview-card-content"]'
		);

		expect(positioner).not.toBeNull();
		expect(content).not.toBeNull();
		expect(propsSpy).toHaveBeenCalledWith(previewCardStyles.positioner);
		expect(propsSpy).toHaveBeenCalledWith(previewCardStyles.popup);
		unmount();
	});
});
