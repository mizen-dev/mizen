import { type ChartSeriesTone, chartColors } from "./chart-colors";

// Shared input checks for chart components; messages name the component.

export function assertAriaLabel(component: string, ariaLabel: unknown) {
	if (typeof ariaLabel !== "string" || !ariaLabel.trim()) {
		throw new TypeError(`${component} requires a non-empty aria-label.`);
	}
}

/** Checks a non-empty id and label, and that the id is new to `ids`. */
export function assertIdentity(
	component: string,
	item: { id: unknown; label: unknown },
	ids: Set<string>
) {
	const { id, label } = item;
	if (
		typeof id !== "string" ||
		!id.trim() ||
		typeof label !== "string" ||
		!label.trim()
	) {
		throw new TypeError(`${component} items need non-empty ids and labels.`);
	}
	if (ids.has(id)) {
		throw new RangeError(`${component} ids must be unique.`);
	}
	ids.add(id);
}

export function assertNonNegative(component: string, value: unknown) {
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
		throw new RangeError(
			`${component} values must be finite and not negative.`
		);
	}
}

export function assertTone(
	component: string,
	tone: ChartSeriesTone | undefined
) {
	if (tone !== undefined && !Object.hasOwn(chartColors, tone)) {
		throw new RangeError(`${component} tone is not a supported chart tone.`);
	}
}
