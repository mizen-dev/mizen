// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
	InputGroupAddonAlign,
	InputGroupAddonProps,
	InputGroupInputProps,
	InputGroupProps,
	InputGroupTextareaProps,
	InputGroupTextProps,
} from "@mizen/ui/input-group";
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

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;

type Omitted = "data-slot";

type CompatibleContract = [
	RejectsAll<InputGroupProps, Omitted>,
	Accepts<InputGroupProps, "role">,
	Accepts<InputGroupProps, "ref">,
	Accepts<InputGroupProps, "children">,
	RejectsAll<InputGroupAddonProps, Omitted>,
	Accepts<InputGroupAddonProps, "align">,
	Accepts<InputGroupAddonProps, "ref">,
	Accepts<InputGroupAddonProps, "onMouseDown">,
	RejectsAll<InputGroupTextProps, Omitted>,
	Accepts<InputGroupTextProps, "ref">,
	RejectsAll<InputGroupInputProps, Omitted>,
	Accepts<InputGroupInputProps, "ref">,
	Accepts<InputGroupInputProps, "size">,
	Accepts<InputGroupInputProps, "disabled">,
	Accepts<InputGroupInputProps, "invalid">,
	RejectsAll<InputGroupTextareaProps, Omitted>,
	Accepts<InputGroupTextareaProps, "ref">,
	Accepts<InputGroupTextareaProps, "size">,
	Accepts<InputGroupTextareaProps, "disabled">,
	Accepts<InputGroupTextareaProps, "invalid">,
];

const contractChecks: CompatibleContract = [
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

describe("InputGroup contract and export manifest", () => {
	it("exports exact runtime members and types", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/input-group/input-group"
		);
		const rootMod = await import("../../../packages/ui/src/index");

		expect(Object.keys(mod).sort()).toEqual([
			"InputGroup",
			"InputGroupAddon",
			"InputGroupInput",
			"InputGroupText",
			"InputGroupTextarea",
		]);

		expect(rootMod.InputGroup).toBe(mod.InputGroup);
		expect(rootMod.InputGroupAddon).toBe(mod.InputGroupAddon);
		expect(rootMod.InputGroupInput).toBe(mod.InputGroupInput);
		expect(rootMod.InputGroupText).toBe(mod.InputGroupText);
		expect(rootMod.InputGroupTextarea).toBe(mod.InputGroupTextarea);

		expect(contractChecks.every((c) => c === true)).toBe(true);

		const alignValues: readonly InputGroupAddonAlign[] = [
			"inline-start",
			"inline-end",
			"block-start",
			"block-end",
		];
		expect(alignValues).toHaveLength(4);
	});

	it("declares typed subpath in packages/ui/package.json", () => {
		const pkgPath = resolve(
			import.meta.dirname,
			"../../../packages/ui/package.json"
		);
		const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
		expect(pkg.exports["./input-group"]).toEqual({
			default: "./dist/components/input-group/input-group.js",
			source: "./src/components/input-group/input-group.tsx",
			types: "./dist/components/input-group/input-group.d.ts",
		});
	});
});
