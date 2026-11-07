// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { FieldProps } from "../../../packages/ui/src/components/field/field";
import { Field } from "../../../packages/ui/src/components/field/field";
import {
	focusFirstInvalidControl,
	useForm,
} from "../../../packages/ui/src/form";
import {
	focusFirstInvalidControl as rootFocusFirstInvalidControl,
	useForm as rootUseForm,
} from "../../../packages/ui/src/index";

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

type IsAssignable<From, To> = [From] extends [To] ? true : false;

function useInferRealForm() {
	return useForm({
		defaultValues: {
			username: "",
		},
	});
}

type RealFormApi = ReturnType<typeof useInferRealForm>;
type RealFieldComponent = RealFormApi["Field"];
type RealFieldProps = Parameters<RealFieldComponent>[0];
type RealTanStackStringField = Parameters<RealFieldProps["children"]>[0];

interface StructuralNumberField {
	handleBlur: () => void;
	handleChange: (
		updater: number | null | ((prev: number | null) => number | null)
	) => void;
	name: string;
	state: {
		meta: {
			errors: readonly unknown[];
			isDirty: boolean;
			isTouched: boolean;
			isValid: boolean;
		};
		value: number | null;
	};
}

interface StructuralBooleanField {
	handleBlur: () => void;
	handleChange: (updater: boolean | ((prev: boolean) => boolean)) => void;
	name: string;
	state: {
		meta: {
			errors: readonly unknown[];
			isDirty: boolean;
			isTouched: boolean;
			isValid: boolean;
		};
		value: boolean;
	};
}

interface StructuralObjectField {
	handleBlur: () => void;
	handleChange: (
		updater:
			| { count: number }
			| ((prev: { count: number }) => { count: number })
	) => void;
	name: string;
	state: {
		meta: {
			errors: readonly unknown[];
			isDirty: boolean;
			isTouched: boolean;
			isValid: boolean;
		};
		value: { count: number };
	};
}

type TestRealStringAccepted = IsAssignable<
	{ field: RealTanStackStringField },
	FieldProps
>;
type TestNumberAccepted = IsAssignable<
	{ field: StructuralNumberField },
	FieldProps
>;
type TestBooleanRejected = IsAssignable<
	{ field: StructuralBooleanField },
	FieldProps
>;
type TestObjectRejected = IsAssignable<
	{ field: StructuralObjectField },
	FieldProps
>;
type TestCompetingNameRejected = IsAssignable<
	{ field: RealTanStackStringField; name: "username" },
	FieldProps
>;
type TestCompetingInvalidRejected = IsAssignable<
	{ field: RealTanStackStringField; invalid: true },
	FieldProps
>;
type TestUnboundAccepted = IsAssignable<
	{ invalid: boolean; name: "username" },
	FieldProps
>;

const typeContractResults = {
	booleanRejected: false as const,
	competingInvalidRejected: false as const,
	competingNameRejected: false as const,
	numberAccepted: true as const,
	objectRejected: false as const,
	realStringAccepted: true as const,
	unboundAccepted: true as const,
};

const verifiedRealStringAccepted: TestRealStringAccepted =
	typeContractResults.realStringAccepted;
const verifiedNumberAccepted: TestNumberAccepted =
	typeContractResults.numberAccepted;
const verifiedBooleanRejected: TestBooleanRejected =
	typeContractResults.booleanRejected;
const verifiedObjectRejected: TestObjectRejected =
	typeContractResults.objectRejected;
const verifiedCompetingNameRejected: TestCompetingNameRejected =
	typeContractResults.competingNameRejected;
const verifiedCompetingInvalidRejected: TestCompetingInvalidRejected =
	typeContractResults.competingInvalidRejected;
const verifiedUnboundAccepted: TestUnboundAccepted =
	typeContractResults.unboundAccepted;

describe("TanStack Form integration contract and exports", () => {
	it("declares typed subpath ./form in packages/ui/package.json", () => {
		const pkgPath = resolve(
			import.meta.dirname,
			"../../../packages/ui/package.json"
		);
		const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
		expect(pkg.exports["./form"]).toEqual({
			default: "./dist/form.js",
			source: "./src/form.ts",
			types: "./dist/form.d.ts",
		});
	});

	it("exports useForm and focusFirstInvalidControl from root packages/ui", () => {
		expect(typeof rootUseForm).toBe("function");
		expect(typeof rootFocusFirstInvalidControl).toBe("function");
	});

	it("exports useForm and focusFirstInvalidControl from @mizen-labs/ui/form subpath", () => {
		expect(typeof useForm).toBe("function");
		expect(typeof focusFirstInvalidControl).toBe("function");
	});

	it("implements focusFirstInvalidControl handling null and undefined inputs safely", () => {
		expect(focusFirstInvalidControl(null)).toBe(false);
		expect(focusFirstInvalidControl(undefined)).toBe(false);
	});

	it("verifies FieldProps type contract for real string field, structural non-strings, and unbound fields", () => {
		expect(verifiedRealStringAccepted).toBe(true);
		expect(verifiedNumberAccepted).toBe(true);
		expect(verifiedBooleanRejected).toBe(false);
		expect(verifiedObjectRejected).toBe(false);
		expect(verifiedCompetingNameRejected).toBe(false);
		expect(verifiedCompetingInvalidRejected).toBe(false);
		expect(verifiedUnboundAccepted).toBe(true);
		expect(typeof Field).toBe("function");
	});
});
