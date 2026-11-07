"use client";

import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { assertIdentity, assertNonNegative } from "../chart-frame/chart-assert";
import { type ChartSeriesTone, chartColors } from "../chart-frame/chart-colors";
import { useChartHover } from "../chart-frame/chart-hover";
import { funnelStyles } from "./funnel.styles";
import { FunnelFlow } from "./funnel-flow";

export interface FunnelStage {
	/** A decorative glyph at the start of the stage's bar. */
	icon?: ReactNode;
	id: string;
	label: string;
	value: number;
}

export type FunnelProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-label": string;
	formatValue?: (value: number) => string;
	locale?: string;
	/** bars lists stages on a shared track; flow draws one band that narrows. */
	presentation?: FunnelPresentation;
	/** Up to six stages, each in its palette color unless `tone` sets one hue. */
	stages: readonly FunnelStage[];
	tone?: ChartSeriesTone;
};

export type FunnelPresentation = "bars" | "flow";

/** A stage with its palette tone and its share of the first stage. */
export interface PlacedFunnelStage extends FunnelStage {
	share: number;
	tone: ChartSeriesTone;
}

const PALETTE = [
	"series1",
	"series2",
	"series3",
	"series4",
	"series5",
	"series6",
] as const satisfies readonly ChartSeriesTone[];

function assertStages(
	stages: readonly FunnelStage[],
	tone: ChartSeriesTone | undefined
) {
	if (!Array.isArray(stages)) {
		throw new TypeError("Funnel stages must be an array.");
	}
	if (tone === undefined && stages.length > PALETTE.length) {
		throw new RangeError(
			"Funnel colors up to six stages; set tone for more stages in one hue."
		);
	}
	const ids = new Set<string>();
	for (const stage of stages) {
		assertIdentity("Funnel", stage, ids);
		assertNonNegative("Funnel", stage.value);
	}
}

function assertOptions(ariaLabel: string, tone: ChartSeriesTone | undefined) {
	if (typeof ariaLabel !== "string" || !ariaLabel.trim()) {
		throw new TypeError("Funnel requires a non-empty aria-label.");
	}
	if (tone !== undefined && !Object.hasOwn(chartColors, tone)) {
		throw new RangeError("Funnel tone is not a supported chart series tone.");
	}
}

function FunnelBars({
	"aria-label": ariaLabel,
	format,
	share,
	stages,
}: {
	"aria-label": string;
	format: (value: number) => string;
	share: Intl.NumberFormat;
	stages: readonly PlacedFunnelStage[];
}) {
	const { fade, linkProps } = useChartHover();
	return (
		<ol aria-label={ariaLabel} {...props(funnelStyles.list)}>
			{stages.map(({ icon, id, label, share: stageShare, tone, value }) => (
				<li
					data-slot="funnel-stage"
					key={id}
					{...linkProps(id)}
					{...props(funnelStyles.row)}
				>
					<span data-slot="funnel-label" {...props(funnelStyles.label)}>
						{label}
					</span>
					<span aria-hidden="true" {...props(funnelStyles.track)}>
						<span
							data-slot="funnel-bar"
							{...props(
								...fade(id),
								funnelStyles.fill(
									`${Math.min(stageShare, 1) * 100}%`,
									chartColors[tone]
								)
							)}
						>
							{icon ? <span {...props(funnelStyles.icon)}>{icon}</span> : null}
						</span>
					</span>
					<span data-slot="funnel-value" {...props(funnelStyles.value)}>
						{format(value)}
						<span {...props(funnelStyles.share, typeRoles.caption)}>
							{share.format(stageShare)}
						</span>
					</span>
				</li>
			))}
		</ol>
	);
}

/**
 * Ordered stages, each with its value and its share of the first stage, as bars
 * on a shared track or as one band that narrows.
 */
export function Funnel({
	"aria-label": ariaLabel,
	formatValue,
	locale = "en-US",
	presentation = "bars",
	ref: forwardedRef,
	stages,
	tone,
	...rest
}: FunnelProps) {
	assertOptions(ariaLabel, tone);
	assertStages(stages, tone);
	for (const name of ["children", "className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	const format = formatValue ?? new Intl.NumberFormat(locale).format;
	const share = new Intl.NumberFormat(locale, {
		maximumFractionDigits: 0,
		style: "percent",
	});
	const base = stages[0]?.value || 1;
	const placed = stages.map((stage, index) => ({
		...stage,
		share: stage.value / base,
		tone: tone ?? PALETTE[index],
	}));
	const Presentation = presentation === "flow" ? FunnelFlow : FunnelBars;

	return (
		<div
			{...rest}
			data-slot="funnel"
			ref={forwardedRef}
			{...props(funnelStyles.root, typeRoles.ui)}
		>
			<Presentation
				aria-label={ariaLabel}
				format={format}
				share={share}
				stages={placed}
			/>
		</div>
	);
}
