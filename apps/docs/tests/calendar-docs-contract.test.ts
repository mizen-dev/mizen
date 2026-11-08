// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vite-plus/test";
import { getComponentDoc } from "../src/entities/documentation/model/docs-registry";

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

const CALENDAR_SPECIMEN_IMPORT_REGEX =
	/import\s*\{\s*CalendarSpecimen\s*\}\s*from\s*["']\.\/calendar-specimen["'];?/u;
const CALENDAR_SPECIMEN_ENTRY_REGEX = /calendar:\s*CalendarSpecimen/u;

describe("Calendar publishing, docs registry, specimen, and roadmap contract", () => {
	it("declares typed subpath in packages/ui/package.json", () => {
		const pkgPath = resolve(
			import.meta.dirname,
			"../../../packages/ui/package.json"
		);
		const pkg: {
			exports?: Record<string, { default?: string; types?: string }>;
		} = JSON.parse(readFileSync(pkgPath, "utf8"));

		expect(pkg.exports?.["./calendar"]).toEqual({
			default: "./dist/components/calendar/calendar.js",
			source: "./src/components/calendar/calendar.tsx",
			types: "./dist/components/calendar/calendar.d.ts",
		});
	});

	it("exports Calendar component from root packages/ui", async () => {
		const rootMod: Record<string, unknown> = await import(
			"../../../packages/ui/src"
		);
		const mod = await import(
			"../../../packages/ui/src/components/calendar/calendar"
		);

		expect(rootMod.Calendar).toBe(mod.Calendar);
	});

	it("publishes accurate Calendar API metadata in docs registry", () => {
		const doc = getComponentDoc("calendar");
		expect(doc).toBeDefined();
		if (!doc) {
			return;
		}

		expect(doc.name).toBe("Calendar");
		expect(doc.category).toBe("Forms");
		expect(doc.status).toBe("stable");

		const api = new Map(doc.api.map((item) => [item.name, item]));
		const expectedProps = [
			"mode",
			"value",
			"defaultValue",
			"onValueChange",
			"month",
			"defaultMonth",
			"onMonthChange",
			"locale",
			"dir",
			"weekStartsOn",
			"autoFocus",
			"required",
			"disabled",
			"readOnly",
			"invalid",
			"minValue",
			"maxValue",
			"isDateUnavailable",
			"minNights",
			"maxNights",
			"Calendar",
			"CalendarRangeValue",
		];

		for (const propName of expectedProps) {
			expect(api.has(propName)).toBe(true);
		}

		expect(api.get("mode")?.type).toBe('"single" | "range"');
		expect(api.get("minNights")?.type).toBe("number");
		expect(api.get("maxNights")?.type).toBe("number");
		expect(api.get("Calendar")?.type).toBe("CalendarProps");
		expect(api.get("CalendarRangeValue")?.type).toBe(
			"{ from: Date; to?: Date }"
		);
	});

	it("registers Calendar specimen in specimen registry index", () => {
		const indexPath = resolve(
			import.meta.dirname,
			"../src/entities/documentation/ui/specimens/index.ts"
		);
		const content = readFileSync(indexPath, "utf8");

		expect(content).toMatch(CALENDAR_SPECIMEN_IMPORT_REGEX);
		expect(content).toMatch(CALENDAR_SPECIMEN_ENTRY_REGEX);
	});
});
