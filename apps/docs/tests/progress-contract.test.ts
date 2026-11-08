import type {
	ProgressIndicatorProps,
	ProgressLabelProps,
	ProgressProps,
	ProgressTrackProps,
	ProgressValueProps,
} from "@mizen-labs/ui/progress";
import type { HTMLAttributes, RefObject } from "react";
import { createElement, createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Progress,
	ProgressIndicator,
	ProgressLabel,
	ProgressTrack,
	ProgressValue,
} from "../../../packages/ui/src/components/progress/progress";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: (frames: unknown) => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

const contractChecks = [
	false satisfies Accepts<ProgressProps, "className">,
	false satisfies Accepts<ProgressProps, "style">,
	false satisfies Accepts<ProgressProps, "data-slot">,
	true satisfies Accepts<ProgressProps, "children">,
	true satisfies Accepts<ProgressProps, "value">,
	true satisfies Accepts<ProgressProps, "min">,
	true satisfies Accepts<ProgressProps, "max">,
	true satisfies Accepts<ProgressProps, "render">,
	true satisfies Accepts<ProgressProps, "ref">,

	false satisfies Accepts<ProgressTrackProps, "className">,
	false satisfies Accepts<ProgressTrackProps, "style">,
	false satisfies Accepts<ProgressTrackProps, "data-slot">,
	true satisfies Accepts<ProgressTrackProps, "render">,
	true satisfies Accepts<ProgressTrackProps, "ref">,

	false satisfies Accepts<ProgressIndicatorProps, "className">,
	false satisfies Accepts<ProgressIndicatorProps, "style">,
	false satisfies Accepts<ProgressIndicatorProps, "data-slot">,
	true satisfies Accepts<ProgressIndicatorProps, "render">,
	true satisfies Accepts<ProgressIndicatorProps, "ref">,

	false satisfies Accepts<ProgressLabelProps, "className">,
	false satisfies Accepts<ProgressLabelProps, "style">,
	false satisfies Accepts<ProgressLabelProps, "data-slot">,
	true satisfies Accepts<ProgressLabelProps, "render">,
	true satisfies Accepts<ProgressLabelProps, "ref">,

	false satisfies Accepts<ProgressValueProps, "className">,
	false satisfies Accepts<ProgressValueProps, "style">,
	false satisfies Accepts<ProgressValueProps, "data-slot">,
	true satisfies Accepts<ProgressValueProps, "render">,
	true satisfies Accepts<ProgressValueProps, "ref">,
] as const;

const expectedContractChecks = [
	false,
	false,
	false,
	true,
	true,
	true,
	true,
	true,
	true,

	false,
	false,
	false,
	true,
	true,

	false,
	false,
	false,
	true,
	true,

	false,
	false,
	false,
	true,
	true,

	false,
	false,
	false,
	true,
	true,
] as const;

const INDICATOR_INLINE_STYLE_REGEX =
	/data-slot="progress-indicator"[^>]*style=/u;

describe("Progress component contract and SSR semantics", () => {
	it("resolves root and subpath exports with an exact closed prop contract", () => {
		expect(import.meta.resolve("@mizen-labs/ui")).toContain(
			"packages/ui/dist/index.js"
		);
		expect(import.meta.resolve("@mizen-labs/ui/progress")).toContain(
			"packages/ui/dist/components/progress/progress.js"
		);
		expect(contractChecks).toEqual(expectedContractChecks);
	});

	it("auto-renders track and indicator when children are absent or null", () => {
		const markupAbsent = renderToStaticMarkup(
			createElement(Progress, { value: 60 })
		);
		expect(markupAbsent).toContain('data-slot="progress"');
		expect(markupAbsent).toContain('data-slot="progress-track"');
		expect(markupAbsent).toContain('data-slot="progress-indicator"');
		expect(markupAbsent).toContain('role="progressbar"');
		expect(markupAbsent).toContain('aria-valuenow="60"');
		expect(markupAbsent).toContain('aria-valuemin="0"');
		expect(markupAbsent).toContain('aria-valuemax="100"');
		expect(markupAbsent).toContain('aria-valuetext="60%"');
		expect(markupAbsent).toContain("width:60%");

		const markupNull = renderToStaticMarkup(
			createElement(Progress, { value: 60 }, null)
		);
		expect(markupNull).toContain('data-slot="progress"');
		expect(markupNull).toContain('data-slot="progress-track"');
		expect(markupNull).toContain('data-slot="progress-indicator"');
	});

	it("uses supplied children unchanged when present", () => {
		const markup = renderToStaticMarkup(
			createElement(
				Progress,
				{ value: 40 },
				createElement(ProgressLabel, null, "Loading files"),
				createElement(ProgressTrack, null, createElement(ProgressIndicator)),
				createElement(ProgressValue)
			)
		);
		expect(markup).toContain('data-slot="progress"');
		expect(markup).toContain('data-slot="progress-label"');
		expect(markup).toContain('data-slot="progress-track"');
		expect(markup).toContain('data-slot="progress-indicator"');
		expect(markup).toContain('data-slot="progress-value"');
		expect(markup).toContain("Loading files");
		expect(markup).toContain("40%");
	});

	it("protects all component slots even when props or render provide custom ones", () => {
		const ref: RefObject<HTMLDivElement | null> = createRef<HTMLDivElement>();
		const rootProps = {
			"data-slot": "custom-progress",
			ref,
			render: createElement("section", { "data-slot": "bad-root-slot" }),
			value: 75,
		};
		const labelProps = {
			"data-slot": "custom-label",
			render: createElement("h4", { "data-slot": "bad-label-slot" }),
		};
		const trackProps = {
			"data-slot": "custom-track",
			render: (props: HTMLAttributes<HTMLElement>) =>
				createElement("div", { ...props, "data-slot": "bad-track-slot" }),
		};
		const indicatorProps = {
			"data-slot": "custom-indicator",
			render: createElement("span", {
				"data-slot": "bad-indicator-slot",
			}),
		};
		const valueProps = {
			"data-slot": "custom-value",
			render: (props: HTMLAttributes<HTMLElement>) =>
				createElement("span", { ...props, "data-slot": "bad-value-slot" }),
		};

		const markup = renderToStaticMarkup(
			createElement(
				Progress,
				rootProps,
				createElement(ProgressLabel, labelProps, "Syncing"),
				createElement(
					ProgressTrack,
					trackProps,
					createElement(ProgressIndicator, indicatorProps)
				),
				createElement(ProgressValue, valueProps)
			)
		);

		expect(markup).toContain('data-slot="progress"');
		expect(markup).toContain('data-slot="progress-label"');
		expect(markup).toContain('data-slot="progress-track"');
		expect(markup).toContain('data-slot="progress-indicator"');
		expect(markup).toContain('data-slot="progress-value"');

		expect(markup).not.toContain("bad-root-slot");
		expect(markup).not.toContain("bad-label-slot");
		expect(markup).not.toContain("bad-track-slot");
		expect(markup).not.toContain("bad-indicator-slot");
		expect(markup).not.toContain("bad-value-slot");
		expect(markup).not.toContain("custom-progress");
	});

	it("preserves Base UI min, max, and clamping", () => {
		const markup = renderToStaticMarkup(
			createElement(
				Progress,
				{ max: 200, min: 50, value: 300 },
				createElement(ProgressLabel, null, "Clamped task"),
				createElement(ProgressTrack, null, createElement(ProgressIndicator)),
				createElement(ProgressValue)
			)
		);
		expect(markup).toContain('aria-valuemin="50"');
		expect(markup).toContain('aria-valuemax="200"');
		expect(markup).toContain('aria-valuenow="200"');
		expect(markup).toContain('data-complete=""');
	});

	it("sets indeterminate states and omits inline width when value is null", () => {
		const markup = renderToStaticMarkup(
			createElement(Progress, { value: null })
		);
		expect(markup).toContain('data-indeterminate=""');
		expect(markup).toContain('aria-valuetext="indeterminate progress"');
		expect(markup).not.toMatch(INDICATOR_INLINE_STYLE_REGEX);
	});
});
