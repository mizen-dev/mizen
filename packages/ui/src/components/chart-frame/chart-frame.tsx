"use client";

import { props } from "@stylexjs/stylex";
import type {
	ChartPositionScaleOptions,
	ChartTheme,
	ChartValue,
	DomChartDefinition,
} from "@tanstack/charts";
import {
	type ChartProps,
	Chart as TanStackChart,
} from "@tanstack/charts/react/tooltip";
import { useMemo } from "react";
import type { Closed } from "../../closed";
import { colors } from "../../styles/colors.stylex";
import { chartFrameStyles } from "./chart-frame.styles";

type ChartSizing =
	| { aspectRatio?: never; height?: number }
	| { aspectRatio: number; height?: never };

const mizenTheme: Partial<ChartTheme> = {
	foreground: colors.content,
	grid: colors.border,
	muted: colors.mutedContent,
};
// TanStack chart option in px, matching the caption role.
// eslint-disable-next-line no-restricted-syntax -- a charts API value, not CSS.
export const mizenAxisLabels = { fontSize: 12, fontWeight: 400, opacity: 1 };
// Gap between the plot and its tick labels, in px; overlays on a tick reuse it.
// It keeps the first x label clear of the lowest y label where the axes meet.
export const mizenTickGap = 8;
const mizenGrid = {
	stroke: colors.controlSurface,
	strokeDasharray: "4 4",
	// The engine fades grids to 0.11 by default; the track color is quiet enough.
	strokeOpacity: 1,
	strokeWidth: 1,
};

type MizenAxisOptions = Extract<
	NonNullable<ChartPositionScaleOptions["axis"]>,
	object
>;

function withMizenAxisLabel(label: MizenAxisOptions["label"]) {
	if (typeof label === "string") {
		return { ...mizenAxisLabels, text: label };
	}
	return label === undefined ? undefined : { ...mizenAxisLabels, ...label };
}

export type ChartFrameProps<
	TDatum = unknown,
	TXValue extends ChartValue = ChartValue,
	TYValue extends ChartValue = ChartValue,
> = Omit<
	Closed<ChartProps<TDatum, TXValue, TYValue>>,
	| "ariaDescription"
	| "ariaLabel"
	| "aspectRatio"
	| "height"
	| "initialWidth"
	| "measureText"
	| "onRender"
	| "renderSvg"
	| "width"
> &
	ChartSizing & {
		/** Extra context for assistive tech, after the name. */
		"aria-description"?: string;
		"aria-label": string;
		initialWidth?: number;
	};

function requireChartLabel(ariaLabel: string): void {
	if (typeof ariaLabel !== "string" || !ariaLabel.trim()) {
		throw new TypeError("ChartFrame requires a non-empty aria-label.");
	}
}

function requirePositiveFinite(value: number, name: string): void {
	if (!Number.isFinite(value) || value <= 0) {
		throw new RangeError(`${name} must be a finite number greater than zero.`);
	}
}

function withMizenAxisDefaults(
	scale: ChartPositionScaleOptions | null
): ChartPositionScaleOptions | null {
	if (scale === null) {
		return null;
	}

	const { axis, ...scaleProps } = scale;
	if (axis === false) {
		return scale;
	}
	const { label, ticks, tickLabels, line, ...axisProps } = axis ?? {};

	return {
		...scaleProps,
		axis: {
			...axisProps,
			label: withMizenAxisLabel(label),
			line: line ?? false,
			tickLabels:
				tickLabels === false ? false : { ...mizenAxisLabels, ...tickLabels },
			ticks:
				ticks === false ? false : { padding: mizenTickGap, size: 0, ...ticks },
		},
		// Grid lines are quiet dashes, so they guide the eye without boxing data.
		grid: scaleProps.grid === true ? mizenGrid : scaleProps.grid,
	};
}

function withMizenSpec<
	TSpec extends {
		scales: Readonly<Record<string, ChartPositionScaleOptions | null>>;
		theme?: Partial<ChartTheme>;
	},
>(spec: TSpec): TSpec {
	// Object.fromEntries widens keys; this transform keeps every original scale key.
	const scales = Object.fromEntries(
		Object.entries(spec.scales).map(([name, scale]) => [
			name,
			withMizenAxisDefaults(scale),
		])
	) as TSpec["scales"];

	return {
		...spec,
		scales,
		theme: { ...mizenTheme, ...spec.theme },
	};
}

function withMizenTheme<
	TDatum,
	TXValue extends ChartValue,
	TYValue extends ChartValue,
>(
	definition: DomChartDefinition<TDatum, TXValue, TYValue>
): DomChartDefinition<TDatum, TXValue, TYValue> {
	if ("chart" in definition) {
		return {
			...definition,
			chart: (context) => withMizenSpec(definition.chart(context)),
		};
	}

	return withMizenSpec(definition);
}

function styleChartPlot({ svg }: { svg: SVGSVGElement }) {
	const { className } = props(chartFrameStyles.plot);
	if (className) {
		svg.classList.add(...className.split(" "));
	}
}

export function ChartFrame<
	TDatum = unknown,
	TXValue extends ChartValue = ChartValue,
	TYValue extends ChartValue = ChartValue,
>({
	"aria-description": ariaDescription,
	"aria-label": ariaLabel,
	aspectRatio,
	definition,
	height,
	initialWidth = 896,
	idPrefix,
	onFocusChange,
	onFocusGroupChange,
	onSelect,
	renderTooltipBody,
	tabIndex,
}: ChartFrameProps<TDatum, TXValue, TYValue>) {
	requireChartLabel(ariaLabel);
	requirePositiveFinite(initialWidth, "initialWidth");
	if (aspectRatio !== undefined && height !== undefined) {
		throw new TypeError(
			"ChartFrame accepts either height or aspectRatio, not both."
		);
	}
	if (aspectRatio !== undefined) {
		requirePositiveFinite(aspectRatio, "aspectRatio");
	}
	if (height !== undefined) {
		requirePositiveFinite(height, "height");
	}
	const themedDefinition = useMemo(
		() => withMizenTheme(definition),
		[definition]
	);

	return (
		<div
			data-slot="chart-frame"
			{...props(
				chartFrameStyles.frame,
				renderTooltipBody && chartFrameStyles.customTooltip
			)}
		>
			<TanStackChart
				ariaDescription={ariaDescription}
				ariaLabel={ariaLabel}
				aspectRatio={aspectRatio}
				definition={themedDefinition}
				height={aspectRatio === undefined ? (height ?? 320) : undefined}
				idPrefix={idPrefix}
				initialWidth={initialWidth}
				onFocusChange={onFocusChange}
				onFocusGroupChange={onFocusGroupChange}
				onRender={styleChartPlot}
				onSelect={onSelect}
				renderTooltipBody={renderTooltipBody}
				tabIndex={tabIndex}
			/>
		</div>
	);
}
