// @vitest-environment happy-dom
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { ListItem } from "../../../packages/ui/src/components/list/list";
import {
	OverflowList,
	type OverflowListProps,
} from "../../../packages/ui/src/components/overflow-list/overflow-list";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type ClosedContract = [
	RejectsAll<OverflowListProps, "className" | "data-slot" | "role" | "style">,
	Accepts<OverflowListProps, "aria-label" | "visibleCount" | "overflowLabel">,
];
const contractChecks: ClosedContract = [true, true];

describe("OverflowList contract", () => {
	it("renders visible list items and an accessible overflow trigger", () => {
		const markup = renderToStaticMarkup(
			h(
				OverflowList,
				{
					"aria-label": "Projects",
					visibleCount: 2,
				},
				h(ListItem, { key: "one" }, "One"),
				h(ListItem, { key: "two" }, "Two"),
				h(ListItem, { key: "three" }, "Three")
			)
		);

		expect(markup).toContain('data-slot="overflow-list"');
		expect(markup).toContain('aria-label="Projects"');
		expect(markup).toContain("One");
		expect(markup).toContain("Two");
		expect(markup).toContain("More items (1)");
		expect(markup).not.toContain("Three");
		expect(contractChecks.every(Boolean)).toBe(true);
	});

	it("shows all children when the visible count covers the list", () => {
		const markup = renderToStaticMarkup(
			h(
				OverflowList,
				{
					"aria-label": "Projects",
					visibleCount: 3,
				},
				h(ListItem, { key: "one" }, "One"),
				h(ListItem, { key: "two" }, "Two"),
				h(ListItem, { key: "three" }, "Three")
			)
		);

		expect(markup).toContain("Three");
		expect(markup).not.toContain("More items");
	});

	it("rejects invalid visible counts", () => {
		expect(() =>
			renderToStaticMarkup(
				h(
					OverflowList,
					{
						"aria-label": "Projects",
						visibleCount: Number.NaN,
					},
					h(ListItem, null, "Item")
				)
			)
		).toThrow(RangeError);
	});

	it("requires a non-empty name", () => {
		expect(() =>
			renderToStaticMarkup(
				h(OverflowList, { "aria-label": " " }, h(ListItem, null, "Item"))
			)
		).toThrow(TypeError);
	});
});
