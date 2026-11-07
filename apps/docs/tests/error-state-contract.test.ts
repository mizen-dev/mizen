import type {
	ErrorStateContentProps,
	ErrorStateDescriptionProps,
	ErrorStateHeaderProps,
	ErrorStateMediaProps,
	ErrorStateProps,
	ErrorStateTitleProps,
} from "@mizen/ui/error-state";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { createRef, createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	ErrorState,
	ErrorStateContent,
	ErrorStateDescription,
	ErrorStateHeader,
	ErrorStateMedia,
	ErrorStateTitle,
} from "../../../packages/ui/src/components/error-state/error-state";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const rootSlotRegex = /^<div[^>]*data-slot="error-state"/;

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

type RootCheck = [
	...StandardClosed<ErrorStateProps, "div">,
	RejectsAll<
		ErrorStateProps,
		"action" | "data-variant" | "details" | "fullPage" | "variant"
	>,
	Accepts<ErrorStateProps, "role">,
	Accepts<ErrorStateProps, "aria-live">,
];
type MediaCheck = [
	...StandardClosed<ErrorStateMediaProps, "div">,
	RejectsAll<
		ErrorStateMediaProps,
		"action" | "data-variant" | "details" | "fullPage" | "variant"
	>,
	Accepts<ErrorStateMediaProps, "aria-hidden">,
];
type TitleCheck = [
	...StandardClosed<ErrorStateTitleProps, "h3">,
	Accepts<ErrorStateTitleProps, "level">,
];

type ExpectedTitleLevel = 1 | 2 | 3 | 4 | 5 | 6;
const titleLevels: readonly ExpectedTitleLevel[] = [1, 2, 3, 4, 5, 6] as const;

const contractChecks = [
	true satisfies Exact<
		NonNullable<ErrorStateTitleProps["level"]>,
		ExpectedTitleLevel
	>,
	true satisfies Exact<RootCheck, [true, true, true, true, true, true]>,
	true satisfies Exact<
		StandardClosed<ErrorStateHeaderProps, "div">,
		[true, true, true]
	>,
	true satisfies Exact<MediaCheck, [true, true, true, true, true]>,
	true satisfies Exact<TitleCheck, [true, true, true, true]>,
	true satisfies Exact<
		StandardClosed<ErrorStateDescriptionProps, "p">,
		[true, true, true]
	>,
	true satisfies Exact<
		StandardClosed<ErrorStateContentProps, "div">,
		[true, true, true]
	>,
] as const;

type MaliciousComp = (props: {
	children?: ReactNode;
	"data-slot"?: string;
}) => ReactElement;

describe("ErrorState component contract and SSR semantics", () => {
	it("resolves root and subpath exports with exact closed prop contracts", () => {
		expect(import.meta.resolve("@mizen/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen/ui/error-state")).toContain(
			"packages/ui/dist/components/error-state/error-state.js"
		);
		expect(contractChecks.every((c) => c === true)).toBe(true);
	});

	it("renders generic root with no default role or aria-live, default aria-hidden on media, and h3 default title", () => {
		const markup = renderToStaticMarkup(
			h(
				ErrorState,
				null,
				h(
					ErrorStateHeader,
					null,
					h(ErrorStateMedia, null, h("svg")),
					h(ErrorStateTitle, null, "Failed to load"),
					h(ErrorStateDescription, null, "Unable to establish connection.")
				),
				h(ErrorStateContent, null, h("button", { type: "button" }, "Retry"))
			)
		);
		expect(markup).toMatch(rootSlotRegex);
		expect(markup).not.toContain('role="');
		expect(markup).not.toContain('aria-live="');
		expect(markup).not.toContain('data-variant="');
		expect(markup).toContain('aria-hidden="true"');
		expect(markup).toContain("<h3");
		expect(markup).toContain("<p");
		const slots =
			"error-state error-state-header error-state-media error-state-title error-state-description error-state-content".split(
				" "
			);
		for (const s of slots) {
			expect(markup).toContain(`data-slot="${s}"`);
		}
	});

	it("renders media with single icon container and allows aria-hidden/label override", () => {
		const defaultMarkup = renderToStaticMarkup(
			h(ErrorStateMedia, null, h("svg", { "data-testid": "err-icon" }))
		);
		expect(defaultMarkup).toContain('data-slot="error-state-media"');
		expect(defaultMarkup).toContain('aria-hidden="true"');
		expect(defaultMarkup).not.toContain('data-variant="');
		expect(defaultMarkup.match(/<div/g)?.length).toBe(1);

		const overrideMarkup = renderToStaticMarkup(
			h(ErrorStateMedia, {
				"aria-hidden": false,
				"aria-label": "Error indicator",
			})
		);
		expect(overrideMarkup).toContain('aria-hidden="false"');
		expect(overrideMarkup).toContain('aria-label="Error indicator"');
	});

	it("renders all six semantic heading levels cleanly without leaking level attribute", () => {
		for (const level of titleLevels) {
			const m = renderToStaticMarkup(
				h(ErrorStateTitle, { level }, `H${level}`)
			);
			expect(m).toContain(`<h${level}`);
			expect(m).toContain(`</h${level}>`);
			expect(m).toContain('data-slot="error-state-title"');
			expect(m).not.toContain(`level="${level}"`);
		}
	});

	it("protects data-slot from consumer override across all six components", () => {
		const slots = [
			[ErrorState, "error-state"],
			[ErrorStateHeader, "error-state-header"],
			[ErrorStateMedia, "error-state-media"],
			[ErrorStateTitle, "error-state-title"],
			[ErrorStateDescription, "error-state-description"],
			[ErrorStateContent, "error-state-content"],
		] as const;

		for (const [Comp, slot] of slots) {
			const m = renderToStaticMarkup(
				h(Comp as MaliciousComp, { "data-slot": `bad-${slot}` }, "Text")
			);
			expect(m).toContain(`data-slot="${slot}"`);
			expect(m).not.toContain(`bad-${slot}`);
		}
	});

	it("allows overriding native role and ARIA attributes on root", () => {
		const statusMarkup = renderToStaticMarkup(
			h(ErrorState, {
				"aria-labelledby": "err-title",
				role: "region",
			})
		);
		expect(statusMarkup).toContain('role="region"');
		expect(statusMarkup).toContain('aria-labelledby="err-title"');
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
				ErrorState,
				{ ref: eRef },
				h(
					ErrorStateHeader,
					{ ref: hRef },
					h(ErrorStateMedia, { ref: mRef }, h("svg")),
					h(ErrorStateTitle, { ref: tRef }, "Ref Title"),
					h(ErrorStateDescription, { ref: dRef }, "Ref Desc")
				),
				h(ErrorStateContent, { ref: cRef })
			)
		);
		expect(markup).toContain('data-slot="error-state"');
		expect(markup).toContain("Ref Title");
	});
});
