// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import type {
	Slider,
	SliderControlProps,
	SliderIndicatorProps,
	SliderLabelProps,
	SliderProps,
	SliderSize,
	SliderThumbProps,
	SliderTrackProps,
	SliderValueProps,
} from "../../../packages/ui/src/components/slider/slider";
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

type Omitted = "className" | "data-slot" | "readOnly" | "style";

type ClosedContract = [
	RejectsAll<SliderProps, "data-slot" | "readOnly">,
	RejectsAll<SliderProps, "readOnly">,
	Accepts<SliderProps, "ref">,
	Accepts<SliderProps, "render">,
	Accepts<SliderProps, "size">,
	Accepts<SliderProps, "value">,
	Accepts<SliderProps, "defaultValue">,
	Accepts<SliderProps, "onValueChange">,
	Accepts<SliderProps, "onValueCommitted">,
	Accepts<SliderProps, "min">,
	Accepts<SliderProps, "max">,
	Accepts<SliderProps, "step">,
	Accepts<SliderProps, "disabled">,
	Accepts<SliderProps, "orientation">,
	Accepts<SliderProps, "getAriaLabel">,
	RejectsAll<SliderControlProps, Omitted>,
	Accepts<SliderControlProps, "ref">,
	Accepts<SliderControlProps, "render">,
	Accepts<SliderControlProps, "children">,
	RejectsAll<SliderTrackProps, Omitted>,
	Accepts<SliderTrackProps, "ref">,
	Accepts<SliderTrackProps, "render">,
	Accepts<SliderTrackProps, "children">,
	RejectsAll<SliderIndicatorProps, Omitted>,
	Accepts<SliderIndicatorProps, "ref">,
	Accepts<SliderIndicatorProps, "render">,
	Accepts<SliderIndicatorProps, "children">,
	RejectsAll<SliderThumbProps, Omitted>,
	Accepts<SliderThumbProps, "ref">,
	Accepts<SliderThumbProps, "render">,
	Accepts<SliderThumbProps, "children">,
	Accepts<SliderThumbProps, "disabled">,
	Accepts<SliderThumbProps, "index">,
	RejectsAll<SliderLabelProps, Omitted>,
	Accepts<SliderLabelProps, "ref">,
	Accepts<SliderLabelProps, "render">,
	Accepts<SliderLabelProps, "children">,
	RejectsAll<SliderValueProps, "data-slot" | "readOnly">,
	Accepts<SliderValueProps, "ref">,
	Accepts<SliderValueProps, "render">,
	Accepts<SliderValueProps, "children">,
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

type SliderComponentProps = ComponentProps<typeof Slider>;
const scalarComponentProps: SliderComponentProps = {
	defaultValue: 10,
	value: 20,
};

type OnValueChangeParam<T> = T extends {
	onValueChange?: (value: infer V, ...args: never[]) => void;
}
	? V
	: never;

type IsExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;

type GenericChecks = [
	IsExact<OnValueChangeParam<SliderProps>, number>,
	IsExact<
		OnValueChangeParam<SliderProps<readonly [number, number]>>,
		readonly [number, number]
	>,
	IsExact<
		OnValueChangeParam<SliderProps<readonly number[]>>,
		readonly number[]
	>,
];

const genericChecks: GenericChecks = [true, true, true];

const scalarCallback: NonNullable<SliderProps["onValueChange"]> = (value) => {
	const current: number = value;
	expect(current).toBeDefined();
};

const tupleCallback: NonNullable<
	SliderProps<readonly [number, number]>["onValueChange"]
> = (value) => {
	const current: readonly [number, number] = value;
	expect(current).toBeDefined();
};

const arrayCallback: NonNullable<
	SliderProps<readonly number[]>["onValueChange"]
> = (value) => {
	const current: readonly number[] = value;
	expect(current).toBeDefined();
};

describe("Slider contract and export manifest", () => {
	it("exports exact runtime members and primitive namespace", async () => {
		expect(scalarCallback).toBeDefined();
		expect(tupleCallback).toBeDefined();
		expect(arrayCallback).toBeDefined();
		expect(scalarComponentProps).toBeDefined();

		const mod = await import(
			"../../../packages/ui/src/components/slider/slider"
		);

		expect(Object.keys(mod).sort()).toEqual([
			"Slider",
			"SliderControl",
			"SliderIndicator",
			"SliderLabel",
			"SliderPrimitive",
			"SliderThumb",
			"SliderTrack",
			"SliderValue",
		]);

		expect(typeof mod.SliderPrimitive.Root).toBe("object");
		expect(typeof mod.SliderPrimitive.Control).toBe("object");
		expect(typeof mod.SliderPrimitive.Track).toBe("object");
		expect(typeof mod.SliderPrimitive.Indicator).toBe("object");
		expect(typeof mod.SliderPrimitive.Thumb).toBe("object");
		expect(typeof mod.SliderPrimitive.Label).toBe("object");
		expect(typeof mod.SliderPrimitive.Value).toBe("object");
		expect(contractChecks.every((c) => c === true)).toBe(true);
		expect(genericChecks.every((c) => c === true)).toBe(true);

		const sizeVariants: readonly SliderSize[] = ["sm", "default", "lg"];
		expect(sizeVariants).toHaveLength(3);
	});

	it("declares typed subpath in packages/ui/package.json", () => {
		const pkgPath = resolve(
			import.meta.dirname,
			"../../../packages/ui/package.json"
		);
		const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
		expect(pkg.exports["./slider"]).toEqual({
			default: "./dist/components/slider/slider.js",
			source: "./src/components/slider/slider.tsx",
			types: "./dist/components/slider/slider.d.ts",
		});
	});

	it("exports Slider components and primitives from root packages/ui", async () => {
		const rootMod = await import("../../../packages/ui/src/index");
		const mod = await import(
			"../../../packages/ui/src/components/slider/slider"
		);

		expect(rootMod.Slider).toBe(mod.Slider);
		expect(rootMod.SliderControl).toBe(mod.SliderControl);
		expect(rootMod.SliderIndicator).toBe(mod.SliderIndicator);
		expect(rootMod.SliderLabel).toBe(mod.SliderLabel);
		expect(rootMod.SliderPrimitive).toBe(mod.SliderPrimitive);
		expect(rootMod.SliderThumb).toBe(mod.SliderThumb);
		expect(rootMod.SliderTrack).toBe(mod.SliderTrack);
		expect(rootMod.SliderValue).toBe(mod.SliderValue);
	});

	it("publishes accurate Slider API metadata in docs registry", () => {
		const doc = getComponentDoc("slider");
		expect(doc).toBeDefined();

		const names = new Set(doc ? doc.api.map((item) => item.name) : []);
		const required = [
			"value",
			"defaultValue",
			"onValueChange",
			"onValueCommitted",
			"getAriaLabel",
			"Slider",
			"SliderControl",
			"SliderTrack",
			"SliderIndicator",
			"SliderThumb",
			"SliderLabel",
			"SliderValue",
			"SliderPrimitive",
		];

		for (const name of required) {
			expect(names.has(name)).toBe(true);
		}
	});
});
