// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import type {
	OTPField,
	OTPFieldInputProps,
	OTPFieldProps,
	OTPFieldSeparatorProps,
	OTPFieldSize,
} from "../../../packages/ui/src/components/otp-field/otp-field";
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
type IsExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type IsRequired<T, K extends PropertyKey> = K extends keyof T
	? Record<string, never> extends Pick<T, K>
		? false
		: true
	: false;

type Omitted = "className" | "data-slot" | "style";

type ClosedContract = [
	RejectsAll<OTPFieldProps, Omitted>,
	IsRequired<OTPFieldProps, "length">,
	Accepts<OTPFieldProps, "length">,
	IsExact<OTPFieldProps["length"], number>,
	Accepts<OTPFieldProps, "size">,
	Accepts<OTPFieldProps, "ref">,
	Accepts<OTPFieldProps, "children">,
	RejectsAll<OTPFieldInputProps, Omitted>,
	Accepts<OTPFieldInputProps, "ref">,
	RejectsAll<OTPFieldSeparatorProps, Omitted>,
	Accepts<OTPFieldSeparatorProps, "ref">,
	Accepts<OTPFieldSeparatorProps, "children">,
	IsExact<OTPFieldSize, "default" | "sm" | "lg">,
	IsRequired<ComponentProps<typeof OTPField>, "length">,
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
];

describe("OTPField contract and export manifest", () => {
	it("exports exact runtime members and primitive namespace", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/otp-field/otp-field"
		);

		expect(Object.keys(mod).sort()).toEqual([
			"OTPField",
			"OTPFieldInput",
			"OTPFieldPrimitive",
			"OTPFieldSeparator",
		]);

		expect(typeof mod.OTPFieldPrimitive).toBe("object");
		expect(contractChecks.every((c) => c === true)).toBe(true);

		const sizeVariants: readonly OTPFieldSize[] = ["default", "sm", "lg"];
		expect(sizeVariants).toHaveLength(3);
	});

	it("declares typed subpath in packages/ui/package.json", () => {
		const pkgPath = resolve(
			import.meta.dirname,
			"../../../packages/ui/package.json"
		);
		const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
		expect(pkg.exports["./otp-field"]).toEqual({
			default: "./dist/components/otp-field/otp-field.js",
			source: "./src/components/otp-field/otp-field.tsx",
			types: "./dist/components/otp-field/otp-field.d.ts",
		});
	});

	it("exports OTPField components and primitives from root packages/ui", async () => {
		const rootMod = await import("../../../packages/ui/src/index");
		const mod = await import(
			"../../../packages/ui/src/components/otp-field/otp-field"
		);

		expect(rootMod.OTPField).toBe(mod.OTPField);
		expect(rootMod.OTPFieldInput).toBe(mod.OTPFieldInput);
		expect(rootMod.OTPFieldSeparator).toBe(mod.OTPFieldSeparator);
		expect(rootMod.OTPFieldPrimitive).toBe(mod.OTPFieldPrimitive);
	});

	it("publishes accurate OTPField API metadata in docs registry", () => {
		const doc = getComponentDoc("otp-field");
		expect(doc).toBeDefined();
		if (!doc) {
			return;
		}

		expect(doc.name).toBe("OTP Field");
		expect(doc.category).toBe("Forms");
		expect(doc.status).toBe("stable");

		const api = new Map(doc.api.map((item) => [item.name, item]));

		expect(api.get("length")).toMatchObject({
			defaultValue: "—",
			type: "number",
		});
		expect(api.get("size")).toMatchObject({
			defaultValue: '"default"',
			type: '"default" | "sm" | "lg"',
		});
		expect(api.get("mask")).toMatchObject({
			defaultValue: "false",
			type: "boolean",
		});
		expect(api.get("validationType")).toMatchObject({
			defaultValue: '"numeric"',
			type: '"numeric" | "alpha" | "alphanumeric" | "none"',
		});
		expect(api.get("onValueChange")).toMatchObject({
			defaultValue: "—",
			type: "(value: string, eventDetails: OTPFieldPrimitive.Root.ChangeEventDetails) => void",
		});
		expect(api.get("OTPField")).toMatchObject({
			defaultValue: '"div"',
			type: "OTPFieldProps",
		});
		expect(api.get("OTPFieldInput")).toMatchObject({
			defaultValue: '"input"',
			type: "OTPFieldInputProps",
		});
		expect(api.get("OTPFieldSeparator")).toMatchObject({
			defaultValue: '"div"',
			type: "OTPFieldSeparatorProps",
		});
		expect(api.get("OTPFieldPrimitive")).toMatchObject({
			defaultValue: "—",
			type: "typeof BaseOTPField",
		});
	});
});
