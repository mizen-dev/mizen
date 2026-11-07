"use client";

import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { createContext, useCallback, useContext } from "react";
import { omitProps, protectRenderSlot } from "../../render-utils";
import {
	isBoundStringField,
	useBoundFieldContext,
} from "../field/field-context";
import { otpFieldStyles } from "./otp-field.styles";

export type Closed<T> = Omit<T, "className" | "data-slot" | "style">;

export type OTPFieldSize = "default" | "sm" | "lg";

export type OTPFieldProps = Closed<BaseOTPField.Root.Props> & {
	children?: ReactNode;
	length: number;
	ref?: ComponentPropsWithRef<"div">["ref"];
	size?: OTPFieldSize;
};

export type OTPFieldInputProps = Closed<BaseOTPField.Input.Props> & {
	ref?: ComponentPropsWithRef<"input">["ref"];
};

export type OTPFieldSeparatorProps = Closed<BaseOTPField.Separator.Props> & {
	children?: ReactNode;
	ref?: ComponentPropsWithRef<"div">["ref"];
};

interface OTPFieldContextValue {
	readonly size: OTPFieldSize;
}

const OTPFieldContext = createContext<OTPFieldContextValue>({
	size: "default",
});

function renderDefaultSlots(length: number): readonly ReactElement[] {
	const slots: ReactElement[] = [];
	for (let index = 0; index < length; index += 1) {
		slots.push(<OTPFieldInput key={`otp-field-input-${index}`} />);
	}
	return slots;
}

export function OTPField({
	children,
	length,
	onBlur: userOnBlur,
	onValueChange: userOnValueChange,
	ref: forwardedRef,
	render,
	size = "default",
	...rest
}: OTPFieldProps): ReactElement {
	const boundContext = useBoundFieldContext();
	const boundField = isBoundStringField(boundContext) ? boundContext : null;

	const handleBoundBlur = useCallback<
		NonNullable<BaseOTPField.Root.Props["onBlur"]>
	>(
		(event) => {
			userOnBlur?.(event);
			if (
				!(
					event.relatedTarget instanceof Node &&
					event.currentTarget.contains(event.relatedTarget)
				)
			) {
				boundField?.handleBlur();
			}
		},
		[boundField, userOnBlur]
	);

	const handleBoundValueChange = useCallback<
		NonNullable<BaseOTPField.Root.Props["onValueChange"]>
	>(
		(val, details) => {
			userOnValueChange?.(val, details);
			if (!details.isCanceled) {
				boundField?.handleChange(val);
			}
		},
		[boundField, userOnValueChange]
	);

	const nativeProps = omitProps(rest, ["className", "data-slot", "style"]);
	const content =
		children === undefined ? renderDefaultSlots(length) : children;

	return (
		<OTPFieldContext.Provider value={{ size }}>
			<BaseOTPField.Root
				{...nativeProps}
				{...(boundField
					? {
							name: boundField.name,
							onBlur: handleBoundBlur,
							onValueChange: handleBoundValueChange,
							value: boundField.state.value,
						}
					: { onBlur: userOnBlur, onValueChange: userOnValueChange })}
				data-size={size}
				data-slot="otp-field"
				length={length}
				ref={forwardedRef}
				render={protectRenderSlot("otp-field", render, { "data-size": size })}
				{...props(otpFieldStyles.root)}
			>
				{content}
			</BaseOTPField.Root>
		</OTPFieldContext.Provider>
	);
}

const inputSizeStyles = {
	default: otpFieldStyles.inputDefault,
	lg: otpFieldStyles.inputLg,
	sm: otpFieldStyles.inputSm,
};

export function OTPFieldInput({
	ref: forwardedRef,
	render,
	...rest
}: OTPFieldInputProps): ReactElement {
	const { size } = useContext(OTPFieldContext);
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseOTPField.Input
			{...rest}
			data-size={size}
			data-slot="otp-field-input"
			ref={forwardedRef}
			render={protectRenderSlot("otp-field-input", render, {
				"data-size": size,
			})}
			{...props(otpFieldStyles.input, inputSizeStyles[size])}
		/>
	);
}

export function OTPFieldSeparator({
	children,
	ref: forwardedRef,
	render,
	...rest
}: OTPFieldSeparatorProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseOTPField.Separator
			{...rest}
			data-slot="otp-field-separator"
			ref={forwardedRef}
			render={protectRenderSlot("otp-field-separator", render)}
			{...props(otpFieldStyles.separator)}
		>
			{children}
		</BaseOTPField.Separator>
	);
}

export const OTPFieldPrimitive = BaseOTPField;
