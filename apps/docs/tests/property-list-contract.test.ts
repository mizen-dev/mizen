// @vitest-environment happy-dom

import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	PropertyList,
	PropertyListItem,
	type PropertyListItemProps,
	PropertyListLabel,
	type PropertyListLabelProps,
	type PropertyListProps,
	PropertyListValue,
	type PropertyListValueProps,
} from "../../../packages/ui/src/components/property-list/property-list";
import { propertyListStyles } from "../../../packages/ui/src/components/property-list/property-list.styles";
import { colors } from "../../../packages/ui/src/styles/colors.stylex";
import { space } from "../../../packages/ui/src/styles/spacing.stylex";
import {
	fontSize,
	fontWeight,
	lineHeight,
} from "../../../packages/ui/src/styles/typography.stylex";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const propertyListSlotRegex = /^<dl[^>]*data-slot="property-list"/u;
const propertyListHierarchyRegex =
	/<dl[^>]*><div[^>]*><dt[^>]*>Plan<\/dt><dd[^>]*>Enterprise<\/dd><\/div><\/dl>/u;

const propsSpy = vi.fn((..._args: unknown[]) => ({}));

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: (...args: unknown[]) => propsSpy(...args),
	when: { ancestor: () => ":where(*)" },
}));

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type Closed<P, E extends "dl" | "div" | "dt" | "dd"> = Exact<
	Exclude<keyof ComponentPropsWithRef<E>, keyof P>,
	"className" | "style"
>;
type Invented =
	| "columns"
	| "dense"
	| "density"
	| "direction"
	| "layout"
	| "orientation"
	| "render"
	| "separator"
	| "striped"
	| "truncate"
	| "variant";
type Checked<P, E extends "dl" | "div" | "dt" | "dd"> = [
	Closed<P, E>,
	Rejects<P, "className" | "data-slot" | "style" | Invented>,
	Accepts<P, "ref">,
	Accepts<P, "children">,
];

type Valid = [true, true, true, true];

const contractChecks = [
	true satisfies Exact<Checked<PropertyListProps, "dl">, Valid>,
	true satisfies Exact<Checked<PropertyListItemProps, "div">, Valid>,
	true satisfies Exact<Checked<PropertyListLabelProps, "dt">, Valid>,
	true satisfies Exact<Checked<PropertyListValueProps, "dd">, Valid>,
] as const;

type MaliciousComp = (props: {
	children?: ReactNode;
	"data-slot"?: string;
}) => ReactElement;

describe("PropertyList contract and semantics", () => {
	beforeEach(() => {
		propsSpy.mockClear();
	});

	it("resolves package export and enforces closed prop contracts", () => {
		expect(import.meta.resolve("@mizen-labs/ui/property-list")).toContain(
			"packages/ui/dist/components/property-list/property-list.js"
		);
		expect(contractChecks.every((check) => check === true)).toBe(true);
	});

	it("renders exact native tags, hierarchy, slots, and attributes without implicit roles", () => {
		const markup = renderToStaticMarkup(
			h(
				PropertyList,
				{ "aria-label": "Billing details", id: "billing-list" },
				h(
					PropertyListItem,
					{ id: "row-1" },
					h(PropertyListLabel, { id: "label-1" }, "Plan"),
					h(PropertyListValue, { "aria-labelledby": "label-1" }, "Enterprise")
				)
			)
		);
		expect(markup).toMatch(propertyListSlotRegex);
		expect(markup).toMatch(propertyListHierarchyRegex);
		expect(markup).not.toContain('role="');
		expect(markup).not.toContain("tabindex");
		expect(markup).toContain('data-slot="property-list"');
		expect(markup).toContain('data-slot="property-list-item"');
		expect(markup).toContain('data-slot="property-list-label"');
		expect(markup).toContain('data-slot="property-list-value"');
		expect(markup).toContain('aria-label="Billing details"');
		expect(markup).toContain('aria-labelledby="label-1"');
		expect(markup).toContain('id="billing-list"');
		expect(markup).toContain('id="row-1"');
		expect(markup).toContain('id="label-1"');
	});

	it("protects data-slot against direct prop overrides across all components", () => {
		const components = [
			[PropertyList, "property-list"],
			[PropertyListItem, "property-list-item"],
			[PropertyListLabel, "property-list-label"],
			[PropertyListValue, "property-list-value"],
		] as const;

		for (const [Comp, slot] of components) {
			const m = renderToStaticMarkup(
				h(Comp as MaliciousComp, { "data-slot": `malicious-${slot}` }, "Text")
			);
			expect(m).toContain(`data-slot="${slot}"`);
			expect(m).not.toContain(`malicious-${slot}`);
		}
	});

	it("forwards refs attached to all four host elements", async () => {
		const root = createRoot(document.createElement("div"));
		const [list, item, label, value] = [
			createRef<HTMLDListElement>(),
			createRef<HTMLDivElement>(),
			createRef<HTMLElement>(),
			createRef<HTMLElement>(),
		];

		await act(() =>
			root.render(
				h(
					PropertyList,
					{ ref: list },
					h(
						PropertyListItem,
						{ ref: item },
						h(PropertyListLabel, { ref: label }, "Account"),
						h(PropertyListValue, { ref: value }, "acct_123")
					)
				)
			)
		);

		const tagSlot = (el: HTMLElement | null) =>
			`${el?.tagName}:${el?.dataset.slot}`;
		expect(tagSlot(list.current)).toBe("DL:property-list");
		expect(tagSlot(item.current)).toBe("DIV:property-list-item");
		expect(tagSlot(label.current)).toBe("DT:property-list-label");
		expect(tagSlot(value.current)).toBe("DD:property-list-value");
		await act(() => root.unmount());
	});

	it("renders rich value children without breakage", () => {
		const markup = renderToStaticMarkup(
			h(
				PropertyListItem,
				null,
				h(PropertyListLabel, null, "Status"),
				h(
					PropertyListValue,
					null,
					h("span", { "data-status": "active" }, "Active"),
					h("a", { href: "/billing" }, "Manage")
				)
			)
		);
		expect(markup).toContain('data-status="active"');
		expect(markup).toContain('href="/billing"');
		expect(markup).toContain("Manage");
	});

	it("validates style-token contract for root, item, label, and value", () => {
		expect(propertyListStyles).toMatchObject({
			item: {
				alignItems: "baseline",
				display: "grid",
				gap: space["3"],
				gridColumnEnd: "-1",
				gridColumnStart: "1",
				gridTemplateColumns: "subgrid",
				minWidth: 0,
			},
			label: {
				color: colors.mutedContent,
				fontSize: fontSize["14"],
				fontWeight: fontWeight.regular,
				lineHeight: lineHeight["20"],
				margin: 0,
				minWidth: 0,
				overflowWrap: "break-word",
			},
			root: {
				display: "grid",
				gap: space["2"],
				gridTemplateColumns: {
					"@media (min-width: 40rem)": "fit-content(8rem) minmax(0, 1fr)",
					default: "minmax(0, 1fr)",
				},
				margin: 0,
			},
			value: {
				color: colors.content,
				fontSize: fontSize["14"],
				fontWeight: fontWeight.regular,
				lineHeight: lineHeight["20"],
				margin: 0,
				minWidth: 0,
				overflowWrap: "anywhere",
				textAlign: "start",
			},
		});

		renderToStaticMarkup(
			h(
				PropertyList,
				null,
				h(
					PropertyListItem,
					null,
					h(PropertyListLabel, null, "Label"),
					h(PropertyListValue, null, "Value")
				)
			)
		);

		for (const s of Object.values(propertyListStyles)) {
			expect(propsSpy).toHaveBeenCalledWith(s);
		}
	});
});
