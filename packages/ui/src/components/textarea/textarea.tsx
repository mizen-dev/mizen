"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { useCallback, useState } from "react";
import { assignRef } from "../../ref-utils";
import { fieldStyles } from "../field/field.styles";
import {
	isBoundStringField,
	useBoundFieldContext,
} from "../field/field-context";
import { textareaStyles } from "./textarea.styles";

type NativeTextareaProps = ComponentPropsWithRef<"textarea">;

export type TextareaSize = "default" | "lg" | "sm";

export type TextareaProps = Omit<
	NativeTextareaProps,
	"className" | "onPointerEnter" | "onPointerLeave" | "size" | "style"
> & {
	invalid?: boolean;
	onPointerEnter?: NativeTextareaProps["onPointerEnter"];
	onPointerLeave?: NativeTextareaProps["onPointerLeave"];
	ref?: NativeTextareaProps["ref"];
	size?: TextareaSize;
	unstyled?: boolean;
};

const sizeStyles = {
	default: textareaStyles.default,
	lg: textareaStyles.lg,
	sm: textareaStyles.sm,
};

const unstyledSizeStyles = {
	default: textareaStyles.unstyledDefault,
	lg: textareaStyles.unstyledLg,
	sm: textareaStyles.unstyledSm,
};

function useTextareaBinding(control: TextareaProps) {
	const boundContext = useBoundFieldContext();
	const boundField = isBoundStringField(boundContext) ? boundContext : null;
	const userOnBlur = control.onBlur;
	const userOnChange = control.onChange;

	const handleBoundBlur = useCallback<NonNullable<TextareaProps["onBlur"]>>(
		(event) => {
			boundField?.handleBlur();
			userOnBlur?.(event);
		},
		[boundField, userOnBlur]
	);

	const handleBoundChange = useCallback<NonNullable<TextareaProps["onChange"]>>(
		(event) => {
			boundField?.handleChange(event.currentTarget.value);
			userOnChange?.(event);
		},
		[boundField, userOnChange]
	);

	const isInvalid = boundField
		? boundField.state.meta.isTouched && !boundField.state.meta.isValid
		: control.invalid;

	return {
		"aria-invalid": isInvalid || undefined,
		name: boundField ? boundField.name : control.name,
		onBlur: boundField ? handleBoundBlur : userOnBlur,
		onChange: boundField ? handleBoundChange : userOnChange,
		value: boundField ? boundField.state.value : control.value,
	};
}

function textareaAppearance(size: TextareaSize, unstyled: boolean) {
	return unstyled
		? props(textareaStyles.unstyled, unstyledSizeStyles[size])
		: props(fieldStyles.input, textareaStyles.base, sizeStyles[size]);
}

export function Textarea({
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
}: TextareaProps) {
	const binding = useTextareaBinding({ ...rest, invalid });

	const [isHovered, setIsHovered] = useState(false);
	const handlePointerEnter = useCallback<
		NonNullable<NativeTextareaProps["onPointerEnter"]>
	>(
		(event) => {
			if (!(readOnly || disabled)) {
				setIsHovered(true);
			}
			onPointerEnter?.(event);
		},
		[disabled, onPointerEnter, readOnly]
	);
	const handlePointerLeave = useCallback<
		NonNullable<NativeTextareaProps["onPointerLeave"]>
	>(
		(event) => {
			setIsHovered(false);
			onPointerLeave?.(event);
		},
		[onPointerLeave]
	);

	const setControlRef = useCallback(
		(element: HTMLElement | null) =>
			element instanceof HTMLTextAreaElement || element === null
				? assignRef(forwardedRef, element)
				: undefined,
		[forwardedRef]
	);

	const {
		autoFocus,
		defaultValue,
		id,
		name: _name,
		value: _value,
		...nativeProps
	} = rest;

	return (
		<BaseField.Control
			aria-invalid={binding["aria-invalid"]}
			autoFocus={autoFocus}
			data-hovered={isHovered ? "true" : undefined}
			data-size={size}
			defaultValue={defaultValue}
			disabled={disabled}
			id={id}
			name={binding.name}
			readOnly={readOnly}
			ref={setControlRef}
			render={
				<textarea
					{...nativeProps}
					onBlur={binding.onBlur}
					onChange={binding.onChange}
					onPointerEnter={handlePointerEnter}
					onPointerLeave={handlePointerLeave}
				/>
			}
			value={binding.value}
			{...textareaAppearance(size, unstyled)}
		/>
	);
}
