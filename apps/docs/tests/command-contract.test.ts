import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

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

import type {
	CommandCollectionProps,
	CommandDialogBackdropProps,
	CommandDialogPopupProps,
	CommandDialogProps,
	CommandDialogTriggerProps,
	CommandDialogViewportProps,
	CommandEmptyProps,
	CommandFooterProps,
	CommandGroupLabelProps,
	CommandGroupProps,
	CommandInputProps,
	CommandItemProps,
	CommandListProps,
	CommandPanelProps,
	CommandProps,
	CommandSeparatorProps,
	CommandShortcutProps,
} from "@mizen/ui/command";

type AcceptsAll<T, K extends PropertyKey> = [K] extends [keyof T]
	? true
	: false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type Omitted = "className" | "data-slot" | "style";

type ClosedContract = [
	RejectsAll<CommandDialogProps, Omitted>,
	AcceptsAll<CommandDialogProps, "defaultOpen" | "onOpenChange" | "open">,
	RejectsAll<CommandDialogTriggerProps, Omitted>,
	AcceptsAll<CommandDialogTriggerProps, "ref" | "render">,
	RejectsAll<CommandDialogBackdropProps, Omitted>,
	AcceptsAll<CommandDialogBackdropProps, "ref" | "render">,
	RejectsAll<CommandDialogViewportProps, Omitted>,
	AcceptsAll<CommandDialogViewportProps, "ref" | "render">,
	RejectsAll<CommandDialogPopupProps, Omitted>,
	AcceptsAll<CommandDialogPopupProps, "portalProps" | "ref" | "render">,
	RejectsAll<CommandProps<string>, Omitted>,
	AcceptsAll<
		CommandProps<string>,
		"autoHighlight" | "inline" | "items" | "keepHighlight" | "open"
	>,
	RejectsAll<CommandInputProps, Omitted>,
	AcceptsAll<
		CommandInputProps,
		"autoFocus" | "disabled" | "placeholder" | "ref" | "render" | "startAddon"
	>,
	RejectsAll<CommandListProps, Omitted>,
	AcceptsAll<CommandListProps, "ref" | "render">,
	RejectsAll<CommandEmptyProps, Omitted>,
	AcceptsAll<CommandEmptyProps, "ref" | "render">,
	RejectsAll<CommandPanelProps, Omitted>,
	AcceptsAll<CommandPanelProps, "ref">,
	RejectsAll<CommandGroupProps, Omitted>,
	AcceptsAll<CommandGroupProps, "ref" | "render">,
	RejectsAll<CommandGroupLabelProps, Omitted>,
	AcceptsAll<CommandGroupLabelProps, "ref" | "render">,
	AcceptsAll<CommandCollectionProps, "children">,
	RejectsAll<CommandItemProps, Omitted>,
	AcceptsAll<CommandItemProps, "disabled" | "ref" | "render" | "value">,
	RejectsAll<CommandSeparatorProps, Omitted>,
	AcceptsAll<CommandSeparatorProps, "ref" | "render">,
	RejectsAll<CommandShortcutProps, Omitted>,
	AcceptsAll<CommandShortcutProps, "ref">,
	RejectsAll<CommandFooterProps, Omitted>,
	AcceptsAll<CommandFooterProps, "ref">,
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
];

describe("Command contract and exports", () => {
	it("enforces closed prop contracts and accepts expected fields at compile time", () => {
		expect(contractChecks.every((check) => check === true)).toBe(true);
	});

	it("exports exact 20 runtime keys and no unauthorized extras from root and subpath", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/command/command"
		);
		const rootMod = await import("../../../packages/ui/src/index");

		const required = [
			"Command",
			"CommandCollection",
			"CommandCreateHandle",
			"CommandDialog",
			"CommandDialogBackdrop",
			"CommandDialogPopup",
			"CommandDialogPortal",
			"CommandDialogPrimitive",
			"CommandDialogTrigger",
			"CommandDialogViewport",
			"CommandEmpty",
			"CommandFooter",
			"CommandGroup",
			"CommandGroupLabel",
			"CommandInput",
			"CommandItem",
			"CommandList",
			"CommandPanel",
			"CommandSeparator",
			"CommandShortcut",
		] as const;

		const modKeys = Object.keys(mod).sort();
		expect(modKeys).toHaveLength(20);
		expect(modKeys).toEqual([...required].sort());

		for (const key of required) {
			expect(mod[key]).toBeDefined();
			expect(rootMod[key]).toBe(mod[key]);
		}

		expect(mod.CommandDialog).toBe(mod.CommandDialogPrimitive.Root);
		expect(mod.CommandDialogPortal).toBe(mod.CommandDialogPrimitive.Portal);
		expect(mod.CommandCreateHandle).toBe(
			mod.CommandDialogPrimitive.createHandle
		);
		expect(mod.CommandDialogPrimitive).toBeDefined();
		expect(mod.CommandCollection).toBeDefined();

		const forbidden = [
			"CommandHeader",
			"CommandTitle",
			"CommandDescription",
			"CommandClose",
			"useCommandFilter",
		] as const;

		for (const key of forbidden) {
			expect(Reflect.get(rootMod, key)).toBeUndefined();
			expect(Reflect.get(mod, key)).toBeUndefined();
		}
	});

	it("validates package subpath manifest export for ./command", () => {
		const pkgPath = resolve(process.cwd(), "../../packages/ui/package.json");
		const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
		const subpath = pkg.exports["./command"];
		expect(subpath).toEqual({
			default: "./dist/components/command/command.js",
			source: "./src/components/command/command.tsx",
			types: "./dist/components/command/command.d.ts",
		});
	});
});
