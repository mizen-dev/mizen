"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { useCallback, useState } from "react";
import { fieldStyles } from "./field.styles";
import type { BoundField } from "./field-context";
import {
	BoundFieldProvider,
	extractFirstErrorMessage,
	useBoundFieldContext,
} from "./field-context";

type RootProps = ComponentPropsWithRef<typeof BaseField.Root>;
type LabelProps = ComponentPropsWithRef<typeof BaseField.Label>;
type ItemProps = ComponentPropsWithRef<typeof BaseField.Item>;
type DescriptionProps = ComponentPropsWithRef<typeof BaseField.Description>;
type ErrorProps = ComponentPropsWithRef<typeof BaseField.Error>;
type ControlProps = ComponentPropsWithRef<typeof BaseField.Control>;

type Closed<T> = Omit<T, "className" | "style">;

type BaseFieldRootProps = Closed<RootProps>;

type CompetingFieldProps =
	| "dirty"
	| "invalid"
	| "name"
	| "touched"
	| "validate"
	| "validationDebounceTime"
	| "validationMode";

export type BoundFieldProps = Omit<BaseFieldRootProps, CompetingFieldProps> & {
	field: BoundField;
	dirty?: never;
	invalid?: never;
	name?: never;
	touched?: never;
	validate?: never;
	validationDebounceTime?: never;
	validationMode?: never;
};

export type UnboundFieldProps = BaseFieldRootProps & {
	field?: never;
};

export type FieldProps = BoundFieldProps | UnboundFieldProps;
export type FieldLabelProps = Closed<LabelProps>;
export type FieldItemProps = Closed<ItemProps>;
export type FieldDescriptionProps = Closed<DescriptionProps>;
export type FieldErrorProps = Closed<ErrorProps>;
export type FieldControlProps = Omit<
	Closed<ControlProps>,
	"disabled" | "onPointerEnter" | "onPointerLeave" | "size"
> & {
	disabled?: boolean;
	onPointerEnter?: ControlProps["onPointerEnter"];
	onPointerLeave?: ControlProps["onPointerLeave"];
	size?: "default" | "lg" | "sm";
};

export function Field(fieldProps: FieldProps) {
	if (fieldProps.field !== undefined) {
		const { field, children, ...rest } = fieldProps;
		const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
		return (
			<BoundFieldProvider value={field}>
				<BaseField.Root
					{...rest}
					dirty={field.state.meta.isDirty}
					invalid={isInvalid}
					name={field.name}
					touched={field.state.meta.isTouched}
					{...props(fieldStyles.root)}
				>
					{children}
				</BaseField.Root>
			</BoundFieldProvider>
		);
	}

	const { children, ...rest } = fieldProps;
	return (
		<BaseField.Root {...rest} {...props(fieldStyles.root)}>
			{children}
		</BaseField.Root>
	);
}

export function FieldLabel({ children, ...rest }: FieldLabelProps) {
	return (
		<BaseField.Label {...rest} {...props(fieldStyles.label)}>
			{children}
		</BaseField.Label>
	);
}

export function FieldItem({ children, ...rest }: FieldItemProps) {
	return (
		<BaseField.Item {...rest} {...props(fieldStyles.item)}>
			{children}
		</BaseField.Item>
	);
}

export function FieldDescription({ children, ...rest }: FieldDescriptionProps) {
	return (
		<BaseField.Description {...rest} {...props(fieldStyles.description)}>
			{children}
		</BaseField.Description>
	);
}

export function FieldError({ children, match, ...rest }: FieldErrorProps) {
	const boundField = useBoundFieldContext();
	const isBoundInvalid = boundField
		? boundField.state.meta.isTouched && !boundField.state.meta.isValid
		: undefined;

	if (children !== undefined) {
		return (
			<BaseField.Error
				{...rest}
				match={match ?? isBoundInvalid}
				{...props(fieldStyles.error)}
			>
				{children}
			</BaseField.Error>
		);
	}

	if (boundField !== null) {
		const message = extractFirstErrorMessage(boundField.state.meta.errors);
		return (
			<BaseField.Error
				{...rest}
				match={match ?? isBoundInvalid}
				{...props(fieldStyles.error)}
			>
				{message}
			</BaseField.Error>
		);
	}

	return (
		<BaseField.Error {...rest} match={match} {...props(fieldStyles.error)}>
			{children}
		</BaseField.Error>
	);
}

const controlSizeStyles = {
	default: fieldStyles.sizeDefault,
	lg: fieldStyles.sizeLg,
	sm: fieldStyles.sizeSm,
};

export function FieldControl({
	disabled = false,
	readOnly = false,
	ref: forwardedRef = undefined,
	size = "default",
	// biome-ignore lint/complexity/noUselessUndefined: Keep this optional in Babel's generated JS surface.
	onPointerEnter = undefined,
	// biome-ignore lint/complexity/noUselessUndefined: Keep this optional in Babel's generated JS surface.
	onPointerLeave = undefined,
	...rest
}: FieldControlProps) {
	const [isHovered, setIsHovered] = useState(false);
	const handlePointerEnter = useCallback<
		NonNullable<FieldControlProps["onPointerEnter"]>
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
		NonNullable<FieldControlProps["onPointerLeave"]>
	>(
		(event) => {
			setIsHovered(false);
			onPointerLeave?.(event);
		},
		[onPointerLeave]
	);

	return (
		<BaseField.Control
			{...rest}
			data-hovered={isHovered ? "true" : undefined}
			disabled={disabled}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
			readOnly={readOnly}
			ref={forwardedRef}
			{...props(fieldStyles.input, controlSizeStyles[size])}
		/>
	);
}

export type { FieldValidityProps } from "@base-ui/react/field";

export function FieldValidity({ children }: BaseField.Validity.Props) {
	return <BaseField.Validity>{children}</BaseField.Validity>;
}
