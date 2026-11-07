"use client";

import type { ReactElement } from "react";
import type { InputProps } from "../input/input";
import { Input } from "../input/input";

export type DateTimeInputProps = Omit<
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
	"data-slot"?: never;
	defaultValue?: string;
	max?: string;
	min?: string;
	render?: never;
	type?: never;
	unstyled?: never;
	value?: string;
};

export function DateTimeInput(props: DateTimeInputProps): ReactElement {
	return <Input {...props} data-slot="date-time-input" type="datetime-local" />;
}
