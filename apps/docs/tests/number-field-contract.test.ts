// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vite-plus/test";
import type {
	NumberFieldDecrementProps,
	NumberFieldGroupProps,
	NumberFieldIncrementProps,
	NumberFieldInputProps,
	NumberFieldProps,
	NumberFieldScrubAreaProps,
	NumberFieldSize,
} from "../../../packages/ui/src/components/number-field/number-field";
import { getComponentDoc } from "../app/docs-registry";

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

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;

type Omitted = "className" | "data-slot" | "style";

type ClosedContract = [
	RejectsAll<NumberFieldProps, Omitted>,
	Accepts<NumberFieldProps, "ref">,
	Accepts<NumberFieldProps, "size">,
	Accepts<NumberFieldProps, "value">,
	Accepts<NumberFieldProps, "defaultValue">,
	Accepts<NumberFieldProps, "onValueChange">,
	Accepts<NumberFieldProps, "min">,
	Accepts<NumberFieldProps, "max">,
	Accepts<NumberFieldProps, "step">,
	Accepts<NumberFieldProps, "disabled">,
	Accepts<NumberFieldProps, "readOnly">,
	RejectsAll<NumberFieldGroupProps, Omitted>,
	Accepts<NumberFieldGroupProps, "ref">,
	Accepts<NumberFieldGroupProps, "children">,
	RejectsAll<NumberFieldInputProps, Omitted>,
	Accepts<NumberFieldInputProps, "ref">,
	Accepts<NumberFieldInputProps, "onBlur">,
	RejectsAll<NumberFieldIncrementProps, Omitted>,
	RejectsAll<NumberFieldIncrementProps, "tabIndex">,
	Accepts<NumberFieldIncrementProps, "ref">,
	Accepts<NumberFieldIncrementProps, "children">,
	RejectsAll<NumberFieldDecrementProps, Omitted>,
	RejectsAll<NumberFieldDecrementProps, "tabIndex">,
	Accepts<NumberFieldDecrementProps, "ref">,
	Accepts<NumberFieldDecrementProps, "children">,
	RejectsAll<NumberFieldScrubAreaProps, Omitted>,
	Accepts<NumberFieldScrubAreaProps, "ref">,
	Accepts<NumberFieldScrubAreaProps, "children">,
	Accepts<NumberFieldScrubAreaProps, "direction">,
	Accepts<NumberFieldScrubAreaProps, "label">,
];

const contractChecks: ClosedContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];

describe("NumberField contract and export manifest", () => {
	it("exports exact runtime members and primitive namespace", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/number-field/number-field"
		);

		expect(Object.keys(mod).sort()).toEqual([
			"NumberField",
			"NumberFieldDecrement",
			"NumberFieldGroup",
			"NumberFieldIncrement",
			"NumberFieldInput",
			"NumberFieldPrimitive",
			"NumberFieldScrubArea",
		]);

		expect(typeof mod.NumberFieldPrimitive.Root).toBe("object");
		expect(typeof mod.NumberFieldPrimitive.Group).toBe("object");
		expect(typeof mod.NumberFieldPrimitive.Input).toBe("object");
		expect(typeof mod.NumberFieldPrimitive.Increment).toBe("object");
		expect(typeof mod.NumberFieldPrimitive.Decrement).toBe("object");
		expect(typeof mod.NumberFieldPrimitive.ScrubArea).toBe("object");
		expect(typeof mod.NumberFieldPrimitive.ScrubAreaCursor).toBe("object");
		expect(contractChecks.every((c) => c === true)).toBe(true);

		const sizeVariants: readonly NumberFieldSize[] = ["default", "sm", "lg"];
		expect(sizeVariants).toHaveLength(3);
	});

	it("declares typed subpath in packages/ui/package.json", () => {
		const pkgPath = resolve(
			import.meta.dirname,
			"../../../packages/ui/package.json"
		);
		const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
		expect(pkg.exports["./number-field"]).toEqual({
			default: "./dist/components/number-field/number-field.js",
			source: "./src/components/number-field/number-field.tsx",
			types: "./dist/components/number-field/number-field.d.ts",
		});
	});

	it("exports NumberField components and primitives from root packages/ui", async () => {
		const rootMod = await import("../../../packages/ui/src/index");
		const mod = await import(
			"../../../packages/ui/src/components/number-field/number-field"
		);

		expect(rootMod.NumberField).toBe(mod.NumberField);
		expect(rootMod.NumberFieldGroup).toBe(mod.NumberFieldGroup);
		expect(rootMod.NumberFieldInput).toBe(mod.NumberFieldInput);
		expect(rootMod.NumberFieldIncrement).toBe(mod.NumberFieldIncrement);
		expect(rootMod.NumberFieldDecrement).toBe(mod.NumberFieldDecrement);
		expect(rootMod.NumberFieldScrubArea).toBe(mod.NumberFieldScrubArea);
		expect(rootMod.NumberFieldPrimitive).toBe(mod.NumberFieldPrimitive);
	});

	it("publishes accurate NumberField API metadata in docs registry", () => {
		const doc = getComponentDoc("number-field");
		expect(doc).toBeDefined();

		const api = Object.fromEntries(
			doc?.api.map((item) => [item.name, item]) ?? []
		);

		expect(api.defaultValue?.type).toBe("number");
		expect(api.step?.type).toBe('number | "any"');
		expect(api.locale?.type).toBe("Intl.LocalesArgument");
		expect(api.onValueChange?.type).toBe(
			"(value: number | null, eventDetails: NumberFieldPrimitive.Root.ChangeEventDetails) => void"
		);
	});
});
