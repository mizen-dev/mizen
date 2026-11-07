"use client";

import { Radio as BaseRadio, type RadioRootProps } from "@base-ui/react/radio";
import { props } from "@stylexjs/stylex";
import { checkboxStyles } from "../checkbox/checkbox.styles";
import { radioStyles } from "./radio.styles";

export type RadioSize = "default" | "lg" | "sm";

export type RadioProps<Value = unknown> = Omit<
	RadioRootProps<Value>,
	| "children"
	| "className"
	| "disabled"
	| "nativeButton"
	| "ref"
	| "render"
	| "style"
> & {
	disabled?: boolean;
	invalid?: boolean;
	ref?: RadioRootProps<Value>["ref"];
	size?: RadioSize;
};

const sizeStyles = {
	default: radioStyles.sizeDefault,
	lg: radioStyles.sizeLg,
	sm: radioStyles.sizeSm,
};

export function Radio<Value = unknown>({
	disabled = false,
	invalid = false,
	readOnly = false,
	ref: forwardedRef = undefined,
	size = "default",
	...rest
}: RadioProps<Value>) {
	return (
		<BaseRadio.Root
			{...rest}
			aria-invalid={invalid || undefined}
			data-slot="radio"
			disabled={disabled}
			readOnly={readOnly}
			ref={forwardedRef}
			{...props(
				checkboxStyles.base,
				checkboxStyles.forcedColorsSelected,
				radioStyles.root,
				sizeStyles[size]
			)}
		>
			<BaseRadio.Indicator
				data-slot="radio-indicator"
				{...props(radioStyles.indicator)}
			/>
		</BaseRadio.Root>
	);
}
