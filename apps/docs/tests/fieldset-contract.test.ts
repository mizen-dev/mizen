// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
	FieldsetLegendProps,
	FieldsetProps,
} from "@mizen-labs/ui/fieldset";
import { describe, expect, it, vi } from "vitest";
import { FieldsetPrimitive } from "../../../packages/ui/src/components/fieldset/fieldset";

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
	RejectsAll<FieldsetProps, Omitted>,
	Accepts<FieldsetProps, "disabled">,
	Accepts<FieldsetProps, "render">,
	Accepts<FieldsetProps, "ref">,
	RejectsAll<FieldsetLegendProps, Omitted>,
	Accepts<FieldsetLegendProps, "render">,
	Accepts<FieldsetLegendProps, "ref">,
];

const contractChecks: ClosedContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];

describe("Fieldset contract and export manifest", () => {
	it("exports exact runtime members and matches primitive properties", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/fieldset/fieldset"
		);
		const rootMod = await import("../../../packages/ui/src/index");
		expect(Object.keys(mod).sort()).toEqual([
			"Fieldset",
			"FieldsetLegend",
			"FieldsetPrimitive",
		]);
		expect(FieldsetPrimitive).toBe(mod.FieldsetPrimitive);
		expect(mod.FieldsetPrimitive).toHaveProperty("Root");
		expect(mod.FieldsetPrimitive).toHaveProperty("Legend");
		expect(rootMod.Fieldset).toBe(mod.Fieldset);
		expect(rootMod.FieldsetLegend).toBe(mod.FieldsetLegend);
		expect(rootMod.FieldsetPrimitive).toBe(mod.FieldsetPrimitive);
		expect(contractChecks.every((c) => c === true)).toBe(true);
	});

	it("declares typed subpath in packages/ui/package.json", () => {
		const pkgPath = resolve(
			import.meta.dirname,
			"../../../packages/ui/package.json"
		);
		const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
		expect(pkg.exports["./fieldset"]).toEqual({
			default: "./dist/components/fieldset/fieldset.js",
			source: "./src/components/fieldset/fieldset.tsx",
			types: "./dist/components/fieldset/fieldset.d.ts",
		});
	});
});
