"use client";

import {
	RadioGroup as BaseRadioGroup,
	type RadioGroupProps as BaseRadioGroupProps,
} from "@base-ui/react/radio-group";
import { props } from "@stylexjs/stylex";
import { checkboxGroupStyles } from "../checkbox-group/checkbox-group.styles";

export type RadioGroupProps<Value = unknown> = Omit<
	BaseRadioGroupProps<Value>,
	"className" | "render" | "style"
>;

export function RadioGroup<Value = unknown>({
	children,
	ref: forwardedRef = undefined,
	...rest
}: RadioGroupProps<Value>) {
	return (
		<BaseRadioGroup
			{...rest}
			ref={forwardedRef}
			{...props(checkboxGroupStyles.root)}
		>
			{children}
		</BaseRadioGroup>
	);
}
