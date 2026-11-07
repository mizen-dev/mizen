import { describe, expect, it } from "vitest";
import {
	formatIsoDate,
	isDateConstraintSatisfied,
	parseIsoDate,
	validateDateInput,
} from "../../../packages/ui/src/components/date-picker/date-picker-date";

describe("date-picker-date utilities", () => {
	describe("formatIsoDate", () => {
		it("formats a local Date into YYYY-MM-DD string", () => {
			const date = new Date(2026, 9, 3); // Oct 3, 2026 local
			expect(formatIsoDate(date)).toBe("2026-10-03");
		});

		it("returns empty string when date is undefined", () => {
			expect(formatIsoDate(undefined)).toBe("");
		});

		it("pads single digit month and day", () => {
			const date = new Date(2026, 0, 5); // Jan 5, 2026
			expect(formatIsoDate(date)).toBe("2026-01-05");
		});
	});

	describe("parseIsoDate", () => {
		it("parses valid YYYY-MM-DD into local Date at 00:00:00", () => {
			const parsed = parseIsoDate("2026-10-03");
			expect(parsed).toBeInstanceOf(Date);
			expect(parsed?.getFullYear()).toBe(2026);
			expect(parsed?.getMonth()).toBe(9);
			expect(parsed?.getDate()).toBe(3);
			expect(parsed?.getHours()).toBe(0);
			expect(parsed?.getMinutes()).toBe(0);
			expect(parsed?.getSeconds()).toBe(0);
		});

		it("rejects impossible leap day 2025-02-29", () => {
			expect(parseIsoDate("2025-02-29")).toBeUndefined();
		});

		it("accepts valid leap day 2024-02-29", () => {
			const parsed = parseIsoDate("2024-02-29");
			expect(parsed).toBeInstanceOf(Date);
			expect(parsed?.getFullYear()).toBe(2024);
			expect(parsed?.getMonth()).toBe(1);
			expect(parsed?.getDate()).toBe(29);
		});

		it("rejects invalid month numbers like 2026-13-01 or 2026-00-10", () => {
			expect(parseIsoDate("2026-13-01")).toBeUndefined();
			expect(parseIsoDate("2026-00-10")).toBeUndefined();
		});

		it("rejects invalid day numbers like 2026-04-31", () => {
			expect(parseIsoDate("2026-04-31")).toBeUndefined();
		});

		it("rejects non-ISO formats or garbage text", () => {
			expect(parseIsoDate("10/03/2026")).toBeUndefined();
			expect(parseIsoDate("2026-1-3")).toBeUndefined();
			expect(parseIsoDate("hello")).toBeUndefined();
			expect(parseIsoDate("2026-10-03T12:00:00Z")).toBeUndefined();
		});

		it("returns undefined for empty/whitespace string", () => {
			expect(parseIsoDate("")).toBeUndefined();
			expect(parseIsoDate("   ")).toBeUndefined();
		});
	});

	describe("isDateConstraintSatisfied", () => {
		const testDate = new Date(2026, 9, 15);

		it("returns true when within minValue and maxValue", () => {
			const min = new Date(2026, 9, 1);
			const max = new Date(2026, 9, 31);
			expect(
				isDateConstraintSatisfied(testDate, { maxValue: max, minValue: min })
			).toBe(true);
		});

		it("returns false when before minValue (comparing start of day)", () => {
			const min = new Date(2026, 9, 16);
			expect(isDateConstraintSatisfied(testDate, { minValue: min })).toBe(
				false
			);
		});

		it("returns false when after maxValue (comparing start of day)", () => {
			const max = new Date(2026, 9, 14);
			expect(isDateConstraintSatisfied(testDate, { maxValue: max })).toBe(
				false
			);
		});

		it("returns false when isDateUnavailable returns true", () => {
			const isUnavailable = (d: Date) => d.getDate() === 15;
			expect(
				isDateConstraintSatisfied(testDate, {
					isDateUnavailable: isUnavailable,
				})
			).toBe(false);
		});
	});

	describe("validateDateInput", () => {
		it("handles blank input: valid undefined if not required, invalid if required", () => {
			expect(validateDateInput("", { required: false })).toEqual({
				date: undefined,
				status: "valid",
			});
			expect(validateDateInput("", { required: true })).toEqual({
				date: undefined,
				status: "invalid",
			});
		});

		it("returns invalid status when text is malformed or out of constraints", () => {
			expect(validateDateInput("invalid", {})).toEqual({
				date: undefined,
				status: "invalid",
			});
			const min = new Date(2026, 9, 20);
			expect(validateDateInput("2026-10-15", { minValue: min })).toEqual({
				date: undefined,
				status: "invalid",
			});
		});
	});
});
