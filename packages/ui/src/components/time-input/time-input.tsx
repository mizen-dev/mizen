"use client";

import type { ReactElement } from "react";
import type { InputProps } from "../input/input";
import { Input } from "../input/input";

export type TimeInputProps = Omit<
	InputProps,
	| "data-slot"
	| "defaultValue"
	| "max"
	| "min"
	| "render"
	| "type"
	| "unstyled"
	| "value"
> & {
	defaultValue?: string;
	"data-slot"?: never;
	max?: string;
	min?: string;
	render?: never;
	type?: never;
	unstyled?: never;
	value?: string;
};

export function TimeInput(timeInputProps: TimeInputProps): ReactElement {
	return <Input {...timeInputProps} data-slot="time-input" type="time" />;
}
