import type {
	EmptyContentProps,
	EmptyDescriptionProps,
	EmptyHeaderProps,
	EmptyMediaProps,
	EmptyMediaVariant,
	EmptyProps,
	EmptyTitleProps,
} from "@mizen-labs/ui/empty";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { createRef, createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../../../packages/ui/src/components/empty/empty";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const emptySlotRegex = /^<div[^>]*data-slot="empty"/u;

type Exact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;

type ClosedProps<Props, Element extends "div" | "p" | "h3"> = Exact<
	Exclude<keyof ComponentPropsWithRef<Element>, keyof Props>,
	"className" | "style"
>;

type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

type RejectsAll<Props, Keys extends PropertyKey> = [
	Extract<keyof Props, Keys>,
] extends [never]
	? true
	: false;

type StandardClosed<Props, Element extends "div" | "p" | "h3"> = [
	ClosedProps<Props, Element>,
	RejectsAll<Props, "className" | "style" | "data-slot">,
	Accepts<Props, "ref">,
];

type EmptyCheck = [
	...StandardClosed<EmptyProps, "div">,
	Accepts<EmptyProps, "role">,
	Accepts<EmptyProps, "aria-live">,
];
type MediaCheck = [
	...StandardClosed<EmptyMediaProps, "div">,
	RejectsAll<EmptyMediaProps, "data-variant">,
	Accepts<EmptyMediaProps, "variant">,
	Accepts<EmptyMediaProps, "aria-hidden">,
];
type TitleCheck = [
	...StandardClosed<EmptyTitleProps, "h3">,
	Accepts<EmptyTitleProps, "level">,
];

type ExpectedMediaVariant = "default" | "icon";
type ExpectedTitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

const mediaVariants: readonly EmptyMediaVariant[] = [
	"default",
	"icon",
] as const;
const titleLevels: readonly ExpectedTitleLevel[] = [1, 2, 3, 4, 5, 6] as const;

const contractChecks = [
	true satisfies Exact<EmptyMediaVariant, ExpectedMediaVariant>,
	true satisfies Exact<
		NonNullable<EmptyTitleProps["level"]>,
		ExpectedTitleLevel
	>,
	true satisfies Exact<EmptyCheck, [true, true, true, true, true]>,
	true satisfies Exact<
		StandardClosed<EmptyHeaderProps, "div">,
		[true, true, true]
	>,
	true satisfies Exact<MediaCheck, [true, true, true, true, true, true]>,
	true satisfies Exact<TitleCheck, [true, true, true, true]>,
	true satisfies Exact<
		StandardClosed<EmptyDescriptionProps, "p">,
		[true, true, true]
	>,
	true satisfies Exact<
		StandardClosed<EmptyContentProps, "div">,
		[true, true, true]
	>,
] as const;

type MaliciousComp = (props: {
	children?: ReactNode;
	"data-slot"?: string;
	"data-variant"?: string;
}) => ReactElement;

describe("Empty component contract and SSR semantics", () => {
	it("resolves root and subpath exports with exact closed prop contracts", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/empty")).toContain(
			"packages/ui/dist/components/empty/empty.js"
		);
		expect(contractChecks.every((c) => c === true)).toBe(true);
	});

	it("renders generic root with no default role or aria-live, default variant='default', and h3 default title", () => {
		const markup = renderToStaticMarkup(
			h(
				Empty,
				null,
				h(
					EmptyHeader,
					null,
					h(EmptyMedia, null, h("svg")),
					h(EmptyTitle, null, "No projects yet"),
					h(EmptyDescription, null, "First project.")
				),
				h(EmptyContent, null, h("button", { type: "button" }, "New"))
			)
		);
		expect(markup).toMatch(emptySlotRegex);
		expect(markup).not.toContain('role="');
		expect(markup).not.toContain('aria-live="');
		expect(markup).toContain('data-variant="default"');
		expect(markup).toContain('aria-hidden="true"');
		expect(markup).toContain("<h3");
		expect(markup).toContain("<p");
		const slots =
			"empty empty-header empty-media empty-title empty-description empty-content".split(
				" "
			);
		for (const s of slots) {
			expect(markup).toContain(`data-slot="${s}"`);
		}
	});

	it("renders media variants cleanly and icon back cards", () => {
		for (const variant of mediaVariants) {
			const m = renderToStaticMarkup(
				h(EmptyMedia, { variant }, h("svg", { "data-testid": "icon" }))
			);
			expect(m).toContain('data-slot="empty-media"');
			expect(m).toContain(`data-variant="${variant}"`);
			if (variant === "icon") {
				expect(m).toContain('data-testid="icon"');
				const matches = m.match(/aria-hidden="true"/gu);
				expect(matches?.length).toBeGreaterThanOrEqual(3);
			}
		}
	});

	it("renders all six semantic heading levels cleanly without leaking level attribute", () => {
		for (const level of titleLevels) {
			const m = renderToStaticMarkup(h(EmptyTitle, { level }, `H${level}`));
			expect(m).toContain(`<h${level}`);
			expect(m).toContain(`</h${level}>`);
			expect(m).toContain('data-slot="empty-title"');
			expect(m).not.toContain(`level="${level}"`);
		}
	});

	it("protects data-slot and data-variant from consumer override across all six components", () => {
		for (const [Comp, slot] of [
			[Empty, "empty"],
			[EmptyHeader, "empty-header"],
			[EmptyTitle, "empty-title"],
			[EmptyDescription, "empty-description"],
			[EmptyContent, "empty-content"],
		] as const) {
			const m = renderToStaticMarkup(
				h(Comp as MaliciousComp, { "data-slot": `bad-${slot}` }, "Text")
			);
			expect(m).toContain(`data-slot="${slot}"`);
			expect(m).not.toContain(`bad-${slot}`);
		}

		const media = renderToStaticMarkup(
			h(EmptyMedia as MaliciousComp, {
				"data-slot": "bad-media",
				"data-variant": "bad-variant",
			})
		);
		expect(media).toContain('data-slot="empty-media"');
		expect(media).toContain('data-variant="default"');
		expect(media).not.toContain("bad-media");
		expect(media).not.toContain("bad-variant");
	});

	it("allows overriding native role and ARIA attributes on root and media", () => {
		const status = renderToStaticMarkup(
			h(Empty, { "aria-live": "polite", role: "status" })
		);
		expect(status).toContain('role="status"');
		expect(status).toContain('aria-live="polite"');

		const media = renderToStaticMarkup(
			h(EmptyMedia, { "aria-hidden": false, "aria-label": "Graphic" })
		);
		expect(media).toContain('aria-hidden="false"');
		expect(media).toContain('aria-label="Graphic"');
	});

	it("forwards refs on all six components", () => {
		const [eRef, hRef, mRef, tRef, dRef, cRef] = [
			createRef<HTMLDivElement>(),
			createRef<HTMLDivElement>(),
			createRef<HTMLDivElement>(),
			createRef<HTMLHeadingElement>(),
			createRef<HTMLParagraphElement>(),
			createRef<HTMLDivElement>(),
		];
		const markup = renderToStaticMarkup(
			h(
				Empty,
				{ ref: eRef },
				h(
					EmptyHeader,
					{ ref: hRef },
					h(EmptyMedia, { ref: mRef }, h("svg")),
					h(EmptyTitle, { ref: tRef }, "Ref Title"),
					h(EmptyDescription, { ref: dRef }, "Ref Desc")
				),
				h(EmptyContent, { ref: cRef })
			)
		);
		expect(markup).toContain('data-slot="empty"');
		expect(markup).toContain("Ref Title");
	});
});
