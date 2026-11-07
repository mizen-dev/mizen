// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_variables: T, overrides: object): object =>
		overrides,
	defaultMarker: () => ({}),
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: (selector: string) => selector },
}));

import { getComponentDoc } from "../app/docs-registry";

const DATE_RANGE_PICKER_SPECIMEN_IMPORT_REGEX =
	/import\s*\{\s*DateRangePickerSpecimen\s*}\s*from\s*["']\.\/date-range-picker-specimen["'];?/;
const DATE_RANGE_PICKER_SPECIMEN_ENTRY_REGEX =
	/"date-range-picker":\s*DateRangePickerSpecimen/;

describe("DateRangePicker docs contract", () => {
	it("publishes preview metadata that matches the public component props", () => {
		const doc = getComponentDoc("date-range-picker");
		expect(doc).toBeDefined();
		if (!doc) {
			return;
		}

		expect(doc.name).toBe("Date range picker");
		expect(doc.category).toBe("Forms");
		expect(doc.status).toBe("stable");

		const api = new Map(doc.api.map((item) => [item.name, item]));
		const expectedProps = [
			"value",
			"defaultValue",
			"onValueChange",
			"disabled",
			"readOnly",
			"invalid",
			"required",
			"size",
			"minValue",
			"maxValue",
			"minNights",
			"maxNights",
			"isDateUnavailable",
			"presets",
			"locale",
			"dir",
			"weekStartsOn",
			"captionLayout",
			"startMonth",
			"endMonth",
			"name",
			"id",
			"aria-label",
			"aria-labelledby",
			"aria-describedby",
			"autoFocus",
			"DateRangePicker",
		];

		expect([...api.keys()].sort()).toEqual([...expectedProps].sort());
		expect(api.get("value")?.type).toBe("CalendarRangeValue | undefined");
		expect(api.get("presets")?.type).toBe(
			"readonly DateRangePreset[] | undefined"
		);
		expect(api.get("size")?.type).toBe('"default" | "lg" | "sm" | undefined');
		expect(api.get("minNights")?.defaultValue).toBe("0");
		expect(api.get("DateRangePicker")?.type).toBe("DateRangePickerProps");
	});

	it("exports DateRangePicker from the package root", async () => {
		const rootMod: Record<string, unknown> = await import(
			"../../../packages/ui/src/index"
		);
		const mod = await import(
			"../../../packages/ui/src/components/date-range-picker/date-range-picker"
		);

		expect(rootMod.DateRangePicker).toBe(mod.DateRangePicker);
	});

	it("registers the specimen for the generic component route", () => {
		const indexPath = resolve(
			import.meta.dirname,
			"../app/components/[slug]/specimens/index.ts"
		);
		const content = readFileSync(indexPath, "utf8");

		expect(content).toMatch(DATE_RANGE_PICKER_SPECIMEN_IMPORT_REGEX);
		expect(content).toMatch(DATE_RANGE_PICKER_SPECIMEN_ENTRY_REGEX);
	});

	it("demonstrates range defaults, presets, states, and native form submission", () => {
		const specimenPath = resolve(
			import.meta.dirname,
			"../app/components/[slug]/specimens/date-range-picker-specimen.tsx"
		);
		const content = readFileSync(specimenPath, "utf8");

		for (const testId of [
			"date-range-picker-default",
			"date-range-picker-controlled-value",
			"date-range-picker-presets",
			"date-range-picker-disabled",
			"date-range-picker-readonly",
			"date-range-picker-native-form",
			"date-range-picker-form-submit",
			"date-range-picker-form-status",
		]) {
			expect(content).toContain(`data-testid="${testId}"`);
		}

		expect(content).toContain('name="dateRange"');
		expect(content).toContain("required");
		expect(content).toContain('aria-live="polite"');
	});
});
