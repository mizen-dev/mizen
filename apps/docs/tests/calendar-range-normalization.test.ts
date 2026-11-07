import { describe, expect, it, vi } from "vitest";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	createTheme: <T extends object>(_variables: T, overrides: object): object =>
		overrides,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

import { normalizeCalendarRange } from "../../../packages/ui/src/components/calendar/calendar-utils";

describe("normalizeCalendarRange", () => {
	it("normalizes DateRange with missing from to undefined", () => {
		const toOnly = { to: new Date(2026, 5, 15) };
		expect(
			normalizeCalendarRange({ from: undefined, to: toOnly.to })
		).toBeUndefined();
		expect(normalizeCalendarRange(undefined)).toBeUndefined();
	});

	it("preserves valid DateRange containing required from and optional to", () => {
		const fromDate = new Date(2026, 5, 10);
		const toDate = new Date(2026, 5, 15);

		expect(normalizeCalendarRange({ from: fromDate })).toEqual({
			from: fromDate,
			to: undefined,
		});

		expect(normalizeCalendarRange({ from: fromDate, to: toDate })).toEqual({
			from: fromDate,
			to: toDate,
		});
	});
});
