import { describe, expect, it } from "vitest";
import {
	areRangesEqual,
	countNights,
	formatIsoRange,
	isRangeConstraintSatisfied,
	parseIsoRange,
	validateRangeInput,
} from "../../../packages/ui/src/components/date-range-picker/date-range-picker-date";

describe("date-range-picker-date utilities", () => {
	describe("formatIsoRange", () => {
		it("formats undefined or empty as empty string", () => {
			expect(formatIsoRange(undefined)).toBe("");
		});

		it("formats partial range with only 'from' as YYYY-MM-DD", () => {
			const range = { from: new Date(2026, 9, 3) };
			expect(formatIsoRange(range)).toBe("2026-10-03");
		});

		it("formats complete range as YYYY-MM-DD – YYYY-MM-DD with en dash", () => {
			const range = {
				from: new Date(2026, 9, 3),
				to: new Date(2026, 9, 10),
			};
			expect(formatIsoRange(range)).toBe("2026-10-03 – 2026-10-10");
		});
	});

	describe("countNights", () => {
		it("calculates nights across ordinary days", () => {
			const from = new Date(2026, 9, 3);
			const to = new Date(2026, 9, 7);
			expect(countNights(from, to)).toBe(4);
		});

		it("calculates nights safely across daylight saving transitions", () => {
			// US spring forward around March: March 7 to March 9 2026
			const from = new Date(2026, 2, 7);
			const to = new Date(2026, 2, 9);
			expect(countNights(from, to)).toBe(2);
		});

		it("returns 0 when from and to are the same calendar day", () => {
			const from = new Date(2026, 9, 3);
			const to = new Date(2026, 9, 3);
			expect(countNights(from, to)).toBe(0);
		});
	});

	describe("parseIsoRange", () => {
		it("parses single local ISO date as partial range", () => {
			const parsed = parseIsoRange("2026-10-03");
			expect(parsed).toBeDefined();
			expect(parsed?.from.getFullYear()).toBe(2026);
			expect(parsed?.from.getMonth()).toBe(9);
			expect(parsed?.from.getDate()).toBe(3);
			expect(parsed?.to).toBeUndefined();
		});

		it("parses ranges separated by en dash", () => {
			const parsed = parseIsoRange("2026-10-03 – 2026-10-10");
			expect(parsed).toBeDefined();
			expect(parsed?.from.getDate()).toBe(3);
			expect(parsed?.to?.getDate()).toBe(10);
		});

		it("parses ranges separated by em dash", () => {
			const parsed = parseIsoRange("2026-10-03 — 2026-10-10");
			expect(parsed).toBeDefined();
			expect(parsed?.from.getDate()).toBe(3);
			expect(parsed?.to?.getDate()).toBe(10);
		});

		it("parses ranges separated by slash", () => {
			const parsed = parseIsoRange("2026-10-03/2026-10-10");
			expect(parsed).toBeDefined();
			expect(parsed?.from.getDate()).toBe(3);
			expect(parsed?.to?.getDate()).toBe(10);
		});

		it("parses ranges separated by case-insensitive 'to'", () => {
			const parsed1 = parseIsoRange("2026-10-03 to 2026-10-10");
			const parsed2 = parseIsoRange("2026-10-03 TO 2026-10-10");
			expect(parsed1?.to?.getDate()).toBe(10);
			expect(parsed2?.to?.getDate()).toBe(10);
		});

		it("parses ranges separated by ASCII hyphen surrounded by whitespace", () => {
			const parsed = parseIsoRange("2026-10-03 - 2026-10-10");
			expect(parsed).toBeDefined();
			expect(parsed?.from.getDate()).toBe(3);
			expect(parsed?.to?.getDate()).toBe(10);
		});

		it("rejects ASCII hyphen without surrounding whitespace to avoid ambiguity with ISO date dashes", () => {
			expect(parseIsoRange("2026-10-03-2026-10-10")).toBeUndefined();
		});

		it("rejects reversed ranges where to is before from", () => {
			expect(parseIsoRange("2026-10-10 – 2026-10-03")).toBeUndefined();
		});

		it("rejects trailing separators or malformed text", () => {
			expect(parseIsoRange("2026-10-03 –")).toBeUndefined();
			expect(parseIsoRange("2026-10-03 /")).toBeUndefined();
			expect(parseIsoRange("2026-10-03 to")).toBeUndefined();
			expect(parseIsoRange("garbage")).toBeUndefined();
		});
	});

	describe("areRangesEqual", () => {
		it("compares ranges correctly", () => {
			expect(areRangesEqual(undefined, undefined)).toBe(true);
			expect(
				areRangesEqual(
					{ from: new Date(2026, 9, 3) },
					{ from: new Date(2026, 9, 3) }
				)
			).toBe(true);
			expect(
				areRangesEqual(
					{ from: new Date(2026, 9, 3), to: new Date(2026, 9, 5) },
					{ from: new Date(2026, 9, 3), to: new Date(2026, 9, 5) }
				)
			).toBe(true);
			expect(
				areRangesEqual(
					{ from: new Date(2026, 9, 3), to: new Date(2026, 9, 5) },
					{ from: new Date(2026, 9, 3) }
				)
			).toBe(false);
		});
	});

	describe("isRangeConstraintSatisfied", () => {
		const constraints = {
			isDateUnavailable: (d: Date) => d.getDate() === 15,
			maxNights: 5,
			maxValue: new Date(2026, 9, 30),
			minNights: 2,
			minValue: new Date(2026, 9, 1),
		};

		it("validates partial range endpoint within min/max and availability", () => {
			expect(
				isRangeConstraintSatisfied({ from: new Date(2026, 9, 5) }, constraints)
			).toBe(true);
			expect(
				isRangeConstraintSatisfied({ from: new Date(2026, 8, 30) }, constraints)
			).toBe(false);
			expect(
				isRangeConstraintSatisfied({ from: new Date(2026, 9, 15) }, constraints)
			).toBe(false);
		});

		it("validates complete range min/max nights", () => {
			// 1 night: fails minNights (2)
			expect(
				isRangeConstraintSatisfied(
					{ from: new Date(2026, 9, 5), to: new Date(2026, 9, 6) },
					constraints
				)
			).toBe(false);
			// 3 nights: satisfies min/max nights
			expect(
				isRangeConstraintSatisfied(
					{ from: new Date(2026, 9, 5), to: new Date(2026, 9, 8) },
					constraints
				)
			).toBe(true);
			// 6 nights: fails maxNights (5)
			expect(
				isRangeConstraintSatisfied(
					{ from: new Date(2026, 9, 5), to: new Date(2026, 9, 11) },
					constraints
				)
			).toBe(false);
		});

		it("validates every day in complete range against isDateUnavailable", () => {
			// range 13 to 17 contains unavailable day 15
			expect(
				isRangeConstraintSatisfied(
					{ from: new Date(2026, 9, 13), to: new Date(2026, 9, 17) },
					constraints
				)
			).toBe(false);
			// range 16 to 19 has no unavailable days
			expect(
				isRangeConstraintSatisfied(
					{ from: new Date(2026, 9, 16), to: new Date(2026, 9, 19) },
					constraints
				)
			).toBe(true);
		});

		it("rejects reversed ranges where to is before from by local calendar day", () => {
			expect(
				isRangeConstraintSatisfied(
					{ from: new Date(2026, 9, 10), to: new Date(2026, 9, 5) },
					constraints
				)
			).toBe(false);
		});
	});

	describe("validateRangeInput", () => {
		it("handles required blank input as invalid, non-required as valid undefined", () => {
			expect(validateRangeInput("", { required: false })).toEqual({
				range: undefined,
				status: "valid",
			});
			expect(validateRangeInput("", { required: true })).toEqual({
				range: undefined,
				status: "invalid",
			});
		});

		it("parses partial dates but rejects them as incomplete form values", () => {
			expect(validateRangeInput("2026-10-05", { required: true })).toEqual({
				range: undefined,
				status: "invalid",
			});
		});
	});
});
