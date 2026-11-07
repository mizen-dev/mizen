"use client";

import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { props } from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { useCallback, useId } from "react";
import { omitProps, protectRenderSlot } from "../../render-utils";
import {
	isBoundNumberField,
	useBoundFieldContext,
} from "../field/field-context";
import { numberFieldStyles } from "./number-field.styles";
import type {
	NumberFieldDecrementProps,
	NumberFieldGroupProps,
	NumberFieldIncrementProps,
	NumberFieldInputProps,
	NumberFieldProps,
	NumberFieldScrubAreaProps,
} from "./number-field.types";
import {
	CursorHorizontalIcon,
	CursorVerticalIcon,
	MinusIcon,
	NumberFieldContext,
	PlusIcon,
	useNumberFieldContext,
} from "./number-field-context";

const sizeStyles = {
	default: numberFieldStyles.sizeDefault,
	lg: numberFieldStyles.sizeLg,
	sm: numberFieldStyles.sizeSm,
};

const inputSizeStyles = {
	default: numberFieldStyles.inputDefault,
	lg: numberFieldStyles.inputLg,
	sm: numberFieldStyles.inputSm,
};

export function NumberField({
	children,
	id: idProp,
	onValueChange: userOnValueChange,
	ref: forwardedRef,
	render,
	size = "default",
	...rest
}: NumberFieldProps): ReactElement {
	const boundContext = useBoundFieldContext();
	const boundField = isBoundNumberField(boundContext) ? boundContext : null;
	const generatedId = useId();
	const inputId = idProp ?? `${generatedId}-input`;
	const scrubLabelId = `${generatedId}-label`;

	const handleBoundValueChange = useCallback<
		NonNullable<BaseNumberField.Root.Props["onValueChange"]>
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

	return (
		<NumberFieldContext.Provider
			value={{ boundField, inputId, scrubLabelId, size }}
		>
			<BaseNumberField.Root
				{...nativeProps}
				{...(boundField
					? {
							name: boundField.name,
							onValueChange: handleBoundValueChange,
							value: boundField.state.value,
						}
					: { onValueChange: userOnValueChange })}
				data-slot="number-field"
				id={inputId}
				ref={forwardedRef}
				render={protectRenderSlot("number-field", render)}
				{...props(numberFieldStyles.root)}
			>
				{children}
			</BaseNumberField.Root>
		</NumberFieldContext.Provider>
	);
}

export function NumberFieldGroup({
	children,
	ref: forwardedRef,
	render,
	...rest
}: NumberFieldGroupProps): ReactElement {
	const { size } = useNumberFieldContext();

	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseNumberField.Group
			{...rest}
			data-slot="number-field-group"
			ref={forwardedRef}
			render={protectRenderSlot("number-field-group", render)}
			{...props(numberFieldStyles.group, sizeStyles[size])}
		>
			{children}
		</BaseNumberField.Group>
	);
}

export function NumberFieldInput({
	onBlur: userOnBlur,
	ref: forwardedRef,
	render,
	...rest
}: NumberFieldInputProps): ReactElement {
	const { boundField, size } = useNumberFieldContext();

	const handleBlur = useCallback<NonNullable<NumberFieldInputProps["onBlur"]>>(
		(event) => {
			boundField?.handleBlur();
			userOnBlur?.(event);
		},
		[boundField, userOnBlur]
	);

	const nativeProps = omitProps(rest, ["className", "data-slot", "style"]);

	return (
		<BaseNumberField.Input
			{...nativeProps}
			data-size={size}
			data-slot="number-field-input"
			onBlur={handleBlur}
			ref={forwardedRef}
			render={protectRenderSlot("number-field-input", render)}
			{...props(numberFieldStyles.input, inputSizeStyles[size])}
		/>
	);
}

export function NumberFieldIncrement({
	children,
	ref: forwardedRef,
	render,
	...rest
}: NumberFieldIncrementProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");
	Reflect.deleteProperty(rest, "tabIndex");

	return (
		<BaseNumberField.Increment
			{...rest}
			data-slot="number-field-increment"
			ref={forwardedRef}
			render={protectRenderSlot("number-field-increment", render, {
				tabIndex: -1,
			})}
			tabIndex={-1}
			{...props(numberFieldStyles.stepper)}
		>
			{children ?? <PlusIcon />}
		</BaseNumberField.Increment>
	);
}

export function NumberFieldDecrement({
	children,
	ref: forwardedRef,
	render,
	...rest
}: NumberFieldDecrementProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");
	Reflect.deleteProperty(rest, "tabIndex");

	return (
		<BaseNumberField.Decrement
			{...rest}
			data-slot="number-field-decrement"
			ref={forwardedRef}
			render={protectRenderSlot("number-field-decrement", render, {
				tabIndex: -1,
			})}
			tabIndex={-1}
			{...props(numberFieldStyles.stepper)}
		>
			{children ?? <MinusIcon />}
		</BaseNumberField.Decrement>
	);
}

export function NumberFieldScrubArea({
	children,
	label,
	direction = "horizontal",
	ref: forwardedRef,
	render,
	...rest
}: NumberFieldScrubAreaProps): ReactElement {
	const { inputId, scrubLabelId } = useNumberFieldContext();

	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-direction");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseNumberField.ScrubArea
			{...rest}
			data-direction={direction}
			data-slot="number-field-scrub-area"
			direction={direction}
			ref={forwardedRef}
			render={protectRenderSlot("number-field-scrub-area", render, {
				"data-direction": direction,
			})}
			{...props(
				numberFieldStyles.scrubArea,
				direction === "vertical" ? numberFieldStyles.scrubAreaVertical : null
			)}
		>
			<label
				data-slot="number-field-scrub-area-label"
				htmlFor={inputId}
				id={scrubLabelId}
				{...props(numberFieldStyles.scrubLabel)}
			>
				{label ?? children}
			</label>
			<BaseNumberField.ScrubAreaCursor
				data-slot="number-field-scrub-area-cursor"
				{...props(numberFieldStyles.scrubAreaCursor)}
			>
				{direction === "vertical" ? (
					<CursorVerticalIcon />
				) : (
					<CursorHorizontalIcon />
				)}
			</BaseNumberField.ScrubAreaCursor>
		</BaseNumberField.ScrubArea>
	);
}

export const NumberFieldPrimitive = BaseNumberField;

export type {
	NumberFieldDecrementProps,
	NumberFieldGroupProps,
	NumberFieldIncrementProps,
	NumberFieldInputProps,
	NumberFieldProps,
	NumberFieldScrubAreaProps,
	NumberFieldSize,
} from "./number-field.types";
