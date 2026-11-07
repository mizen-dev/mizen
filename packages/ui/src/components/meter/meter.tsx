"use client";

import { Meter as BaseMeter } from "@base-ui/react/meter";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { protectRenderSlot } from "../../render-utils";
import { typeRoles } from "../../styles/typography.styles";
import { meterStyles } from "./meter.styles";

type RootProps = ComponentPropsWithRef<typeof BaseMeter.Root>;
type TrackProps = ComponentPropsWithRef<typeof BaseMeter.Track>;
type IndicatorProps = ComponentPropsWithRef<typeof BaseMeter.Indicator>;
type LabelProps = ComponentPropsWithRef<typeof BaseMeter.Label>;
type ValueProps = ComponentPropsWithRef<typeof BaseMeter.Value>;

type Part<T> = Omit<Closed<T>, "data-slot" | "role">;

export type MeterProps = Omit<
	Part<RootProps>,
	"aria-valuemax" | "aria-valuemin" | "aria-valuenow"
> & { ref?: RootProps["ref"] };
export type MeterTrackProps = Part<TrackProps> & { ref?: TrackProps["ref"] };
export type MeterIndicatorProps = Part<IndicatorProps> & {
	ref?: IndicatorProps["ref"];
};
export type MeterLabelProps = Part<LabelProps> & { ref?: LabelProps["ref"] };
export type MeterValueProps = Part<ValueProps> & { ref?: ValueProps["ref"] };

function stripReservedProps(rest: Record<string, unknown>) {
	for (const name of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
}

function stripRangeProps(rest: Record<string, unknown>) {
	for (const name of ["aria-valuemax", "aria-valuemin", "aria-valuenow"]) {
		Reflect.deleteProperty(rest, name);
	}
}

function validateRange(value: number, min: number, max: number) {
	if (
		!(Number.isFinite(value) && Number.isFinite(min) && Number.isFinite(max))
	) {
		throw new TypeError("Meter value, min, and max must be finite numbers.");
	}
	if (min >= max) {
		throw new RangeError("Meter min must be less than max.");
	}
}

// Without children there is no MeterLabel, so the root must carry the name.
function validateName(rest: MeterProps, hasChildren: boolean) {
	const name = rest["aria-label"] ?? rest["aria-labelledby"] ?? "";
	if (!(hasChildren || name.trim())) {
		throw new TypeError(
			"Meter requires a MeterLabel child, aria-label, or aria-labelledby."
		);
	}
}

export function Meter({
	children,
	locale = "en",
	max = 100,
	min = 0,
	ref: forwardedRef,
	render,
	value,
	...rest
}: MeterProps) {
	stripReservedProps(rest);
	stripRangeProps(rest);
	validateRange(value, min, max);
	validateName(rest as MeterProps, children !== undefined);
	return (
		<BaseMeter.Root
			{...rest}
			data-slot="meter"
			locale={locale}
			max={max}
			min={min}
			ref={forwardedRef}
			render={protectRenderSlot("meter", render, { role: "meter" })}
			value={value}
			{...props(meterStyles.root, typeRoles.body)}
		>
			{children ?? (
				<MeterTrack>
					<MeterIndicator />
				</MeterTrack>
			)}
		</BaseMeter.Root>
	);
}

export function MeterTrack({
	children,
	ref: forwardedRef,
	render,
	...rest
}: MeterTrackProps) {
	stripReservedProps(rest);
	return (
		<BaseMeter.Track
			{...rest}
			data-slot="meter-track"
			ref={forwardedRef}
			render={protectRenderSlot("meter-track", render)}
			{...props(meterStyles.track)}
		>
			{children}
		</BaseMeter.Track>
	);
}

export function MeterIndicator({
	children,
	ref: forwardedRef,
	render,
	...rest
}: MeterIndicatorProps) {
	stripReservedProps(rest);
	return (
		<BaseMeter.Indicator
			{...rest}
			data-slot="meter-indicator"
			ref={forwardedRef}
			render={protectRenderSlot("meter-indicator", render)}
			{...props(meterStyles.indicator)}
		>
			{children}
		</BaseMeter.Indicator>
	);
}

export function MeterLabel({
	children,
	ref: forwardedRef,
	render,
	...rest
}: MeterLabelProps) {
	stripReservedProps(rest);
	return (
		<BaseMeter.Label
			{...rest}
			data-slot="meter-label"
			ref={forwardedRef}
			render={protectRenderSlot("meter-label", render)}
			{...props(meterStyles.label)}
		>
			{children}
		</BaseMeter.Label>
	);
}

export function MeterValue({
	children,
	ref: forwardedRef,
	render,
	...rest
}: MeterValueProps) {
	stripReservedProps(rest);
	return (
		<BaseMeter.Value
			{...rest}
			data-slot="meter-value"
			ref={forwardedRef}
			render={protectRenderSlot("meter-value", render)}
			{...props(meterStyles.value)}
		>
			{children}
		</BaseMeter.Value>
	);
}
