import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { typeRoles } from "../../styles/typography.styles";
import { metricStyles } from "./metric.styles";

export type MetricProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type MetricLabelProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type MetricValueProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type MetricDescriptionProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export function Metric({ children, ref: forwardedRef, ...rest }: MetricProps) {
	return (
		<div
			{...rest}
			data-slot="metric"
			ref={forwardedRef}
			{...props(metricStyles.root)}
		>
			{children}
		</div>
	);
}

export function MetricLabel({
	children,
	ref: forwardedRef,
	...rest
}: MetricLabelProps) {
	return (
		<div
			{...rest}
			data-slot="metric-label"
			ref={forwardedRef}
			{...props(metricStyles.label)}
		>
			{children}
		</div>
	);
}

export function MetricValue({
	children,
	ref: forwardedRef,
	...rest
}: MetricValueProps) {
	return (
		<div
			{...rest}
			data-slot="metric-value"
			ref={forwardedRef}
			{...props(metricStyles.value, typeRoles.numeric)}
		>
			{children}
		</div>
	);
}

export function MetricDescription({
	children,
	ref: forwardedRef,
	...rest
}: MetricDescriptionProps) {
	return (
		<div
			{...rest}
			data-slot="metric-description"
			ref={forwardedRef}
			{...props(metricStyles.description)}
		>
			{children}
		</div>
	);
}

export type MetricDeltaProps = Omit<
	ComponentPropsWithRef<"span">,
	"children" | "className" | "data-slot" | "style"
> & {
	/** Which direction is good: "up" by default, "down" for costs or errors. */
	good?: "down" | "up";
	locale?: string;
	/** Fractional change: 0.16 renders "+16%". */
	value: number;
};

// Keyed by direction relative to the good direction: worse, flat, better.
const deltaTones = {
	"-1": metricStyles.deltaWorse,
	"0": metricStyles.deltaFlat,
	"1": metricStyles.deltaBetter,
} as const;

// A compact change chip. The sign carries the direction; the tint says whether
// that direction is good.
export function MetricDelta({
	good = "up",
	locale = "en-US",
	value,
	...rest
}: MetricDeltaProps) {
	const direction = Math.sign(value) as -1 | 0 | 1;
	const tone = (good === "up" ? direction : -direction) as -1 | 0 | 1;
	for (const name of ["className", "data-slot", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	return (
		<span
			{...rest}
			data-slot="metric-delta"
			{...props(typeRoles.label, metricStyles.delta, deltaTones[tone])}
		>
			{new Intl.NumberFormat(locale, {
				maximumFractionDigits: 1,
				signDisplay: "exceptZero",
				style: "percent",
			}).format(value)}
		</span>
	);
}
