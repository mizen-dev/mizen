import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { controlLabel } from "../../control-label";
import { typeRoles } from "../../styles/typography.styles";
import type { ChartSeriesTone } from "../chart-frame/chart-colors";
import { chartLegendStyles, chartLegendSwatches } from "./chart-legend.styles";

export interface ChartLegendItem {
	id: string;
	label: ReactNode;
	tone: ChartSeriesTone;
	/** A total or current value shown after the label, such as "50,500". */
	value?: ReactNode;
}

export type ChartLegendProps = Omit<
	Closed<ComponentPropsWithRef<"ul">>,
	"aria-label" | "children" | "data-slot" | "role"
> & {
	"aria-label": string;
	items: readonly ChartLegendItem[];
	/**
	 * rows puts each item on its own row with its value at the row's end. tiles
	 * shows each item as a tile with its value below the label.
	 */
	variant?: ChartLegendVariant;
};

export type ChartLegendVariant = "inline" | "rows" | "tiles";

const layouts = {
	inline: {
		item: chartLegendStyles.item,
		list: chartLegendStyles.list,
		value: null,
	},
	rows: {
		item: chartLegendStyles.row,
		list: chartLegendStyles.rows,
		value: chartLegendStyles.rowValue,
	},
	tiles: {
		item: chartLegendStyles.tile,
		list: chartLegendStyles.tiles,
		value: chartLegendStyles.tileValue,
	},
};

function protectProps(attributes: Record<string, unknown>) {
	for (const name of [
		"aria-label",
		"children",
		"className",
		"data-slot",
		"role",
		"style",
	]) {
		Reflect.deleteProperty(attributes, name);
	}
}

function assertUniqueIds(items: readonly ChartLegendItem[]) {
	if (new Set(items.map(({ id }) => id)).size !== items.length) {
		throw new TypeError("ChartLegend item ids must be unique.");
	}
}

export function ChartLegend({
	"aria-label": ariaLabel,
	items,
	ref: forwardedRef,
	variant = "inline",
	...rest
}: ChartLegendProps) {
	if (typeof ariaLabel !== "string" || !ariaLabel.trim()) {
		throw new TypeError("ChartLegend requires a non-empty aria-label.");
	}
	protectProps(rest);
	assertUniqueIds(items);
	const tiles = variant === "tiles";
	const layout = layouts[variant] ?? layouts.inline;

	return (
		<ul
			{...rest}
			aria-label={ariaLabel}
			data-slot="chart-legend"
			ref={forwardedRef}
			{...props(chartLegendStyles.root, layout.list, typeRoles.ui)}
		>
			{items.map(({ id, label, tone, value }) => (
				<li data-slot="chart-legend-item" key={id} {...props(layout.item)}>
					<span {...props(chartLegendStyles.name)}>
						<span
							aria-hidden="true"
							data-slot="chart-legend-swatch"
							{...props(
								chartLegendStyles.swatch,
								tiles && chartLegendStyles.tileSwatch,
								chartLegendSwatches[tone]
							)}
						/>
						{controlLabel(label)}
					</span>
					{value === undefined ? null : (
						<>
							{/* Keeps the label and value apart in copied and read text. */}{" "}
							<span
								data-slot="chart-legend-value"
								{...props(chartLegendStyles.value, layout.value)}
							>
								{value}
							</span>
						</>
					)}
				</li>
			))}
		</ul>
	);
}
