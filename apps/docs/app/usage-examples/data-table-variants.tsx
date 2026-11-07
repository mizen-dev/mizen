"use client";
import {
	Button,
	Checkbox,
	Field,
	FieldLabel,
	Heading,
	Inline,
	Input,
	SegmentedControl,
	SegmentedControlItem,
	Select,
	SelectItem,
	SelectLabel,
	SelectPopup,
	SelectTrigger,
	SelectValue,
	Stack,
	Text,
} from "@mizen/ui";
import { DataTable, DataTablePagination } from "@mizen/ui/data-table";
import { typographyStyles } from "@mizen/ui/typography.styles";
import { props } from "@stylexjs/stylex";
import { IconX } from "@tabler/icons-react";
import {
	type ColumnDef,
	columnFilteringFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	globalFilteringFeature,
	type Row,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_basic,
	sortFn_text,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { type ChangeEvent, useCallback, useState } from "react";
import { compositionStyles } from "../compositions/composition.styles";
import { dataTableCompositionStyles } from "../compositions/data-table-composition.styles";

interface BudgetRecord {
	account: string;
	budget: number;
	department: string;
	id: string;
	spent: number;
	variance: number;
}
const accounts = [
	"Cloud hosting",
	"Contractors",
	"Equipment",
	"Marketing",
	"Payroll",
	"Travel",
];
const departments = [
	"Design",
	"Engineering",
	"Finance",
	"Operations",
	"Research",
	"Sales",
];
const records: BudgetRecord[] = Array.from({ length: 10_000 }, (_, index) => {
	const budget = 12_000 + ((index * 7919) % 138_000);
	const spent = 9000 + ((index * 3571) % 151_000);

	return {
		account: accounts[index % accounts.length],
		budget,
		department: departments[Math.floor(index / 3) % departments.length],
		id: `BUD-${String(index + 1).padStart(5, "0")}`,
		spent,
		variance: budget - spent,
	};
});
const currency = new Intl.NumberFormat("en-US", {
	currency: "USD",
	maximumFractionDigits: 0,
	style: "currency",
});
const features = tableFeatures({
	columnFilteringFeature,
	columnSizingFeature,
	columnVisibilityFeature,
	filteredRowModel: createFilteredRowModel(),
	globalFilteringFeature,
	paginatedRowModel: createPaginatedRowModel(),
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		basic: sortFn_basic,
		text: sortFn_text,
	},
});
const columns: ColumnDef<typeof features, BudgetRecord>[] = [
	{
		cell: ({ row }) => <SelectionCheckbox row={row} />,
		header: ({ table }) => <SelectPageCheckbox table={table} />,
		id: "selection",
		size: 56,
	},
	{
		accessorKey: "account",
		header: "Account",
		meta: { mizen: { rowHeader: true, sticky: true } },
		sortFn: "text",
	},
	{
		accessorKey: "id",
		cell: (info) => (
			<span {...props(dataTableCompositionStyles.identifier)}>
				{info.getValue<string>()}
			</span>
		),
		header: "Record",
		sortFn: "alphanumeric",
	},
	{
		accessorKey: "department",
		filterFn: (row, columnId, filterValue) =>
			row.getValue(columnId) === filterValue,
		header: "Department",
		sortFn: "text",
	},
	{
		accessorKey: "budget",
		cell: (info) => currency.format(info.getValue<number>()),
		enableGlobalFilter: true,
		header: "Budget",
		meta: { mizen: { numeric: true } },
		sortFn: "basic",
	},
	{
		accessorKey: "spent",
		cell: (info) => currency.format(info.getValue<number>()),
		enableGlobalFilter: true,
		header: "Spent",
		meta: { mizen: { numeric: true } },
		sortFn: "basic",
	},
	{
		accessorKey: "variance",
		cell: (info) => currency.format(info.getValue<number>()),
		enableGlobalFilter: true,
		header: "Remaining",
		meta: { mizen: { numeric: true } },
		sortFn: "basic",
	},
];
function SelectionCheckbox({
	row,
}: {
	row: Row<typeof features, BudgetRecord>;
}) {
	const onCheckedChange = useCallback(
		(checked: boolean) => row.toggleSelected(checked),
		[row]
	);
	return (
		<Checkbox
			aria-label={`Select ${row.original.id}`}
			checked={row.getIsSelected()}
			disabled={!row.getCanSelect()}
			onCheckedChange={onCheckedChange}
		/>
	);
}
function SelectPageCheckbox({
	table,
}: {
	table: {
		getIsAllPageRowsSelected: () => boolean;
		getIsSomePageRowsSelected: () => boolean;
		toggleAllPageRowsSelected: (selected: boolean) => void;
	};
}) {
	const allPageRowsSelected = table.getIsAllPageRowsSelected();
	const onCheckedChange = useCallback(
		(checked: boolean) => table.toggleAllPageRowsSelected(checked),
		[table]
	);
	return (
		<Checkbox
			aria-label="Select all rows on this page"
			checked={allPageRowsSelected}
			indeterminate={table.getIsSomePageRowsSelected() && !allPageRowsSelected}
			onCheckedChange={onCheckedChange}
		/>
	);
}
interface DataTableToolbarProps {
	departmentValue: string;
	onClearFilters: () => void;
	onDepartmentChange: (value: string | null) => void;
	onRemoveDepartmentFilter: () => void;
	onRemoveSearchFilter: () => void;
	onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
	searchValue: string;
}
function DataTableToolbar({
	departmentValue,
	searchValue,
	onClearFilters,
	onDepartmentChange,
	onRemoveDepartmentFilter,
	onRemoveSearchFilter,
	onSearchChange,
}: DataTableToolbarProps) {
	const hasFilters = Boolean(searchValue || departmentValue);
	return (
		<Stack gap="2">
			<div {...props(compositionStyles.controls)}>
				<Field>
					<FieldLabel>Search records</FieldLabel>
					<Input
						data-testid="data-table-search"
						onChange={onSearchChange}
						placeholder="Search accounts, departments, or amounts"
						value={searchValue}
					/>
				</Field>
				<Field>
					<Select<string>
						onValueChange={onDepartmentChange}
						value={departmentValue || "all"}
					>
						<SelectLabel>Department</SelectLabel>
						<SelectTrigger>
							<SelectValue>
								{departments.find(
									(department) => department === departmentValue
								) ?? "All departments"}
							</SelectValue>
						</SelectTrigger>
						<SelectPopup>
							<SelectItem value="all">All departments</SelectItem>
							{departments.map((department) => (
								<SelectItem key={department} value={department}>
									{department}
								</SelectItem>
							))}
						</SelectPopup>
					</Select>
				</Field>
			</div>
			{hasFilters ? (
				<Inline>
					{Boolean(searchValue) && (
						<Button
							aria-label={`Remove search filter ${searchValue}`}
							onClick={onRemoveSearchFilter}
							size="sm"
							variant="secondary"
						>
							{`Search: ${searchValue}`}
							<IconX aria-hidden="true" focusable="false" size="1em" />
						</Button>
					)}
					{Boolean(departmentValue) && (
						<Button
							aria-label={`Remove department filter ${departmentValue}`}
							onClick={onRemoveDepartmentFilter}
							size="sm"
							variant="secondary"
						>
							{`Department: ${departmentValue}`}
							<IconX aria-hidden="true" focusable="false" size="1em" />
						</Button>
					)}
					<Button
						data-testid="data-table-clear-filters"
						onClick={onClearFilters}
						variant="ghost"
					>
						Clear all filters
					</Button>
				</Inline>
			) : null}
		</Stack>
	);
}
interface DataTableBulkActionsProps {
	bulkFeedback: string;
	hasAllMatchingSelected: boolean;
	matchingCount: number;
	onClearSelection: () => void;
	onMarkReviewed: () => void;
	onSelectMatching: () => void;
	onUndoReview: () => void;
	reviewedCount: number;
	selectedCount: number;
	undoAvailable: boolean;
}
function DataTableBulkActions({
	bulkFeedback,
	hasAllMatchingSelected,
	matchingCount,
	reviewedCount,
	selectedCount,
	undoAvailable,
	onClearSelection,
	onMarkReviewed,
	onSelectMatching,
	onUndoReview,
}: DataTableBulkActionsProps) {
	return (
		<Inline data-testid="data-table-bulk-actions">
			<Text aria-live="polite" size="ui" tone="muted">
				<span {...props(typographyStyles.tabularNums)}>
					{selectedCount.toLocaleString("en-US")} selected
				</span>
			</Text>
			<Button
				aria-label={`Select matching records (${matchingCount.toLocaleString("en-US")} filtered results)`}
				data-testid="data-table-select-all-matching"
				disabled={matchingCount === 0 || hasAllMatchingSelected}
				onClick={onSelectMatching}
				variant="secondary"
			>
				Select matching
			</Button>
			{selectedCount > 0 ? (
				<Button
					data-testid="data-table-clear-selection"
					onClick={onClearSelection}
					variant="ghost"
				>
					Clear selection
				</Button>
			) : null}
			{selectedCount > 0 ? (
				<Button
					aria-label={`Review selected ${selectedCount.toLocaleString("en-US")} records`}
					data-testid="data-table-mark-reviewed"
					onClick={onMarkReviewed}
				>
					Review selected
				</Button>
			) : null}
			{undoAvailable ? (
				<Button onClick={onUndoReview} variant="ghost">
					Undo
				</Button>
			) : null}
			{bulkFeedback ? (
				<Text aria-live="polite" data-testid="data-table-review-feedback">
					<span
						{...props(typographyStyles.tabularNums)}
					>{`${bulkFeedback} Reviewed records: ${reviewedCount.toLocaleString("en-US")}.`}</span>
				</Text>
			) : null}
		</Inline>
	);
}
export function DataTableBudgetRecordsExample1() {
	const [view, setView] = useState<"paged" | "virtualized">("paged");
	const [reviewedIds, setReviewedIds] = useState<ReadonlySet<string>>(
		() => new Set()
	);
	const [reviewUndo, setReviewUndo] = useState<
		readonly { id: string; wasReviewed: boolean }[] | null
	>(null);
	const [bulkFeedback, setBulkFeedback] = useState("");
	const table = useTable({
		columns,
		data: records,
		features,
		getRowId: (row) => row.id,
		globalFilterFn: (row, columnId, filterValue) =>
			String(row.getValue(columnId) ?? "")
				.toLocaleLowerCase()
				.includes(String(filterValue).toLocaleLowerCase()),
		initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
		manualPagination: view === "virtualized",
	});
	const changeSearch = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			table.setGlobalFilter(event.currentTarget.value);
			table.setPageIndex(0);
		},
		[table]
	);
	const changeDepartment = useCallback(
		(nextDepartment: string | null) => {
			table
				.getColumn("department")
				?.setFilterValue(nextDepartment === "all" ? undefined : nextDepartment);
			table.setPageIndex(0);
		},
		[table]
	);
	const changeView = useCallback(
		([nextView]: string[]) => {
			if (nextView === "paged" || nextView === "virtualized") {
				setView(nextView);
				table.getColumn("selection")?.toggleVisibility(nextView === "paged");
				table.setPageIndex(0);
			}
		},
		[table]
	);
	const clearFilters = useCallback(() => {
		table.setGlobalFilter("");
		table.setColumnFilters([]);
		table.setPageIndex(0);
	}, [table]);
	const selectAllMatching = useCallback(() => {
		for (const row of table.getFilteredRowModel().rows) {
			row.toggleSelected(true);
		}
	}, [table]);
	const clearSelection = useCallback(
		() => table.resetRowSelection(true),
		[table]
	);
	const removeSearchFilter = useCallback(() => {
		table.setGlobalFilter("");
		table.setPageIndex(0);
	}, [table]);
	const removeDepartmentFilter = useCallback(() => {
		table.getColumn("department")?.setFilterValue(undefined);
		table.setPageIndex(0);
	}, [table]);
	const markSelectedReviewed = useCallback(() => {
		const selectedIds = table
			.getSelectedRowModel()
			.rows.map(({ original }) => original.id);
		if (selectedIds.length === 0) {
			return;
		}
		setReviewUndo(
			selectedIds.map((id) => ({ id, wasReviewed: reviewedIds.has(id) }))
		);
		setReviewedIds((current) => new Set([...current, ...selectedIds]));
		setBulkFeedback(
			`Marked ${selectedIds.length} selected records as reviewed.`
		);
	}, [reviewedIds, table]);
	const undoReview = useCallback(() => {
		if (!reviewUndo) {
			return;
		}
		setReviewedIds((current) => {
			const next = new Set(current);
			for (const { id, wasReviewed } of reviewUndo) {
				if (wasReviewed) {
					next.add(id);
				} else {
					next.delete(id);
				}
			}
			return next;
		});
		setReviewUndo(null);
		setBulkFeedback("The last review change was undone.");
	}, [reviewUndo]);
	const searchValue = String(table.state.globalFilter ?? "");
	const departmentValue = String(
		table.getColumn("department")?.getFilterValue() ?? ""
	);
	const matchingCount = table.getFilteredRowModel().rows.length;
	const selectedCount = table.getSelectedRowModel().rows.length;
	const filteredRows = table.getFilteredRowModel().rows;
	const hasAllMatchingSelected =
		filteredRows.length > 0 && filteredRows.every((row) => row.getIsSelected());
	return (
		<Stack gap="4">
			<div {...props(compositionStyles.intro)}>
				<Heading id="data-table-heading" level={2} size="title">
					Budget records
				</Heading>
				<p {...props(compositionStyles.sectionDescription)}>
					Search and compare 10,000 budget records.
				</p>
			</div>
			<DataTableToolbar
				departmentValue={departmentValue}
				onClearFilters={clearFilters}
				onDepartmentChange={changeDepartment}
				onRemoveDepartmentFilter={removeDepartmentFilter}
				onRemoveSearchFilter={removeSearchFilter}
				onSearchChange={changeSearch}
				searchValue={searchValue}
			/>
			<div {...props(dataTableCompositionStyles.controls)}>
				<div {...props(dataTableCompositionStyles.controlGroup)}>
					<p
						aria-live="polite"
						{...props(
							compositionStyles.sectionDescription,
							dataTableCompositionStyles.count
						)}
					>
						{matchingCount.toLocaleString("en-US")} matching records
						{view === "virtualized" ? " in the read-only virtualized view" : ""}
					</p>
					<SegmentedControl
						aria-label="Budget table view"
						data-testid="data-table-mode"
						onValueChange={changeView}
						value={[view]}
					>
						<SegmentedControlItem value="paged">Paged</SegmentedControlItem>
						<SegmentedControlItem value="virtualized">
							Virtualized
						</SegmentedControlItem>
					</SegmentedControl>
				</div>
				{view === "paged" ? (
					<div {...props(dataTableCompositionStyles.bulkActions)}>
						<DataTableBulkActions
							bulkFeedback={bulkFeedback}
							hasAllMatchingSelected={hasAllMatchingSelected}
							matchingCount={matchingCount}
							onClearSelection={clearSelection}
							onMarkReviewed={markSelectedReviewed}
							onSelectMatching={selectAllMatching}
							onUndoReview={undoReview}
							reviewedCount={reviewedIds.size}
							selectedCount={selectedCount}
							undoAvailable={reviewUndo !== null}
						/>
					</div>
				) : null}
			</div>
			<DataTable<typeof features, BudgetRecord>
				caption="Budget records in USD."
				table={table}
				virtualized={view === "virtualized"}
			/>
			{view === "paged" ? (
				<DataTablePagination<typeof features, BudgetRecord> table={table} />
			) : null}
		</Stack>
	);
}
