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

const DATE_PICKER_SPECIMEN_IMPORT_REGEX =
	/import\s*\{\s*DatePickerSpecimen\s*\}\s*from\s*["']\.\/date-picker-specimen["'];?/u;
const DATE_PICKER_SPECIMEN_ENTRY_REGEX = /"date-picker":\s*DatePickerSpecimen/u;

describe("DatePicker publishing, docs registry, specimen, and roadmap contract", () => {
	it("declares typed subpath in packages/ui/package.json", () => {
		const pkgPath = resolve(
			import.meta.dirname,
			"../../../packages/ui/package.json"
		);
		const pkg: {
			exports?: Record<string, { default?: string; types?: string }>;
		} = JSON.parse(readFileSync(pkgPath, "utf8"));

		expect(pkg.exports?.["./date-picker"]).toEqual({
			default: "./dist/components/date-picker/date-picker.js",
			source: "./src/components/date-picker/date-picker.tsx",
			types: "./dist/components/date-picker/date-picker.d.ts",
		});
	});

	it("exports DatePicker component from root packages/ui", async () => {
		const rootMod: Record<string, unknown> = await import(
			"../../../packages/ui/src"
		);
		const mod = await import(
			"../../../packages/ui/src/components/date-picker/date-picker"
		);

		expect(rootMod.DatePicker).toBe(mod.DatePicker);
	});

	it("publishes accurate DatePicker API metadata in docs registry", () => {
		const doc = getComponentDoc("date-picker");
		expect(doc).toBeDefined();
		if (!doc) {
			return;
		}

		expect(doc.name).toBe("Date picker");
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
			"isDateUnavailable",
			"locale",
			"dir",
			"weekStartsOn",
			"name",
			"id",
			"aria-label",
			"aria-labelledby",
			"aria-describedby",
			"autoFocus",
			"DatePicker",
		];

		for (const propName of expectedProps) {
			expect(api.has(propName)).toBe(true);
		}

		expect(api.get("size")?.type).toBe('"default" | "lg" | "sm"');
		expect(api.get("DatePicker")?.type).toBe("DatePickerProps");
	});

	it("registers DatePicker specimen in specimen registry index", () => {
		const indexPath = resolve(
			import.meta.dirname,
			"../src/entities/documentation/ui/specimens/index.ts"
		);
		const content = readFileSync(indexPath, "utf8");

		expect(content).toMatch(DATE_PICKER_SPECIMEN_IMPORT_REGEX);
		expect(content).toMatch(DATE_PICKER_SPECIMEN_ENTRY_REGEX);
	});

	it("declares specimen testids for uncontrolled, controlled, bounded, disabled, readOnly, and invalid states", () => {
		const specimenPath = resolve(
			import.meta.dirname,
			"../src/entities/documentation/ui/specimens/date-picker-specimen.tsx"
		);
		const content = readFileSync(specimenPath, "utf8");

		expect(content).toContain('data-testid="date-picker-uncontrolled"');
		expect(content).toContain('data-testid="date-picker-controlled"');
		expect(content).toContain('data-testid="date-picker-bounded"');
		expect(content).toContain('data-testid="date-picker-disabled"');
		expect(content).toContain('data-testid="date-picker-readonly"');
		expect(content).toContain('data-testid="date-picker-invalid"');
	});
});
