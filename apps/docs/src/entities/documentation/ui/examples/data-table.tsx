"use client";

import { DataTable } from "@mizen-labs/ui/data-table";
import {
	type ColumnDef,
	columnResizingFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	createPaginatedRowModel,
	createSortedRowModel,
	rowPaginationFeature,
	rowSortingFeature,
	sortFn_text,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { useCallback, useMemo } from "react";

export function SortableProjects() {
	const records = useMemo(
		() => [
			{ id: "mizen-docs", name: "Documentation", owner: "Alex Rivera" },
			{ id: "mizen-ui", name: "Design system", owner: "Maya Chen" },
			{ id: "mizen-ref", name: "Reference app", owner: "Sam Jordan" },
		],
		[]
	);
	const features = useMemo(
		() =>
			tableFeatures({
				columnResizingFeature,
				columnSizingFeature,
				columnVisibilityFeature,
				paginatedRowModel: createPaginatedRowModel(),
				rowPaginationFeature,
				rowSortingFeature,
				sortedRowModel: createSortedRowModel(),
				sortFns: { text: sortFn_text },
			}),
		[]
	);
	const columns = useMemo<
		ColumnDef<typeof features, (typeof records)[number]>[]
	>(
		() => [
			{ accessorKey: "name", header: "Project", sortFn: "text" },
			{ accessorKey: "owner", header: "Owner", sortFn: "text" },
		],
		[]
	);
	const getRowId = useCallback((row: (typeof records)[number]) => row.id, []);
	const table = useTable({
		// Drag a column edge, or press Shift+Left/Right on a header, to resize.
		columnResizeMode: "onChange",
		columns,
		data: records,
		features,
		getRowId,
	});
	return (
		<DataTable caption="Projects sorted by project or owner." table={table} />
	);
}
