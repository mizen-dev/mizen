import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import {
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
} from "../metric/metric";
import { metricTrendStyles } from "./metric-trend.styles";

export type MetricTrendProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "role"
> & {
	/** Top-right controls such as a ChartLegend or a period switcher. */
	actions?: ReactNode;
	/** The chart, usually a TimeSeries or CategoryComparison. Omit for a stat card. */
	children?: ReactNode;
	/** A MetricDelta beside the value. */
	delta?: ReactNode;
	/**
	 * Where the change sits. "footer" moves the description and delta into an
	 * inset strip at the bottom of the card.
	 */
	deltaPlacement?: "footer" | "value";
	description?: ReactNode;
	/** A glyph shown in a small brand tile before the label. */
	icon?: ReactNode;
	label: ReactNode;
	/** The headline number. Omit it when the chart is the headline, such as rings. */
	value?: ReactNode;
	/** A currency sign or unit before the value, set smaller and muted: "$". */
	valuePrefix?: string;
	/** A unit after the value, set smaller and muted: "h", "ms", "%". */
	valueSuffix?: string;
};

// The numeral leads; currency signs and units step back so the number reads
// first.
function HeadlineValue({
	value,
	valuePrefix,
	valueSuffix,
}: Pick<MetricTrendProps, "value" | "valuePrefix" | "valueSuffix">) {
	return (
		<MetricValue>
			{valuePrefix ? (
				<span {...props(metricTrendStyles.unit, metricTrendStyles.prefix)}>
					{valuePrefix}
				</span>
			) : null}
			{value}
			{valueSuffix ? (
				<span {...props(metricTrendStyles.unit, metricTrendStyles.suffix)}>
					{valueSuffix}
				</span>
			) : null}
		</MetricValue>
	);
}

function MetricTrendFooter({
	delta,
	description,
}: Pick<MetricTrendProps, "delta" | "description">) {
	return (
		<div data-slot="metric-trend-footer" {...props(metricTrendStyles.footer)}>
			{description === undefined || description === null ? (
				<span />
			) : (
				<MetricDescription>{description}</MetricDescription>
			)}
			{delta}
		</div>
	);
}

// A metric card: label, value with an optional change chip, a comparison line,
// optional actions, and an optional chart below. Without a chart it is a stat
// card.
function MetricTrendLead({
	delta,
	description,
	icon,
	label,
	value,
	valuePrefix,
	valueSuffix,
}: Pick<
	MetricTrendProps,
	| "delta"
	| "description"
	| "icon"
	| "label"
	| "value"
	| "valuePrefix"
	| "valueSuffix"
>) {
	return (
		<div {...props(metricTrendStyles.lead)}>
			<Metric>
				<MetricLabel>
					{icon ? (
						<span {...props(metricTrendStyles.labelRow)}>
							<span
								aria-hidden="true"
								data-slot="metric-trend-icon"
								{...props(metricTrendStyles.icon)}
							>
								{icon}
							</span>
							{label}
						</span>
					) : (
						label
					)}
				</MetricLabel>
				{value === undefined || value === null ? null : (
					<div {...props(metricTrendStyles.valueRow)}>
						<HeadlineValue
							value={value}
							valuePrefix={valuePrefix}
							valueSuffix={valueSuffix}
						/>
						{delta}
					</div>
				)}
				{description === undefined || description === null ? null : (
					<MetricDescription>{description}</MetricDescription>
				)}
			</Metric>
		</div>
	);
}

export function MetricTrend({
	actions,
	children,
	delta,
	deltaPlacement = "value",
	description,
	icon,
	label,
	ref: forwardedRef,
	value,
	valuePrefix,
	valueSuffix,
	...rest
}: MetricTrendProps) {
	for (const name of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	const inFooter = deltaPlacement === "footer";

	return (
		<div
			{...rest}
			data-slot="metric-trend"
			ref={forwardedRef}
			{...props(metricTrendStyles.root)}
		>
			<div data-slot="metric-trend-header" {...props(metricTrendStyles.header)}>
				<MetricTrendLead
					delta={inFooter ? undefined : delta}
					description={inFooter ? undefined : description}
					icon={icon}
					label={label}
					value={value}
					valuePrefix={valuePrefix}
					valueSuffix={valueSuffix}
				/>
				{actions ? (
					<div
						data-slot="metric-trend-actions"
						{...props(metricTrendStyles.actions)}
					>
						{actions}
					</div>
				) : null}
			</div>
			{children}
			{inFooter ? (
				<MetricTrendFooter delta={delta} description={description} />
			) : null}
		</div>
	);
}
