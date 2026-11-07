"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, InputHTMLAttributes } from "react";
import { useCallback, useState } from "react";
import {
	isBoundStringField,
	useBoundFieldContext,
} from "../field/field-context";
import { inputStyles } from "./input.styles";

type BaseInputProps = ComponentPropsWithRef<typeof BaseInput>;
export type InputSize = "default" | "lg" | "sm";

export type InputProps = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"className" | "onPointerEnter" | "onPointerLeave" | "size" | "style"
> & {
	disabled?: boolean;
	invalid?: boolean;
	onPointerEnter?: InputHTMLAttributes<HTMLInputElement>["onPointerEnter"];
	onPointerLeave?: InputHTMLAttributes<HTMLInputElement>["onPointerLeave"];
	ref?: BaseInputProps["ref"];
	render?: BaseInputProps["render"];
	size?: InputSize;
	unstyled?: boolean;
	onValueChange?: BaseInputProps["onValueChange"];
};

const sizeStyles = {
	default: inputStyles.sizeDefault,
	lg: inputStyles.sizeLg,
	sm: inputStyles.sizeSm,
};

const unstyledSizeStyles = {
	default: inputStyles.unstyledDefault,
	lg: inputStyles.unstyledLg,
	sm: inputStyles.unstyledSm,
};

function useInputBinding(control: InputProps) {
	const boundContext = useBoundFieldContext();
	const boundField = isBoundStringField(boundContext) ? boundContext : null;
	const userOnBlur = control.onBlur;
	const userOnValueChange = control.onValueChange;

	const handleBoundBlur = useCallback<NonNullable<InputProps["onBlur"]>>(
		(event) => {
			boundField?.handleBlur();
			userOnBlur?.(event);
		},
		[boundField, userOnBlur]
	);

	const handleBoundValueChange = useCallback<
		NonNullable<InputProps["onValueChange"]>
	>(
		(val, details) => {
			userOnValueChange?.(val, details);
			if (!details.isCanceled) {
				boundField?.handleChange(val);
			}
		},
		[boundField, userOnValueChange]
	);

	const isInvalid = boundField
		? boundField.state.meta.isTouched && !boundField.state.meta.isValid
		: control.invalid;

	return {
		"aria-invalid": isInvalid || undefined,
		...(boundField
			? {
					name: boundField.name,
					onBlur: handleBoundBlur,
					onValueChange: handleBoundValueChange,
					value: boundField.state.value,
				}
			: {}),
	};
}

function inputAppearance(size: InputSize, unstyled: boolean) {
	return unstyled
		? props(
				inputStyles.unstyled,
				unstyledSizeStyles[size],
				inputStyles.nativeFeatures
			)
		: props(inputStyles.input, sizeStyles[size], inputStyles.nativeFeatures);
}

export function Input({
	disabled = false,
	invalid = false,
	readOnly = false,
	ref: forwardedRef = undefined,
	size = "default",
	unstyled = false,
	// biome-ignore lint/complexity/noUselessUndefined: Keep this optional in Babel's generated JS surface.
	onPointerEnter = undefined,
	// biome-ignore lint/complexity/noUselessUndefined: Keep this optional in Babel's generated JS surface.
	onPointerLeave = undefined,
	...rest
}: InputProps) {
	const binding = useInputBinding({ ...rest, invalid });

	const [isHovered, setIsHovered] = useState(false);
	const handlePointerEnter = useCallback<
		NonNullable<InputProps["onPointerEnter"]>
	>(
		(event) => {
			if (!(disabled || readOnly)) {
				setIsHovered(true);
			}
			onPointerEnter?.(event);
		},
		[disabled, onPointerEnter, readOnly]
	);
	const handlePointerLeave = useCallback<
		NonNullable<InputProps["onPointerLeave"]>
	>(
		(event) => {
			setIsHovered(false);
			onPointerLeave?.(event);
		},
		[onPointerLeave]
	);

	return (
		<BaseInput
			{...rest}
			{...binding}
			data-hovered={isHovered ? "true" : undefined}
			data-size={size}
			disabled={disabled}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
			readOnly={readOnly}
			ref={forwardedRef}
			{...inputAppearance(size, unstyled)}
		/>
	);
}
