"use client";

import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { protectRenderSlot } from "../../render-utils";
import { fieldsetStyles } from "./fieldset.styles";

type BaseFieldsetRootProps = ComponentPropsWithRef<typeof BaseFieldset.Root>;
type BaseFieldsetLegendProps = ComponentPropsWithRef<
	typeof BaseFieldset.Legend
>;

export type FieldsetProps = Omit<
	BaseFieldsetRootProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseFieldsetRootProps["ref"];
};

export type FieldsetLegendProps = Omit<
	BaseFieldsetLegendProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseFieldsetLegendProps["ref"];
};

export function Fieldset({
	ref: forwardedRef,
	render,
	...rest
}: FieldsetProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseFieldset.Root
			{...rest}
			data-slot="fieldset"
			ref={forwardedRef}
			render={protectRenderSlot("fieldset", render)}
			{...props(fieldsetStyles.root)}
		/>
	);
}

export function FieldsetLegend({
	ref: forwardedRef,
	render,
	...rest
}: FieldsetLegendProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseFieldset.Legend
			{...rest}
			data-slot="fieldset-legend"
			ref={forwardedRef}
			render={protectRenderSlot("fieldset-legend", render)}
			{...props(fieldsetStyles.legend)}
		/>
	);
}

export const FieldsetPrimitive = BaseFieldset;
