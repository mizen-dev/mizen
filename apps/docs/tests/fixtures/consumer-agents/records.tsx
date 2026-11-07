"use client";

import {
	Button,
	Field,
	FieldLabel,
	Inline,
	Input,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { DataTable } from "@mizen-labs/ui/data-table";
import {
	type ColumnDef,
	columnFilteringFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	globalFilteringFeature,
	rowPaginationFeature,
	rowSortingFeature,
	sortFn_basic,
	sortFn_text,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { useCallback } from "react";

interface ProjectRecord {
	budget: number;
	department: string;
	project: string;
}

const records: ProjectRecord[] = [
	{ budget: 12_000, department: "Design", project: "Northstar" },
	{ budget: 8000, department: "Engineering", project: "Field notes" },
	{ budget: 16_000, department: "Design", project: "Atlas" },
	{ budget: 6000, department: "Operations", project: "Beacon" },
];

const features = tableFeatures({
	columnFilteringFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	filteredRowModel: createFilteredRowModel(),
	globalFilteringFeature,
	paginatedRowModel: createPaginatedRowModel(),
	rowPaginationFeature,
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: { basic: sortFn_basic, text: sortFn_text },
});

const columns: ColumnDef<typeof features, ProjectRecord>[] = [
	{
		accessorKey: "project",
		enableGlobalFilter: true,
		header: "Project",
		meta: { mizen: { rowHeader: true } },
		sortFn: "text",
	},
	{
		accessorKey: "department",
		enableGlobalFilter: false,
		header: "Department",
		sortFn: "text",
	},
	{
		accessorKey: "budget",
		enableGlobalFilter: false,
		header: "Budget",
		meta: { mizen: { numeric: true } },
		sortFn: "basic",
	},
];

const getRowId = (record: ProjectRecord) => record.project;

export function ConsumerRecords() {
	const table = useTable({
		columns,
		data: records,
		features,
		getRowId,
		globalFilterFn: (row, _columnId, filterValue) => {
			const query = String(filterValue).toLocaleLowerCase();
			return [row.original.project, row.original.department].some((value) =>
				value.toLocaleLowerCase().includes(query)
			);
		},
	});

	const search = String(table.state.globalFilter ?? "");
	const matchingCount = table.getFilteredRowModel().rows.length;
	const updateSearch = useCallback(
		(value: string) => table.setGlobalFilter(value),
		[table]
	);
	const clearSearch = useCallback(() => table.setGlobalFilter(""), [table]);

	return (
		<section>
			<Stack gap="3">
				<Inline>
					<Field>
						<FieldLabel>Search projects</FieldLabel>
						<Input
							onValueChange={updateSearch}
							placeholder="Project or department"
							value={search}
						/>
					</Field>
					<Button onClick={clearSearch} variant="ghost">
						Clear search
					</Button>
				</Inline>
				<Text aria-live="polite" size="ui" tone="muted">
					{matchingCount} {matchingCount === 1 ? "project" : "projects"} found
				</Text>
				{matchingCount === 0 ? (
					<p role="status">No projects match “{search}”. Try another search.</p>
				) : null}
				<DataTable caption="Projects by department and budget." table={table} />
			</Stack>
		</section>
	);
}
