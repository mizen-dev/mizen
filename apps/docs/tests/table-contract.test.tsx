// @vitest-environment happy-dom
import type { ComponentProps, ReactNode } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableContainer,
	type TableContainerProps,
	TableFooter,
	TableHead,
	TableHeader,
	type TableHeadProps,
	TableRow,
} from "../../../packages/ui/src/components/table/table";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

type IsExact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;
type Rejects<Props, Key extends PropertyKey> = Key extends keyof Props
	? false
	: true;
type TableContracts = [
	IsExact<
		TableHeadProps["scope"],
		"col" | "colgroup" | "row" | "rowgroup" | undefined
	>,
	IsExact<TableContainerProps["scroll"], "both" | "horizontal" | undefined>,
	Rejects<ComponentProps<typeof Table>, "className">,
	Rejects<ComponentProps<typeof Table>, "style">,
	Rejects<ComponentProps<typeof Table>, "role">,
	Rejects<ComponentProps<typeof Table>, "data-slot">,
];
const tableContracts: TableContracts = [true, true, true, true, true, true];

describe("Table primitive contract", () => {
	it("keeps table structure native and preserves header and span semantics", () => {
		const markup = renderToStaticMarkup(
			h(
				TableContainer,
				{ "aria-label": "Quarterly results" },
				h(
					Table,
					null,
					h(TableCaption, null, "Quarterly results"),
					h(
						TableHeader,
						null,
						h(
							TableRow,
							null,
							h(TableHead, { "aria-sort": "ascending", scope: "col" }, "Name"),
							h(TableHead, { numeric: true }, "Revenue")
						)
					),
					h(
						TableBody,
						null,
						h(
							TableRow,
							{ selected: true },
							h(TableHead, { scope: "row" }, "North"),
							h(TableCell, { numeric: true, rowSpan: 2 }, "$14,200")
						)
					),
					h(
						TableFooter,
						null,
						h(TableRow, null, h(TableCell, { colSpan: 2 }, "Total"))
					)
				)
			)
		);

		expect(markup).toContain('<section aria-label="Quarterly results"');
		expect(markup).toContain('tabindex="0"');
		expect(markup).toContain('data-slot="table-container"');
		expect(markup).toContain('<table data-slot="table">');
		expect(markup).toContain('<thead data-slot="table-header">');
		expect(markup).toContain(
			'<th aria-sort="ascending" data-slot="table-head" scope="col">Name</th>'
		);
		expect(markup).toContain(
			'<th data-slot="table-head" scope="row">North</th>'
		);
		expect(markup).toContain('rowSpan="2"');
		expect(markup).toContain('colSpan="2"');
		expect(markup).toContain(
			'<caption data-slot="table-caption">Quarterly results</caption>'
		);
		expect(markup).toContain('data-selected="true"');
		expect(tableContracts.every(Boolean)).toBe(true);
	});

	it("requires a name for its keyboard-focusable scroll region", () => {
		expect(() =>
			renderToStaticMarkup(
				h(
					TableContainer as (props: Record<string, unknown>) => ReactNode,
					null,
					"Table"
				)
			)
		).toThrow("TableContainer requires an accessible name");
		expect(() =>
			renderToStaticMarkup(
				h(
					TableContainer as (props: Record<string, unknown>) => ReactNode,
					{ "aria-label": " " },
					"Table"
				)
			)
		).toThrow(TypeError);

		const markup = renderToStaticMarkup(
			h(
				TableContainer,
				{ "aria-labelledby": "results-heading", scroll: "both" },
				"Table"
			)
		);
		expect(markup).toContain('aria-labelledby="results-heading"');
		expect(markup).toContain("<section");
		expect(markup).toContain('tabindex="0"');
	});

	it("strips consumer overrides while retaining the canonical slot", () => {
		const untypedTable = Table as (props: Record<string, unknown>) => ReactNode;
		const markup = renderToStaticMarkup(
			h(
				untypedTable,
				{
					className: "injected-class",
					"data-slot": "injected",
					role: "presentation",
					style: { color: "red" },
				},
				"Data"
			)
		);
		expect(markup).toBe('<table data-slot="table">Data</table>');
	});

	it("forwards refs to the native table and container", () => {
		const container = document.createElement("div");
		const root = createRoot(container);
		const tableRef = createRef<HTMLTableElement>();
		const containerRef = createRef<HTMLElement>();

		act(() =>
			root.render(
				h(
					TableContainer,
					{ "aria-label": "Results", ref: containerRef },
					h(Table, { ref: tableRef })
				)
			)
		);
		expect(containerRef.current?.tagName).toBe("SECTION");
		expect(tableRef.current?.tagName).toBe("TABLE");
		act(() => root.unmount());
	});
});
