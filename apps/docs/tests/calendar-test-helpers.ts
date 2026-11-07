import { act } from "react";
import { createRoot } from "react-dom/client";

export function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		container,
		rerender: (
			nextElement: Parameters<ReturnType<typeof createRoot>["render"]>[0]
		) => {
			act(() => root.render(nextElement));
		},
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

export function findDayButton(
	container: HTMLElement,
	day: number,
	monthName = "June",
	year = 2026
): HTMLButtonElement {
	const dayString = String(day);
	const buttons = Array.from(
		container.querySelectorAll<HTMLButtonElement>("button")
	);

	const ariaMatch = buttons.find((btn) => {
		const label =
			btn.getAttribute("aria-label") ??
			btn.closest("td")?.getAttribute("aria-label");
		if (!label) {
			return false;
		}
		return (
			label.includes(monthName) &&
			(label.includes(` ${dayString},`) ||
				label.includes(` ${dayString} `) ||
				label.endsWith(` ${dayString}`)) &&
			label.includes(String(year))
		);
	});
	if (ariaMatch) {
		return ariaMatch;
	}

	const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
	if (Number.isNaN(monthIndex)) {
		throw new Error(`Unknown calendar month: ${monthName}`);
	}
	const monthPadded = String(monthIndex).padStart(2, "0");
	const isoPadded = `${year}-${monthPadded}-${dayString.padStart(2, "0")}`;
	const dataMatch = container.querySelector<HTMLButtonElement>(
		`button[data-day="${isoPadded}"], button[data-date="${isoPadded}"], [data-day="${isoPadded}"] button`
	);
	if (dataMatch) {
		return dataMatch;
	}

	const textMatch = buttons.find((btn) => {
		const text = btn.textContent?.trim();
		if (text !== dayString) {
			return false;
		}
		const isNav =
			btn.getAttribute("aria-label")?.toLowerCase().includes("previous") ||
			btn.getAttribute("aria-label")?.toLowerCase().includes("next");
		return !isNav;
	});
	if (textMatch) {
		return textMatch;
	}

	throw new Error(
		`Calendar day button for ${monthName} ${day}, ${year} was not found.`
	);
}

export function findNavButton(
	container: HTMLElement,
	direction: "previous" | "next"
): HTMLButtonElement {
	const buttons = Array.from(
		container.querySelectorAll<HTMLButtonElement>("button")
	);
	const match = buttons.find((btn) => {
		const label = btn.getAttribute("aria-label")?.toLowerCase();
		return label?.includes(direction);
	});
	if (match) {
		return match;
	}
	throw new Error(`Navigation button for ${direction} was not found.`);
}

export function isDaySelected(button: HTMLButtonElement): boolean {
	return (
		button.getAttribute("aria-selected") === "true" ||
		button.getAttribute("data-selected") === "true" ||
		button.closest("td")?.getAttribute("aria-selected") === "true" ||
		button.closest("td")?.getAttribute("data-selected") === "true"
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function isDate(value: unknown): value is Date {
	return value instanceof Date;
}

export function isRangeValue(
	value: unknown
): value is { readonly from: Date; readonly to?: Date } {
	if (!isRecord(value)) {
		return false;
	}
	const hasValidFrom = isDate(value.from);
	const hasValidTo = value.to === undefined || isDate(value.to);
	return hasValidFrom && hasValidTo;
}
