import type {
	ComponentPropsWithRef,
	ReactElement,
	ReactNode,
	RefObject,
} from "react";
import { createRef, createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Card,
	CardAction,
	type CardActionProps,
	CardContent,
	type CardContentProps,
	CardDescription,
	type CardDescriptionProps,
	CardFooter,
	type CardFooterProps,
	CardHeader,
	type CardHeaderProps,
	CardPanel,
	type CardPanelProps,
	type CardProps,
	CardTitle,
	type CardTitleProps,
} from "../../../packages/ui/src/components/card/card";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	createTheme: (_vars: unknown, overrides: unknown) => overrides,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const CARD_SLOT_REGEX = /^<div[^>]*data-slot="card"/u;
const ANCHOR_HREF_REGEX = /^<a[^>]*href="\/dest"/u;

type Exact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;

type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

type RejectsAll<Props, Keys extends PropertyKey> = [
	Extract<keyof Props, Keys>,
] extends [never]
	? true
	: false;

type ClosedProps<Props> = Exact<
	Exclude<keyof ComponentPropsWithRef<"div">, keyof Props>,
	"className" | "style"
>;

type StandardClosed<Props> = [
	ClosedProps<Props>,
	RejectsAll<Props, "className" | "data-slot" | "style">,
	Accepts<Props, "ref">,
	Accepts<Props, "render">,
	Accepts<Props, "children">,
];

type RootNoExtraProps = RejectsAll<
	CardProps,
	"clickable" | "mode" | "selected" | "size" | "variant"
>;

const contractChecks = [
	true satisfies Exact<CardContentProps, CardPanelProps>,
	true satisfies Exact<
		StandardClosed<CardProps>,
		[true, true, true, true, true]
	>,
	true satisfies Exact<RootNoExtraProps, true>,
	true satisfies Exact<
		StandardClosed<CardHeaderProps>,
		[true, true, true, true, true]
	>,
	true satisfies Exact<
		StandardClosed<CardTitleProps>,
		[true, true, true, true, true]
	>,
	true satisfies Exact<
		StandardClosed<CardDescriptionProps>,
		[true, true, true, true, true]
	>,
	true satisfies Exact<
		StandardClosed<CardActionProps>,
		[true, true, true, true, true]
	>,
	true satisfies Exact<
		StandardClosed<CardPanelProps>,
		[true, true, true, true, true]
	>,
	true satisfies Exact<
		StandardClosed<CardFooterProps>,
		[true, true, true, true, true]
	>,
] as const;

type MaliciousComp = (props: {
	children?: ReactNode;
	"data-slot"?: string;
	render?: ReactElement | ((p: Record<string, unknown>) => ReactElement);
}) => ReactElement;

describe("Card component contract and SSR semantics", () => {
	it("enforces closed prop contracts and alias identity", () => {
		expect(contractChecks.every((check) => check === true)).toBe(true);
		expect(CardContent).toBe(CardPanel);
	});

	it("renders generic div host by default without invented role or tabindex", () => {
		const markup = renderToStaticMarkup(
			h(
				Card,
				null,
				h(
					CardHeader,
					null,
					h(CardTitle, null, "Card Title"),
					h(CardDescription, null, "Card Description"),
					h(CardAction, null, h("button", { type: "button" }, "Action"))
				),
				h(CardPanel, null, "Main panel content"),
				h(CardFooter, null, "Footer content")
			)
		);

		expect(markup).toMatch(CARD_SLOT_REGEX);
		expect(markup).not.toContain('role="');
		expect(markup).not.toContain('tabindex="');
		expect(markup).not.toContain('tabIndex="');

		const expectedSlots = [
			"card",
			"card-header",
			"card-title",
			"card-description",
			"card-action",
			"card-panel",
			"card-footer",
		];
		for (const slot of expectedSlots) {
			expect(markup).toContain(`data-slot="${slot}"`);
		}
	});

	it("renders CardContent with card-panel slot matching CardPanel", () => {
		const markup = renderToStaticMarkup(
			h(CardContent, null, "Aliased content")
		);
		expect(markup).toContain('data-slot="card-panel"');
		expect(markup).toContain("Aliased content");
	});

	it("protects data-slot against direct prop overrides across all components", () => {
		const components = [
			[Card, "card"],
			[CardHeader, "card-header"],
			[CardTitle, "card-title"],
			[CardDescription, "card-description"],
			[CardAction, "card-action"],
			[CardPanel, "card-panel"],
			[CardFooter, "card-footer"],
		] as const;

		for (const [Comp, slot] of components) {
			const m = renderToStaticMarkup(
				h(Comp as MaliciousComp, { "data-slot": `malicious-${slot}` }, "Text")
			);
			expect(m).toContain(`data-slot="${slot}"`);
			expect(m).not.toContain(`malicious-${slot}`);
		}
	});

	it("protects data-slot against render element and render callback overrides", () => {
		const fromElement = renderToStaticMarkup(
			h(Card as MaliciousComp, {
				render: h("section", { "data-slot": "override-slot" }),
			})
		);
		expect(fromElement).toContain('data-slot="card"');
		expect(fromElement).not.toContain("override-slot");

		const fromCallback = renderToStaticMarkup(
			h(Card as MaliciousComp, {
				render: (props) =>
					h("section", { ...props, "data-slot": "bad-fn-slot" }),
			})
		);
		expect(fromCallback).toContain('data-slot="card"');
		expect(fromCallback).not.toContain("bad-fn-slot");
	});

	it("renders polymorphic anchor with href and native attributes cleanly", () => {
		const markup = renderToStaticMarkup(
			h(
				Card,
				{ render: h("a", { href: "/dest", target: "_blank" }) },
				h(CardPanel, null, "Clickable card")
			)
		);
		expect(markup).toMatch(ANCHOR_HREF_REGEX);
		expect(markup).toContain('target="_blank"');
		expect(markup).toContain('data-slot="card"');
		expect(markup).not.toContain('role="');
	});

	it("accepts forwarded refs across all components without throwing", () => {
		const refs: Record<string, RefObject<HTMLDivElement | null>> = {
			action: createRef<HTMLDivElement>(),
			card: createRef<HTMLDivElement>(),
			desc: createRef<HTMLDivElement>(),
			footer: createRef<HTMLDivElement>(),
			header: createRef<HTMLDivElement>(),
			panel: createRef<HTMLDivElement>(),
			title: createRef<HTMLDivElement>(),
		};

		const markup = renderToStaticMarkup(
			h(
				Card,
				{ ref: refs.card },
				h(
					CardHeader,
					{ ref: refs.header },
					h(CardTitle, { ref: refs.title }, "Title"),
					h(CardDescription, { ref: refs.desc }, "Desc"),
					h(CardAction, { ref: refs.action }, "Action")
				),
				h(CardPanel, { ref: refs.panel }, "Panel"),
				h(CardFooter, { ref: refs.footer }, "Footer")
			)
		);
		expect(markup).toContain('data-slot="card"');
		expect(markup).toContain("Panel");
	});
});
