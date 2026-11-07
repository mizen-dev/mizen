"use client";

import { props } from "@stylexjs/stylex";
import type {
	Cell,
	Column,
	ColumnSort,
	columnSizingFeature,
	columnVisibilityFeature,
	Header,
	HeaderGroup,
	PaginationState,
	ReactTable,
	Row,
	RowData,
	rowPaginationFeature,
	rowSortingFeature,
	Table_RowPagination,
	Table_RowSorting,
	TableFeatures,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useRef } from "react";
import { IconArrowDown, IconArrowUp } from "../../icons";
import { typographyStyles } from "../../styles/typography.styles";
import { Button } from "../button/button";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableContainer,
	TableHead,
	TableHeader,
	TableRow,
} from "../table/table";
import { Text } from "../text/text";
import { dataTableStyles } from "./data-table.styles";
import { useGridNavigation } from "./grid-navigation";

export interface DataTableColumnMeta {
	numeric?: boolean;
	rowHeader?: boolean;
	sticky?: boolean;
}

declare module "@tanstack/react-table" {
	interface ColumnMeta<
		TFeatures extends TableFeatures,
		TData extends RowData,
		TValue,
	> {
		mizen?: DataTableColumnMeta;
	}
}

type DataTableFeatureMap = TableFeatures & {
	columnSizingFeature: typeof columnSizingFeature;
	columnVisibilityFeature: typeof columnVisibilityFeature;
	rowPaginationFeature: typeof rowPaginationFeature;
	rowSortingFeature: typeof rowSortingFeature;
};
type SortableTable<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
> = ReactTable<TFeatures, TData> & Table_RowSorting<TFeatures, TData>;
type PaginatedTable<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
> = ReactTable<TFeatures, TData> & Table_RowPagination<TFeatures, TData>;

export interface DataTableProps<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
> {
	caption: string;
	table: SortableTable<TFeatures, TData>;
	virtualized?: boolean;
}

// Compact grid rows: a 20px line, 8px padding above and below, and a 1px rule.
const ESTIMATED_ROW_HEIGHT = 37;
const selectState = <T,>(state: T) => state;
const RESIZE_STEP = 16;
interface ResizeKeyEvent {
	currentTarget: Element;
	key: string;
	preventDefault: () => void;
	shiftKey: boolean;
	stopPropagation: () => void;
}
const MIN_COLUMN_WIDTH = 48;

// Column resizing is opt-in: it exists when the table includes TanStack's
// columnResizingFeature.
type ResizableHeader<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
> = Header<TFeatures, TData, unknown> & {
	getResizeHandler?: () => (event: unknown) => void;
};
type ResizableColumn<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
> = Column<TFeatures, TData> & {
	getCanResize?: () => boolean;
	getIsResizing?: () => boolean;
	getSize: () => number;
	resetSize?: () => void;
};
type SizedTable<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
> = ReactTable<TFeatures, TData> & {
	getTotalSize?: () => number;
	setColumnSizing?: (
		updater: (sizing: Record<string, number>) => Record<string, number>
	) => void;
};

function canResize<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>(header: ResizableHeader<TFeatures, TData>): boolean {
	const column = header.column as unknown as ResizableColumn<TFeatures, TData>;
	return (
		typeof header.getResizeHandler === "function" &&
		column.getCanResize?.() !== false
	);
}

function resizeBy<TFeatures extends DataTableFeatureMap, TData extends RowData>(
	source: SizedTable<TFeatures, TData>,
	column: ResizableColumn<TFeatures, TData>,
	delta: number
): void {
	const { maxSize, minSize } = column.columnDef as {
		maxSize?: number;
		minSize?: number;
	};
	const size = Math.min(
		Math.max(column.getSize() + delta, minSize ?? MIN_COLUMN_WIDTH),
		maxSize ?? Number.POSITIVE_INFINITY
	);
	source.setColumnSizing?.((sizing) => ({ ...sizing, [column.id]: size }));
}
function hasColumnSizing<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>(source: ReactTable<TFeatures, TData>): boolean {
	const { columnSizing } = source.state as {
		columnSizing?: Record<string, number>;
	};
	return Object.keys(columnSizing ?? {}).length > 0;
}

// Columns start at their natural widths. The first resize records every
// rendered width, so from then on the table is exactly the sum of its columns.
function seedColumnSizing<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>(source: SizedTable<TFeatures, TData>, from: Element): void {
	const cells = from.closest("table")?.tHead?.rows;
	const headers = cells?.[cells.length - 1]?.cells;
	if (hasColumnSizing(source) || !headers) {
		return;
	}
	const columns = source.getAllLeafColumns() as Array<
		Column<TFeatures, TData> & { getIsVisible: () => boolean }
	>;
	const sizing = Object.fromEntries(
		columns
			.filter((column) => column.getIsVisible())
			.map((column, index) => [
				column.id,
				Math.round(headers[index]?.getBoundingClientRect().width ?? 0),
			])
	);
	source.setColumnSizing?.(() => sizing);
}
const sortIcons = { asc: IconArrowUp, desc: IconArrowDown };

export function DataTable<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({
	caption,
	table: source,
	virtualized = false,
}: DataTableProps<TFeatures, TData>) {
	return (
		<source.Subscribe selector={selectState}>
			{() => (
				<DataTableView
					caption={caption}
					table={source}
					virtualized={virtualized}
				/>
			)}
		</source.Subscribe>
	);
}

function DataTableView<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({
	caption,
	table: source,
	virtualized,
}: Omit<DataTableProps<TFeatures, TData>, "virtualized"> & {
	virtualized: boolean;
}) {
	const viewportRef = useRef<HTMLElement>(null);
	const gridNavigation = useGridNavigation();
	const { rows } = source.getRowModel();
	const columns = (
		source.getAllLeafColumns() as Array<
			Column<TFeatures, TData> & {
				getIsVisible: () => boolean;
				getSize: () => number;
			}
		>
	).filter((column) => column.getIsVisible());
	const headerGroups = source.getHeaderGroups();
	const resizable = headerGroups.some((group) =>
		group.headers.some((header) => canResize(header))
	);
	const getItemKey = useCallback(
		(index: number) => rows[index]?.id ?? index,
		[rows]
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns a mutable instance by design; this component stays uncompiled.
	const virtualizer = useVirtualizer<HTMLElement, HTMLTableRowElement>({
		anchorTo: "end",
		count: rows.length,
		enabled: virtualized,
		estimateSize: () => ESTIMATED_ROW_HEIGHT,
		getItemKey,
		getScrollElement: () => viewportRef.current,
		initialRect: { height: 448, width: 1024 },
		overscan: 5,
	});
	const virtualRows = virtualizer.getVirtualItems();
	const topPadding = virtualRows[0]?.start ?? 0;
	const bottomPadding =
		virtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0);

	return (
		<TableContainer
			aria-label={caption}
			focusable={false}
			ref={viewportRef}
			scroll="both"
		>
			<Table
				aria-rowcount={
					virtualized ? rows.length + headerGroups.length : undefined
				}
				grid="interactive"
				onFocus={gridNavigation.onFocus}
				onKeyDown={gridNavigation.onKeyDown}
				ref={gridNavigation.ref}
				width={
					resizable && hasColumnSizing(source)
						? (source as SizedTable<TFeatures, TData>).getTotalSize?.()
						: undefined
				}
			>
				<TableCaption>{caption}</TableCaption>
				<colgroup>
					{columns.map((column) => (
						<col
							key={column.id}
							{...props(dataTableStyles.column(column.getSize()))}
						/>
					))}
				</colgroup>
				<TableHeader>
					{headerGroups.map((group, rowIndex) => (
						<DataTableHeaderGroup
							group={group}
							key={group.id}
							primarySortId={
								(source.state as { sorting?: ColumnSort[] }).sorting?.[0]?.id
							}
							rowIndex={rowIndex}
							table={source}
							virtualized={Boolean(virtualized)}
						/>
					))}
				</TableHeader>
				<TableBody>
					{rows.length === 0 ? (
						<TableRow>
							<TableCell colSpan={columns.length}>No results found.</TableCell>
						</TableRow>
					) : (
						<DataTableRows
							bottomPadding={bottomPadding}
							columnsCount={columns.length}
							headerCount={headerGroups.length}
							rows={rows}
							table={source}
							topPadding={topPadding}
							virtualized={Boolean(virtualized)}
							virtualizer={virtualizer}
							virtualRows={virtualRows}
						/>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

function VirtualSpacer({
	height,
	columnCount,
}: {
	height: number;
	columnCount: number;
}) {
	return (
		<TableRow aria-hidden="true">
			<td
				colSpan={columnCount}
				{...props(
					dataTableStyles.spacerCell,
					dataTableStyles.spacerHeight(height)
				)}
			/>
		</TableRow>
	);
}

function DataTableRows<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({
	columnsCount,
	headerCount,
	rows,
	table: source,
	virtualized,
	virtualRows,
	virtualizer,
	topPadding,
	bottomPadding,
}: {
	columnsCount: number;
	headerCount: number;
	rows: Row<TFeatures, TData>[];
	table: ReactTable<TFeatures, TData>;
	virtualized: boolean;
	virtualRows: Array<{ index: number }>;
	virtualizer: ReturnType<
		typeof useVirtualizer<HTMLElement, HTMLTableRowElement>
	>;
	topPadding: number;
	bottomPadding: number;
}) {
	const renderedRows = virtualized
		? virtualRows.map(({ index }) => ({ index, row: rows[index] }))
		: rows.map((row, index) => ({ index, row }));
	return (
		<>
			{virtualized && topPadding > 0 ? (
				<VirtualSpacer columnCount={columnsCount} height={topPadding} />
			) : null}
			{renderedRows.map(({ index, row }) => (
				<DataTableBodyRow
					headerCount={headerCount}
					index={index}
					key={row.id}
					measureElement={virtualized ? virtualizer.measureElement : undefined}
					row={row}
					table={source}
					virtualized={virtualized}
				/>
			))}
			{virtualized && bottomPadding > 0 ? (
				<VirtualSpacer columnCount={columnsCount} height={bottomPadding} />
			) : null}
		</>
	);
}

function DataTableHeaderGroup<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({
	group,
	primarySortId,
	rowIndex,
	table: source,
	virtualized,
}: {
	group: HeaderGroup<TFeatures, TData>;
	primarySortId?: string;
	rowIndex: number;
	table: ReactTable<TFeatures, TData>;
	virtualized: boolean;
}) {
	return (
		<TableRow aria-rowindex={virtualized ? rowIndex + 1 : undefined}>
			{group.headers.map((header) => (
				<DataTableHeaderCell
					header={header}
					key={header.id}
					primarySortId={primarySortId}
					table={source}
				/>
			))}
		</TableRow>
	);
}

function DataTableHeaderCell<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({
	header,
	primarySortId,
	table: source,
}: {
	header: Header<TFeatures, TData, unknown>;
	primarySortId?: string;
	table: ReactTable<TFeatures, TData>;
}) {
	const column = header.column as Column<TFeatures, TData> & {
		getIsSorted: () => "asc" | "desc" | false;
		getCanSort: () => boolean;
		getToggleSortingHandler: () => ((event: unknown) => void) | undefined;
	};
	const sorted = column.getIsSorted();
	const meta = column.columnDef.meta?.mizen;
	const sortValues: Record<"asc" | "desc", "ascending" | "descending"> = {
		asc: "ascending",
		desc: "descending",
	};
	const ariaSort =
		column.id === primarySortId && !header.isPlaceholder && sorted
			? sortValues[sorted]
			: undefined;
	const resizable = canResize(header);
	return (
		<TableHead
			aria-sort={ariaSort}
			colSpan={header.colSpan}
			numeric={meta?.numeric}
			onKeyDown={getResizeKeyHandler(resizable, source, column)}
			sticky={meta?.sticky ?? meta?.rowHeader}
		>
			<HeaderContent column={column} header={header} table={source} />
			{resizable ? <ColumnResizeHandle header={header} table={source} /> : null}
		</TableHead>
	);
}

function getResizeKeyHandler<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>(
	resizable: boolean,
	source: SizedTable<TFeatures, TData>,
	column: Column<TFeatures, TData>
) {
	if (!resizable) {
		return;
	}
	return (event: ResizeKeyEvent) =>
		handleResizeKey(
			event,
			source,
			column as unknown as ResizableColumn<TFeatures, TData>
		);
}

// Shift+Left and Shift+Right resize the focused column; plain arrows still move
// between cells.
function handleResizeKey<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>(
	event: ResizeKeyEvent,
	source: SizedTable<TFeatures, TData>,
	column: ResizableColumn<TFeatures, TData>
): void {
	const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
	if (!(event.shiftKey && direction)) {
		return;
	}
	event.preventDefault();
	event.stopPropagation();
	seedColumnSizing(source, event.currentTarget);
	resizeBy(source, column, direction * RESIZE_STEP);
}

// Pointer affordance on the column's trailing edge. Double-click restores the
// default width.
function ColumnResizeHandle<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({
	header,
	table: source,
}: {
	header: ResizableHeader<TFeatures, TData>;
	table: SizedTable<TFeatures, TData>;
}) {
	const column = header.column as unknown as ResizableColumn<TFeatures, TData>;
	const onResize = useCallback(
		(event: { currentTarget: Element }) => {
			seedColumnSizing(source, event.currentTarget);
			header.getResizeHandler?.()(event);
		},
		[header, source]
	);
	const onReset = useCallback(() => column.resetSize?.(), [column]);
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: A pointer-only affordance hidden from assistive tech; keyboard users resize with Shift+Left/Right on the header.
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Same pointer-only affordance as above.
		<span
			aria-hidden="true"
			data-resizing={column.getIsResizing?.() || undefined}
			data-slot="data-table-resize-handle"
			onDoubleClick={onReset}
			onMouseDown={onResize}
			onTouchStart={onResize}
			{...props(dataTableStyles.resizeHandle)}
		/>
	);
}

function HeaderContent<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({
	column,
	header,
	table: source,
}: {
	column: Column<TFeatures, TData> & {
		getIsSorted: () => "asc" | "desc" | false;
		getCanSort: () => boolean;
		getToggleSortingHandler: () => ((event: unknown) => void) | undefined;
	};
	header: Header<TFeatures, TData, unknown>;
	table: ReactTable<TFeatures, TData>;
}) {
	if (header.isPlaceholder) {
		return null;
	}
	const label = <source.FlexRender header={header} />;
	const sorted = column.getIsSorted();
	const SortIcon = sorted ? sortIcons[sorted] : null;
	return column.getCanSort() ? (
		<span {...props(dataTableStyles.sortButton)}>
			<Button
				onClick={column.getToggleSortingHandler()}
				size="sm"
				variant="ghost"
			>
				{/* Rendered header labels skip Button's string trim, so trim here. */}
				<span {...props(typographyStyles.controlLabel)}>{label}</span>
				{SortIcon ? (
					<SortIcon aria-hidden="true" focusable="false" size="1em" />
				) : null}
			</Button>
		</span>
	) : (
		label
	);
}

function DataTableBodyRow<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({
	headerCount,
	index,
	measureElement,
	row,
	table: source,
	virtualized,
}: {
	headerCount: number;
	index: number;
	measureElement?: (element: HTMLTableRowElement | null) => void;
	row: Row<TFeatures, TData>;
	table: ReactTable<TFeatures, TData>;
	virtualized: boolean;
}) {
	return (
		<TableRow
			aria-rowindex={virtualized ? index + headerCount + 1 : undefined}
			data-index={virtualized ? index : undefined}
			ref={measureElement}
		>
			{(
				row as Row<TFeatures, TData> & {
					getVisibleCells: () => Cell<TFeatures, TData, unknown>[];
				}
			)
				.getVisibleCells()
				.map((cell) => (
					<DataTableBodyCell cell={cell} key={cell.id} table={source} />
				))}
		</TableRow>
	);
}

function DataTableBodyCell<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({
	cell,
	table: source,
}: {
	cell: Cell<TFeatures, TData, unknown>;
	table: ReactTable<TFeatures, TData>;
}) {
	const meta = cell.column.columnDef.meta?.mizen;
	return meta?.rowHeader ? (
		<TableHead numeric={meta.numeric} scope="row" sticky={meta.sticky ?? true}>
			<source.FlexRender cell={cell} />
		</TableHead>
	) : (
		<TableCell numeric={meta?.numeric} sticky={meta?.sticky}>
			<source.FlexRender cell={cell} />
		</TableCell>
	);
}

export interface DataTablePaginationProps<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
> {
	table: PaginatedTable<TFeatures, TData>;
}

export function DataTablePagination<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({ table: source }: DataTablePaginationProps<TFeatures, TData>) {
	return (
		<source.Subscribe selector={selectState}>
			{(state) => (
				<PaginationControls
					pagination={(state as { pagination: PaginationState }).pagination}
					table={source}
				/>
			)}
		</source.Subscribe>
	);
}

function PaginationControls<
	TFeatures extends DataTableFeatureMap,
	TData extends RowData,
>({
	table: source,
	pagination,
}: DataTablePaginationProps<TFeatures, TData> & {
	pagination: PaginationState;
}) {
	const rowCount = source.getRowCount();
	const pageCount = source.getPageCount();
	const start =
		rowCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
	const end = Math.min(
		(pagination.pageIndex + 1) * pagination.pageSize,
		rowCount
	);
	return (
		<div data-slot="data-table-pagination" {...props(dataTableStyles.footer)}>
			<Text aria-live="polite" size="ui" tone="muted">
				{pageCount < 0
					? `Rows on this page: ${source.getRowModel().rows.length}`
					: `${start}–${end} of ${rowCount} rows`}
			</Text>
			<div {...props(dataTableStyles.controls)}>
				<Button
					aria-label="First page"
					disabled={!source.getCanPreviousPage()}
					onClick={source.firstPage}
					variant="outline"
				>
					First
				</Button>
				<Button
					aria-label="Previous page"
					disabled={!source.getCanPreviousPage()}
					onClick={source.previousPage}
					variant="outline"
				>
					Previous
				</Button>
				<Text aria-live="polite" size="ui" tone="muted">
					Page {pagination.pageIndex + 1}
					{pageCount < 0 ? "" : ` of ${Math.max(1, pageCount)}`}
				</Text>
				<Button
					aria-label="Next page"
					disabled={!source.getCanNextPage()}
					onClick={source.nextPage}
					variant="outline"
				>
					Next
				</Button>
				<Button
					aria-label="Last page"
					disabled={pageCount < 0 || !source.getCanNextPage()}
					onClick={source.lastPage}
					variant="outline"
				>
					Last
				</Button>
			</div>
		</div>
	);
}
