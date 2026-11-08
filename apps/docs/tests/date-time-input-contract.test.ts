import type { ComponentProps } from "react";
import { describe, expect, it } from "vite-plus/test";
import type {
	DateTimeInput,
	DateTimeInputProps,
} from "../../../packages/ui/src/components/date-time-input/date-time-input";

type IsExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type RejectsProp<T, K extends PropertyKey, V> = { [P in K]: V } extends T
	? false
	: true;

type DateTimeInputContract = [
	IsExact<ComponentProps<typeof DateTimeInput>, DateTimeInputProps>,
	IsExact<DateTimeInputProps["value"], string | undefined>,
	IsExact<DateTimeInputProps["defaultValue"], string | undefined>,
	IsExact<DateTimeInputProps["min"], string | undefined>,
	IsExact<DateTimeInputProps["max"], string | undefined>,
	RejectsProp<DateTimeInputProps, "className", string>,
	RejectsProp<DateTimeInputProps, "style", object>,
	RejectsProp<DateTimeInputProps, "render", object>,
	RejectsProp<DateTimeInputProps, "unstyled", true>,
	RejectsProp<DateTimeInputProps, "type", "text">,
	RejectsProp<DateTimeInputProps, "data-slot", string>,
];

const contractChecks: DateTimeInputContract = [
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

describe("DateTimeInput public contract", () => {
	it("keeps native date-time values and fixed input semantics", () => {
		expect(contractChecks.every(Boolean)).toBe(true);
	});
});
