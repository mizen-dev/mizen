// @vitest-environment happy-dom

import {
	type ColumnDef,
	columnSizingFeature,
	columnVisibilityFeature,
	createPaginatedRowModel,
	createSortedRowModel,
	rowPaginationFeature,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import type { ComponentProps } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	DataTable,
	type DataTableColumnMeta,
	DataTablePagination,
} from "../../../packages/ui/src/components/data-table/data-table";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "test-animation",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

interface BudgetRow {
	account: string;
	budget: number;
}
const features = tableFeatures({
	columnSizingFeature,
	columnVisibilityFeature,
	paginatedRowModel: createPaginatedRowModel(),
	rowPaginationFeature,
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
});
const columns: ColumnDef<typeof features, BudgetRow>[] = [
	{
		accessorKey: "account",
		header: "Account",
		meta: {
			mizen: { rowHeader: true, sticky: true } satisfies DataTableColumnMeta,
		},
	},
	{
		accessorKey: "budget",
		cell: (cell) => `$${cell.getValue<number>().toLocaleString("en-US")}`,
		header: "Budget",
		meta: { mizen: { numeric: true } satisfies DataTableColumnMeta },
	},
];
const rows: BudgetRow[] = [{ account: "Office", budget: 1250 }];

type DataTableContracts = [
	"caption" extends keyof ComponentProps<typeof DataTable> ? true : false,
	"className" extends keyof ComponentProps<typeof DataTable> ? false : true,
	"style" extends keyof ComponentProps<typeof DataTable> ? false : true,
];
const dataTableContracts: DataTableContracts = [true, true, true];

function DataTableFixture({
	data = rows,
	unknownTotal = false,
}: {
	data?: BudgetRow[];
	unknownTotal?: boolean;
}) {
	const table = useTable({
		columns,
		data,
		features,
		manualPagination: unknownTotal,
		pageCount: unknownTotal ? -1 : undefined,
	});
	return (
		<>
			<DataTable caption="Budget records in USD" table={table} />
			<DataTablePagination table={table} />
		</>
	);
}

describe("DataTable contract", () => {
	it("renders a captioned native table with typed row and numeric headers", () => {
		const markup = renderToStaticMarkup(h(DataTableFixture, {}));

		expect(markup).toContain('aria-label="Budget records in USD"');
		// An interactive grid: spreadsheet presentation plus the ARIA grid role.
		expect(markup).toContain(
			'<table data-grid="interactive" data-slot="table" role="grid">'
		);
		expect(markup).toContain(
			'<caption data-slot="table-caption">Budget records in USD</caption>'
		);
		expect(markup).toContain("<button");
		expect(markup).toContain('scope="row"');
		expect(markup).toContain("Office");
		expect(markup).toContain("$1,250");
		expect(dataTableContracts.every(Boolean)).toBe(true);
	});

	it("renders an empty-state row when the table has no results", () => {
		const markup = renderToStaticMarkup(h(DataTableFixture, { data: [] }));

		expect(markup).toContain("No results found.");
	});

	it("keeps unknown server totals honest and disables the unavailable last page", () => {
		const markup = renderToStaticMarkup(
			h(DataTableFixture, { unknownTotal: true })
		);
		const host = document.createElement("div");
		host.innerHTML = markup;
		expect(host.textContent).toContain("Rows on this page: 1");
		expect(
			host.querySelector<HTMLButtonElement>('[aria-label="Last page"]')
				?.disabled
		).toBe(true);
		expect(
			host.querySelector<HTMLButtonElement>('[aria-label="Next page"]')
				?.disabled
		).toBe(false);
	});
});
