"use client";

import type { SliderRoot as BaseSliderRoot } from "@base-ui/react/slider";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { props } from "@stylexjs/stylex";
import type { ReactElement, ReactNode } from "react";
import { Children, Fragment, isValidElement, useCallback } from "react";
import { protectRenderSlot } from "../../render-utils";
import type { BoundField, BoundNumberField } from "../field/field-context";
import {
	isBoundNumberField,
	useBoundFieldContext,
} from "../field/field-context";
import { sliderStyles } from "./slider.styles";
import type {
	SliderLabelProps,
	SliderProps,
	SliderValueProps,
} from "./slider.types";
import {
	SliderControl as ContextSliderControl,
	SliderIndicator as ContextSliderIndicator,
	SliderThumb as ContextSliderThumb,
	SliderTrack as ContextSliderTrack,
	SliderContext,
	useSliderContext,
} from "./slider-context";
import { renderDefaultAnatomy } from "./slider-default-anatomy";
import { stripForbidden } from "./slider-slot";

function hasSliderControl(children: ReactNode): boolean {
	return Children.toArray(children).some((child) => {
		if (!isValidElement<{ children?: ReactNode }>(child)) {
			return false;
		}
		return (
			child.type === ContextSliderControl ||
			(child.type === Fragment && hasSliderControl(child.props.children))
		);
	});
}

function getSliderOptions({
	value,
	defaultValue,
	min = 0,
	max = 100,
	step = 1,
	ticks = false,
	thumbValue = false,
	thumbAlignment = "edge",
	locale = "en-US",
	format,
}: SliderProps<number | readonly number[]>) {
	const formatter = new Intl.NumberFormat(locale, format);
	return {
		locale,
		max,
		min,
		range: Array.isArray(value ?? defaultValue),
		step,
		thumbAlignment,
		thumbValue,
		ticks,
		valueCharacters: Math.max(
			formatter.format(min).length,
			formatter.format(max).length
		),
	};
}

function resolveBoundField(
	context: BoundField | null,
	value: unknown,
	defaultValue: unknown
): BoundNumberField | null {
	const activeValue = value === undefined ? defaultValue : value;
	if (Array.isArray(activeValue)) {
		return null;
	}
	return isBoundNumberField(context) ? context : null;
}

function getSliderRootStyles(
	orientation: "horizontal" | "vertical",
	disabled?: boolean
) {
	return [
		sliderStyles.root,
		orientation === "vertical" ? sliderStyles.rootVertical : null,
		disabled ? sliderStyles.rootDisabled : null,
	];
}

function useSliderBinding(
	boundField: BoundNumberField | null,
	min: number,
	userOnValueChange?: SliderProps<number | readonly number[]>["onValueChange"],
	userOnBlur?: SliderProps["onBlur"]
) {
	const handleValueChange = useCallback(
		(
			val: number | readonly number[],
			details: BaseSliderRoot.ChangeEventDetails
		) => {
			userOnValueChange?.(val, details);
			if (!details.isCanceled && typeof val === "number") {
				boundField?.handleChange(val);
			}
		},
		[boundField, userOnValueChange]
	);

	const handleBlur = useCallback<NonNullable<SliderProps["onBlur"]>>(
		(event) => {
			userOnBlur?.(event);
			if (boundField) {
				const next = event.relatedTarget;
				if (!(next instanceof Node && event.currentTarget.contains(next))) {
					boundField.handleBlur();
				}
			}
		},
		[boundField, userOnBlur]
	);

	if (!boundField) {
		return { boundProps: undefined, onBlur: userOnBlur };
	}

	return {
		boundProps: {
			name: boundField.name,
			onValueChange: handleValueChange,
			value: boundField.state.value ?? min,
		},
		onBlur: handleBlur,
	};
}

export function Slider<Value extends readonly number[]>(
	props: SliderProps<Value>
): ReactElement;
export function Slider<Value extends number = number>(
	props: SliderProps<Value>
): ReactElement;
export function Slider(
	props: SliderProps<number | readonly number[]>
): ReactElement;
export function Slider(
	allProps: SliderProps<number | readonly number[]>
): ReactElement {
	const {
		children,
		disabled,
		getAriaLabel,
		invalid = false,
		orientation = "horizontal",
		ref: forwardedRef,
		render,
		size = "default",
		...rest
	} = allProps;

	const options = getSliderOptions(allProps);
	Reflect.deleteProperty(rest, "ticks");
	Reflect.deleteProperty(rest, "thumbValue");
	const { min, max, thumbAlignment, locale } = options;

	const boundField = resolveBoundField(
		useBoundFieldContext(),
		rest.value,
		rest.defaultValue
	);
	const { boundProps, onBlur } = useSliderBinding(
		boundField,
		min,
		rest.onValueChange,
		rest.onBlur
	);

	stripForbidden(rest);

	const content = hasSliderControl(children) ? (
		children
	) : (
		<>
			{children}
			{renderDefaultAnatomy(rest.value, rest.defaultValue, rest["aria-label"])}
		</>
	);

	return (
		<SliderContext.Provider
			value={{
				disabled,
				getAriaLabel,
				invalid,
				orientation,
				size,
				...options,
			}}
		>
			<BaseSlider.Root
				{...rest}
				{...boundProps}
				{...(invalid ? { "aria-invalid": true, "data-invalid": "" } : {})}
				{...(disabled ? { "data-disabled": "" } : {})}
				data-orientation={orientation}
				data-size={size}
				data-slot="slider"
				disabled={disabled}
				locale={locale}
				max={max}
				min={min}
				onBlur={onBlur}
				orientation={orientation}
				ref={forwardedRef}
				render={protectRenderSlot("slider", render, {
					...(disabled ? { "data-disabled": "" } : {}),
					...(invalid ? { "data-invalid": "" } : {}),
					"data-orientation": orientation,
					"data-size": size,
				})}
				thumbAlignment={thumbAlignment}
				{...props(getSliderRootStyles(orientation, disabled))}
			>
				{content}
			</BaseSlider.Root>
		</SliderContext.Provider>
	);
}

export function SliderLabel({
	children,
	ref: forwardedRef,
	render,
	...rest
}: SliderLabelProps): ReactElement {
	const { orientation, size } = useSliderContext();
	stripForbidden(rest);

	return (
		<BaseSlider.Label
			{...rest}
			data-orientation={orientation}
			data-size={size}
			data-slot="slider-label"
			ref={forwardedRef}
			render={protectRenderSlot("slider-label", render, {
				"data-orientation": orientation,
				"data-size": size,
			})}
			{...props(sliderStyles.label)}
		>
			{children}
		</BaseSlider.Label>
	);
}

export function SliderValue({
	children,
	ref: forwardedRef,
	render,
	...rest
}: SliderValueProps): ReactElement {
	const { orientation, size } = useSliderContext();
	stripForbidden(rest);

	return (
		<BaseSlider.Value
			{...rest}
			data-orientation={orientation}
			data-size={size}
			data-slot="slider-value"
			ref={forwardedRef}
			render={protectRenderSlot("slider-value", render, {
				"data-orientation": orientation,
				"data-size": size,
			})}
			{...props(sliderStyles.value)}
		>
			{children}
		</BaseSlider.Value>
	);
}

export const SliderControl = ContextSliderControl;
export const SliderIndicator = ContextSliderIndicator;
export const SliderThumb = ContextSliderThumb;
export const SliderTrack = ContextSliderTrack;
export const SliderPrimitive = BaseSlider;

export type {
	SliderControlProps,
	SliderIndicatorProps,
	SliderLabelProps,
	SliderProps,
	SliderSize,
	SliderThumbProps,
	SliderTrackProps,
	SliderValueProps,
} from "./slider.types";
