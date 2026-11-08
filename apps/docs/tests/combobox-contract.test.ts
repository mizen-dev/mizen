import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
	ComboboxChipProps,
	ComboboxChipRemoveProps,
	ComboboxChipsInputProps,
	ComboboxChipsProps,
	ComboboxClearProps,
	ComboboxEmptyProps,
	ComboboxGroupLabelProps,
	ComboboxGroupProps,
	ComboboxInputProps,
	ComboboxItemProps,
	ComboboxListProps,
	ComboboxPopupProps,
	ComboboxProps,
	ComboboxRowProps,
	ComboboxSeparatorProps,
	ComboboxStatusProps,
	ComboboxTriggerProps,
} from "@mizen-labs/ui/combobox";
import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_v: T, overrides: object): object =>
		overrides,
	defaultMarker: () => ({}),
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: (selector: string) => selector },
}));

type AcceptsAll<T, K extends PropertyKey> = [K] extends [keyof T]
	? true
	: false;
type AssertFalse<T extends false> = T;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type Omitted = "data-slot";

type NativeContract = [
	RejectsAll<ComboboxProps<string>, Omitted>,
	AcceptsAll<
		ComboboxProps<string>,
		"defaultValue" | "items" | "multiple" | "onOpenChange" | "open" | "value"
	>,
	RejectsAll<ComboboxInputProps, "className" | "style">,
	AcceptsAll<
		ComboboxInputProps,
		| "clearProps"
		| "ref"
		| "render"
		| "showClear"
		| "showTrigger"
		| "size"
		| "startAddon"
		| "triggerProps"
	>,
	RejectsAll<ComboboxChipsInputProps, "className" | "style">,
	AcceptsAll<ComboboxChipsInputProps, "ref" | "render" | "size">,
	RejectsAll<ComboboxTriggerProps, "className" | "style">,
	AcceptsAll<ComboboxTriggerProps, "ref" | "render">,
	RejectsAll<ComboboxClearProps, "className" | "style">,
	AcceptsAll<ComboboxClearProps, "ref" | "render">,
	RejectsAll<ComboboxPopupProps, "className" | "style">,
	AcceptsAll<
		ComboboxPopupProps,
		| "align"
		| "alignOffset"
		| "anchor"
		| "portalProps"
		| "ref"
		| "render"
		| "side"
		| "sideOffset"
	>,
	RejectsAll<ComboboxItemProps, "className" | "style">,
	AcceptsAll<ComboboxItemProps, "ref" | "render" | "value">,
	RejectsAll<ComboboxSeparatorProps, "className" | "style">,
	AcceptsAll<ComboboxSeparatorProps, "ref" | "render">,
	RejectsAll<ComboboxGroupProps, "className" | "style">,
	AcceptsAll<ComboboxGroupProps, "ref" | "render">,
	RejectsAll<ComboboxGroupLabelProps, "className" | "style">,
	AcceptsAll<ComboboxGroupLabelProps, "ref" | "render">,
	RejectsAll<ComboboxEmptyProps, "className" | "style">,
	AcceptsAll<ComboboxEmptyProps, "ref" | "render">,
	RejectsAll<ComboboxRowProps, "className" | "style">,
	AcceptsAll<ComboboxRowProps, "ref" | "render">,
	RejectsAll<ComboboxListProps, "className" | "style">,
	AcceptsAll<ComboboxListProps, "ref" | "render">,
	RejectsAll<ComboboxStatusProps, "className" | "style">,
	AcceptsAll<ComboboxStatusProps, "ref" | "render">,
	RejectsAll<ComboboxChipsProps, "className" | "style">,
	AcceptsAll<ComboboxChipsProps, "ref" | "render" | "startAddon">,
	RejectsAll<ComboboxChipProps, "className" | "style">,
	AcceptsAll<ComboboxChipProps, "ref" | "removeProps" | "render">,
	RejectsAll<ComboboxChipRemoveProps, "className" | "style">,
	AcceptsAll<ComboboxChipRemoveProps, "ref" | "render">,
];

const contractChecks: NativeContract = [
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

describe("Combobox contract and exports", () => {
	it("accepts native styling and fields at compile time", () => {
		expect(contractChecks.every((check) => check === true)).toBe(true);
	});

	it("proves AcceptsAll rejects missing keys non-distributively", () => {
		type MissingCheck = AcceptsAll<
			ComboboxInputProps,
			"size" | "definitelyNonexistentField"
		>;
		type ValidCheck = AcceptsAll<ComboboxInputProps, "size" | "showClear">;

		const isMissingValid: AssertFalse<MissingCheck> = false;
		const isValid: ValidCheck = true;

		expect(isMissingValid).toBe(false);
		expect(isValid).toBe(true);
	});

	it("exports exact 23 runtime keys and no unauthorized extras from root and subpath", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/combobox/combobox"
		);
		const rootMod = await import("../../../packages/ui/src/index");

		const required = [
			"Combobox",
			"ComboboxChip",
			"ComboboxChipRemove",
			"ComboboxChips",
			"ComboboxChipsInput",
			"ComboboxClear",
			"ComboboxCollection",
			"ComboboxContext",
			"ComboboxEmpty",
			"ComboboxGroup",
			"ComboboxGroupLabel",
			"ComboboxInput",
			"ComboboxItem",
			"ComboboxList",
			"ComboboxPopup",
			"ComboboxPrimitive",
			"ComboboxRow",
			"ComboboxSeparator",
			"ComboboxStatus",
			"ComboboxTrigger",
			"ComboboxValue",
			"createComboboxItems",
			"useComboboxFilter",
		] as const;

		const modKeys = Object.keys(mod).sort();
		expect(modKeys).toHaveLength(23);
		expect(modKeys).toEqual([...required].sort());

		for (const key of required) {
			expect(mod[key]).toBeDefined();
			expect(rootMod[key]).toBe(mod[key]);
		}

		// Token is its own component; Combobox must not re-export it.
		expect(Reflect.get(mod, "Token")).toBeUndefined();
		expect(rootMod.Token).toBeDefined();

		const forbidden = [
			"TokenRemove",
			"Tokenizer",
			"ComboboxLabel",
			"ComboboxInputGroup",
			"ComboboxItemIndicator",
			"ComboboxCreateHandle",
		] as const;

		for (const key of forbidden) {
			expect(Reflect.get(rootMod, key)).toBeUndefined();
			expect(Reflect.get(mod, key)).toBeUndefined();
		}
	});

	it("validates package subpath manifest export for ./combobox", () => {
		const pkgPath = resolve(process.cwd(), "../../packages/ui/package.json");
		const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
		expect(pkg.exports["./token"]).toEqual({
			default: "./dist/components/token/token.js",
			source: "./src/components/token/token.tsx",
			types: "./dist/components/token/token.d.ts",
		});
		expect(pkg.exports["./tokenizer"]).toBeUndefined();
		const subpath = pkg.exports["./combobox"];
		expect(subpath).toEqual({
			default: "./dist/components/combobox/combobox.js",
			source: "./src/components/combobox/combobox.tsx",
			types: "./dist/components/combobox/combobox.d.ts",
		});
		const typesPath = resolve(
			process.cwd(),
			"../../packages/ui",
			subpath.types
		);
		expect(existsSync(typesPath)).toBe(true);
		const defaultPath = resolve(
			process.cwd(),
			"../../packages/ui",
			subpath.default
		);
		expect(existsSync(defaultPath)).toBe(true);
	});

	it("preserves helper aliases matching Base UI", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/combobox/combobox"
		);
		expect(mod.ComboboxValue).toBe(mod.ComboboxPrimitive.Value);
		expect(mod.ComboboxCollection).toBe(mod.ComboboxPrimitive.Collection);
		expect(mod.createComboboxItems).toBe(mod.ComboboxPrimitive.createItems);
		expect(mod.useComboboxFilter).toBe(mod.ComboboxPrimitive.useFilter);
	});
});
