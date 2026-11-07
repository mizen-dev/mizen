import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import type {
	TimeInput,
	TimeInputProps,
} from "../../../packages/ui/src/components/time-input/time-input";

type IsExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type RejectsProp<T, K extends PropertyKey, V> = { [P in K]: V } extends T
	? false
	: true;

type TimeInputContract = [
	IsExact<ComponentProps<typeof TimeInput>, TimeInputProps>,
	IsExact<TimeInputProps["value"], string | undefined>,
	IsExact<TimeInputProps["defaultValue"], string | undefined>,
	IsExact<TimeInputProps["min"], string | undefined>,
	IsExact<TimeInputProps["max"], string | undefined>,
	RejectsProp<TimeInputProps, "className", string>,
	RejectsProp<TimeInputProps, "style", object>,
	RejectsProp<TimeInputProps, "render", object>,
	RejectsProp<TimeInputProps, "unstyled", true>,
	RejectsProp<TimeInputProps, "type", "text">,
	RejectsProp<TimeInputProps, "data-slot", string>,
];

const contractChecks: TimeInputContract = [
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

describe("TimeInput public contract", () => {
	it("keeps native time values and fixed input semantics", () => {
		expect(contractChecks.every(Boolean)).toBe(true);
	});
});
