import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { tableStyles } from "./table.styles";

type Part<T> = Omit<Closed<T>, "data-slot" | "role">;
type Align = "center" | "end" | "start";

export type TableScroll = "both" | "horizontal";
type AccessibleName =
	| { "aria-label": string; "aria-labelledby"?: never }
	| { "aria-label"?: never; "aria-labelledby": string };
export type TableContainerProps = Omit<
	Part<ComponentPropsWithRef<"section">>,
	"aria-label" | "aria-labelledby" | "tabIndex"
> &
	AccessibleName & {
		/**
		 * Makes the scroll region a tab stop for keyboard scrolling. Turn it off
		 * when an interactive grid inside already moves focus cell by cell.
		 */
		focusable?: boolean;
		scroll?: TableScroll;
		tabIndex?: never;
	};
export type TableProps = Part<ComponentPropsWithRef<"table">> & {
	/**
	 * Spreadsheet presentation: column rules and compact rows for working data.
	 * `"interactive"` also exposes the ARIA grid role; only use it with a
	 * keyboard model, as DataTable provides.
	 */
	grid?: boolean | "interactive";
	/**
	 * Exact fixed-layout width in px: the sum of sized columns. Wider tables
	 * scroll, and narrower ones leave free space, like a spreadsheet.
	 */
	width?: number;
};
export type TableHeaderProps = Part<ComponentPropsWithRef<"thead">> & {
	sticky?: boolean;
};
export type TableBodyProps = Part<ComponentPropsWithRef<"tbody">>;
export type TableFooterProps = Part<ComponentPropsWithRef<"tfoot">>;
export type TableRowProps = Part<ComponentPropsWithRef<"tr">> & {
	selected?: boolean;
};
export type TableHeadProps = Omit<
	Part<ComponentPropsWithRef<"th">>,
	"align" | "scope"
> & {
	align?: Align;
	numeric?: boolean;
	scope?: "col" | "colgroup" | "row" | "rowgroup";
	sticky?: boolean;
};
export type TableCellProps = Omit<
	Part<ComponentPropsWithRef<"td">>,
	"align"
> & {
	align?: Align;
	numeric?: boolean;
	sticky?: boolean;
};
export type TableCaptionProps = Part<ComponentPropsWithRef<"caption">>;

function stripReservedProps(attributes: Record<string, unknown>) {
	Reflect.deleteProperty(attributes, "className");
	Reflect.deleteProperty(attributes, "data-slot");
	Reflect.deleteProperty(attributes, "role");
	Reflect.deleteProperty(attributes, "style");
}

export function TableContainer({
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	children,
	focusable = true,
	ref: forwardedRef,
	scroll = "horizontal",
	...rest
}: TableContainerProps) {
	if (!(ariaLabel?.trim() || ariaLabelledBy?.trim())) {
		throw new TypeError("TableContainer requires an accessible name");
	}
	stripReservedProps(rest);
	return (
		<section
			{...rest}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledBy}
			data-slot="table-container"
			ref={forwardedRef}
			tabIndex={focusable ? 0 : undefined}
			{...props(
				tableStyles.container,
				scroll === "both" && tableStyles.containerBoth
			)}
		>
			{children}
		</section>
	);
}

export function Table({
	children,
	grid = false,
	ref: forwardedRef,
	width,
	...rest
}: TableProps) {
	stripReservedProps(rest);
	return (
		<table
			{...rest}
			data-grid={grid || undefined}
			data-slot="table"
			ref={forwardedRef}
			role={grid === "interactive" ? "grid" : undefined}
			{...props(
				tableStyles.table,
				width !== undefined && tableStyles.fixedWidth(width)
			)}
		>
			{children}
		</table>
	);
}

export function TableHeader({
	children,
	ref: forwardedRef,
	sticky = true,
	...rest
}: TableHeaderProps) {
	stripReservedProps(rest);
	return (
		<thead
			{...rest}
			data-slot="table-header"
			ref={forwardedRef}
			{...props(tableStyles.header, sticky && tableStyles.headSticky)}
		>
			{children}
		</thead>
	);
}

export function TableBody({
	children,
	ref: forwardedRef,
	...rest
}: TableBodyProps) {
	stripReservedProps(rest);
	return (
		<tbody
			{...rest}
			data-slot="table-body"
			ref={forwardedRef}
			{...props(tableStyles.body)}
		>
			{children}
		</tbody>
	);
}

export function TableFooter({
	children,
	ref: forwardedRef,
	...rest
}: TableFooterProps) {
	stripReservedProps(rest);
	return (
		<tfoot
			{...rest}
			data-slot="table-footer"
			ref={forwardedRef}
			{...props(tableStyles.footer)}
		>
			{children}
		</tfoot>
	);
}

export function TableRow({
	children,
	ref: forwardedRef,
	selected = false,
	...rest
}: TableRowProps) {
	stripReservedProps(rest);
	return (
		<tr
			{...rest}
			data-selected={selected ? "true" : undefined}
			data-slot="table-row"
			ref={forwardedRef}
			{...props(tableStyles.row, selected && tableStyles.rowSelected)}
		>
			{children}
		</tr>
	);
}

const alignStyles = {
	center: tableStyles.cellCenter,
	end: tableStyles.cellEnd,
	start: null,
};

function cellStyles(
	align: Align | undefined,
	numeric: boolean,
	sticky: boolean,
	head = false
) {
	const effectiveAlign = align ?? (numeric ? "end" : "start");
	return props(
		tableStyles.cell,
		head && tableStyles.head,
		alignStyles[effectiveAlign],
		numeric && tableStyles.cellNumeric,
		sticky && tableStyles.stickyStart
	);
}

export function TableHead({
	align,
	children,
	numeric = false,
	ref: forwardedRef,
	scope = "col",
	sticky = false,
	...rest
}: TableHeadProps) {
	stripReservedProps(rest);
	return (
		<th
			{...rest}
			data-slot="table-head"
			ref={forwardedRef}
			scope={scope}
			{...cellStyles(align, numeric, sticky, true)}
		>
			{children}
		</th>
	);
}

export function TableCell({
	align,
	children,
	numeric = false,
	ref: forwardedRef,
	sticky = false,
	...rest
}: TableCellProps) {
	stripReservedProps(rest);
	return (
		<td
			{...rest}
			data-slot="table-cell"
			ref={forwardedRef}
			{...cellStyles(align, numeric, sticky)}
		>
			{children}
		</td>
	);
}

export function TableCaption({
	children,
	ref: forwardedRef,
	...rest
}: TableCaptionProps) {
	stripReservedProps(rest);
	return (
		<caption
			{...rest}
			data-slot="table-caption"
			ref={forwardedRef}
			{...props(tableStyles.caption)}
		>
			{children}
		</caption>
	);
}
