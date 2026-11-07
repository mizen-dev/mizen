"use client";

import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { checkboxGroupStyles } from "./checkbox-group.styles";

type BaseCheckboxGroupProps = ComponentPropsWithRef<typeof BaseCheckboxGroup>;

export type CheckboxGroupProps = Omit<
	BaseCheckboxGroupProps,
	"className" | "render" | "style"
>;

export function CheckboxGroup({
	children,
	ref: forwardedRef = undefined,
	...rest
}: CheckboxGroupProps) {
	return (
		<BaseCheckboxGroup
			{...rest}
			ref={forwardedRef}
			{...props(checkboxGroupStyles.root)}
		>
			{children}
		</BaseCheckboxGroup>
	);
}
