import { type KeyboardEvent, useCallback, useRef } from "react";

// WAI-ARIA data grid keyboard model: one tab stop, arrows move between cells,
// and a cell holding exactly one control hands focus to that control.

interface GridPosition {
	column: number;
	row: number;
}

// Widget roles cover Base UI controls rendered on spans; their hidden form
// inputs are aria-hidden and must never take focus.
const CONTROLS = [
	"a[href]",
	"button",
	"input",
	"select",
	"textarea",
	'[role="checkbox"]',
	'[role="switch"]',
	'[role="combobox"]',
]
	.map((selector) => `${selector}:not([aria-hidden="true"])`)
	.join(", ");
const PAGE_ROWS = 10;
const TEXT_ENTRY = new Set([
	"email",
	"number",
	"password",
	"search",
	"tel",
	"text",
	"url",
]);

function getGridRows(table: HTMLTableElement): HTMLTableRowElement[] {
	return [...table.rows].filter(
		(row) => row.getAttribute("aria-hidden") !== "true"
	);
}

function getCell(
	table: HTMLTableElement,
	{ column, row }: GridPosition
): HTMLTableCellElement | undefined {
	const cells = getGridRows(table)[row]?.cells;
	return cells?.[Math.min(column, (cells?.length ?? 1) - 1)];
}

function getFocusTarget(cell: HTMLTableCellElement): HTMLElement {
	const controls = cell.querySelectorAll<HTMLElement>(CONTROLS);
	return controls.length === 1 ? controls[0] : cell;
}

function getPosition(
	table: HTMLTableElement,
	cell: HTMLTableCellElement
): GridPosition {
	const row = getGridRows(table).indexOf(
		cell.parentElement as HTMLTableRowElement
	);
	return { column: cell.cellIndex, row: Math.max(row, 0) };
}

// Text fields and selects keep their own arrow and Home/End keys.
function ownsArrowKeys(target: EventTarget): boolean {
	if (target instanceof HTMLInputElement) {
		return TEXT_ENTRY.has(target.type);
	}
	return (
		target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
	);
}

function getStep(event: KeyboardEvent): GridPosition | "start" | "end" | null {
	const steps: Record<string, GridPosition> = {
		ArrowDown: { column: 0, row: 1 },
		ArrowLeft: { column: -1, row: 0 },
		ArrowRight: { column: 1, row: 0 },
		ArrowUp: { column: 0, row: -1 },
		PageDown: { column: 0, row: PAGE_ROWS },
		PageUp: { column: 0, row: -PAGE_ROWS },
	};
	if (event.key === "Home" || event.key === "End") {
		const edge = event.key === "Home" ? "start" : "end";
		return event.ctrlKey || event.metaKey
			? edge
			: {
					column:
						edge === "start"
							? Number.NEGATIVE_INFINITY
							: Number.POSITIVE_INFINITY,
					row: 0,
				};
	}
	return steps[event.key] ?? null;
}

function resolveTarget(
	table: HTMLTableElement,
	from: GridPosition,
	step: GridPosition | "start" | "end"
): GridPosition {
	const rows = getGridRows(table);
	if (step === "start") {
		return { column: 0, row: 0 };
	}
	if (step === "end") {
		const last = rows.length - 1;
		return { column: (rows[last]?.cells.length ?? 1) - 1, row: last };
	}
	const row = Math.min(Math.max(from.row + step.row, 0), rows.length - 1);
	const width = rows[row]?.cells.length ?? 1;
	const column = Math.min(Math.max(from.column + step.column, 0), width - 1);
	return { column, row };
}

// Only the active cell (or its single control) is tabbable.
function syncTabStops(table: HTMLTableElement, active: GridPosition): void {
	for (const row of getGridRows(table)) {
		for (const cell of row.cells) {
			cell.tabIndex = -1;
			for (const control of cell.querySelectorAll<HTMLElement>(CONTROLS)) {
				control.tabIndex = -1;
			}
		}
	}
	const cell = getCell(table, active);
	if (cell) {
		getFocusTarget(cell).tabIndex = 0;
	}
}

export function useGridNavigation() {
	const tableRef = useRef<HTMLTableElement | null>(null);
	const active = useRef<GridPosition>({ column: 0, row: 0 });

	// Keep one tab stop as rows, cells, and controls change, including a
	// control that resets its own tabindex on re-render. Our own writes are
	// dropped from the queue so they never retrigger the sync.
	const ref = useCallback((table: HTMLTableElement) => {
		tableRef.current = table;
		const sync = () => {
			syncTabStops(table, active.current);
			observer.takeRecords();
		};
		const observer = new MutationObserver(sync);
		observer.observe(table, {
			attributeFilter: ["tabindex"],
			childList: true,
			subtree: true,
		});
		sync();
		return () => {
			observer.disconnect();
			tableRef.current = null;
		};
	}, []);

	const onFocus = useCallback((event: { target: EventTarget }) => {
		const table = tableRef.current;
		const cell = (event.target as Element).closest?.("td, th");
		if (!(table && cell instanceof HTMLTableCellElement)) {
			return;
		}
		active.current = getPosition(table, cell);
		syncTabStops(table, active.current);
	}, []);

	const onKeyDown = useCallback((event: KeyboardEvent) => {
		const table = tableRef.current;
		const step = getStep(event);
		if (!(table && step) || ownsArrowKeys(event.target)) {
			return;
		}
		const cell = getCell(table, resolveTarget(table, active.current, step));
		if (!cell) {
			return;
		}
		event.preventDefault();
		getFocusTarget(cell).focus();
		cell.scrollIntoView({ block: "nearest", inline: "nearest" });
	}, []);

	return { onFocus, onKeyDown, ref };
}
