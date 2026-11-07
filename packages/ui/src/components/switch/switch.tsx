"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { switchStyles } from "./switch.styles";

type BaseSwitchProps = ComponentPropsWithRef<typeof BaseSwitch.Root>;

export type SwitchSize = "default" | "lg" | "sm";

export type SwitchProps = Omit<
	BaseSwitchProps,
	| "children"
	| "className"
	| "disabled"
	| "nativeButton"
	| "parent"
	| "ref"
	| "render"
	| "style"
> & {
	disabled?: boolean;
	invalid?: boolean;
	ref?: BaseSwitchProps["ref"];
	size?: SwitchSize;
};

const sizeStyles = {
	default: switchStyles.sizeDefault,
	lg: switchStyles.sizeLg,
	sm: switchStyles.sizeSm,
};

const thumbSizeStyles = {
	default: switchStyles.thumbDefault,
	lg: switchStyles.thumbLg,
	sm: switchStyles.thumbSm,
};

export function Switch({
	disabled = false,
	invalid = false,
	readOnly = false,
	ref: forwardedRef = undefined,
	size = "default",
	...rest
}: SwitchProps) {
	return (
		<BaseSwitch.Root
			{...rest}
			aria-invalid={invalid || undefined}
			data-slot="switch"
			disabled={disabled}
			readOnly={readOnly}
			ref={forwardedRef}
			{...props(
				switchStyles.base,
				sizeStyles[size],
				switchStyles.forcedColorsChecked
			)}
		>
			<BaseSwitch.Thumb
				data-slot="switch-thumb"
				{...props(switchStyles.thumb, thumbSizeStyles[size])}
			/>
		</BaseSwitch.Root>
	);
}
