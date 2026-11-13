import { props } from "@stylexjs/stylex";
import type {
	ComponentPropsWithRef,
	ElementType,
	ReactElement,
	ReactNode,
} from "react";
import type { Closed } from "../../closed";
import { avatarFallbackColors } from "../avatar/avatar.styles";
import {
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
} from "../metric/metric";
import { skeletonStyles } from "../skeleton/skeleton.styles";
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
	/** A glyph shown in a small tile before the label. */
	icon?: ReactNode;
	/**
	 * The color of the icon tile: the brand tile by default. A color names a
	 * category, not a judgment. Give a category the same color on every screen.
	 */
	iconColor?: "blue" | "brand" | "green" | "neutral" | "orange" | "purple";
	label: ReactNode;
	/**
	 * Holds the card's shape while its data loads. The value renders as a
	 * placeholder, and so do the description and delta when they are passed.
	 * Pass the props the loaded card will have; the label stays readable.
	 */
	loading?: boolean;
	/**
	 * Makes the whole card a link: pass an anchor or a router link. Such a card
	 * holds no other control, so leave out actions.
	 */
	render?: ReactElement;
	/** The headline number. Omit it when the chart is the headline, such as rings. */
	value?: ReactNode;
	/** A currency sign or unit before the value, set smaller and muted: "$". */
	valuePrefix?: string;
	/** A unit after the value, set smaller and muted: "h", "ms", "%". */
	valueSuffix?: string;
};

type Slot = "delta" | "description" | "value";

// The category colors are the ones an AvatarFallback uses, so a category and
// a person share one palette. The brand tile is the base style.
const iconColors = {
	...avatarFallbackColors,
	brand: null,
	neutral: metricTrendStyles.iconNeutral,
} as const;

const placeholderSizes = {
	delta: metricTrendStyles.placeholderDelta,
	description: metricTrendStyles.placeholderDescription,
	value: metricTrendStyles.placeholderValue,
} as const;

function Placeholder({ slot }: { slot: Slot }) {
	return (
		<span
			aria-hidden="true"
			data-slot={`metric-trend-${slot}-placeholder`}
			{...props(metricTrendStyles.placeholder, placeholderSizes[slot])}
		>
			<span
				{...props(
					skeletonStyles.base,
					metricTrendStyles.placeholderBar,
					slot === "delta" && metricTrendStyles.placeholderDeltaBar
				)}
			/>
		</span>
	);
}

const present = (node: ReactNode) => node !== undefined && node !== null;

// What a loading card shows in place of its data: a bar for the value, and a
// bar for each of the description and delta the card was given.
function loadingSlots({
	delta,
	description,
}: Pick<MetricTrendProps, "delta" | "description">) {
	return {
		delta: present(delta) ? <Placeholder slot="delta" /> : undefined,
		description: present(description) ? (
			<Placeholder slot="description" />
		) : undefined,
		value: <Placeholder slot="value" />,
	};
}

// The numeral leads; currency signs and units step back so the number reads
// first.
function HeadlineValue({
	loading,
	value,
	valuePrefix,
	valueSuffix,
}: Pick<
	MetricTrendProps,
	"loading" | "value" | "valuePrefix" | "valueSuffix"
>) {
	const hidden = loading && metricTrendStyles.unitLoading;
	return (
		<MetricValue>
			{valuePrefix ? (
				<span
					{...props(metricTrendStyles.unit, metricTrendStyles.prefix, hidden)}
				>
					{valuePrefix}
				</span>
			) : null}
			{value}
			{valueSuffix ? (
				<span
					{...props(metricTrendStyles.unit, metricTrendStyles.suffix, hidden)}
				>
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
	iconColor = "brand",
	icon,
	label,
	loading,
	value,
	valuePrefix,
	valueSuffix,
}: Pick<
	MetricTrendProps,
	| "delta"
	| "description"
	| "iconColor"
	| "icon"
	| "label"
	| "loading"
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
								{...props(metricTrendStyles.icon, iconColors[iconColor])}
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
							loading={loading}
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

// A rendered link becomes the root: its own props first, then the card's.
function MetricTrendRoot({
	render,
	...rest
}: ComponentPropsWithRef<"div"> & Pick<MetricTrendProps, "render">) {
	const Root = (render?.type ?? "div") as ElementType;
	return (
		<Root
			{...(render?.props as object)}
			{...rest}
			data-slot="metric-trend"
			{...props(metricTrendStyles.root, render && metricTrendStyles.linked)}
		/>
	);
}

export function MetricTrend(trendProps: MetricTrendProps) {
	const {
		actions,
		children,
		delta,
		deltaPlacement = "value",
		description,
		icon,
		iconColor,
		label,
		loading = false,
		ref: forwardedRef,
		render,
		value,
		valuePrefix,
		valueSuffix,
		...rest
	} = trendProps;
	for (const name of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	const inFooter = deltaPlacement === "footer";
	const shown = loading
		? loadingSlots({ delta, description })
		: { delta, description, value };

	return (
		<MetricTrendRoot
			{...rest}
			aria-busy={loading || undefined}
			ref={forwardedRef}
			render={render}
		>
			<div data-slot="metric-trend-header" {...props(metricTrendStyles.header)}>
				<MetricTrendLead
					{...shown}
					delta={inFooter ? undefined : shown.delta}
					description={inFooter ? undefined : shown.description}
					iconColor={iconColor}
					icon={icon}
					label={label}
					loading={loading}
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
				<MetricTrendFooter
					delta={shown.delta}
					description={shown.description}
				/>
			) : null}
		</MetricTrendRoot>
	);
}
