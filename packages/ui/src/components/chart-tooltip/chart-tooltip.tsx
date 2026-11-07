import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import type { ChartSeriesTone } from "../chart-frame/chart-colors";
import {
	chartTooltipStyles,
	chartTooltipSwatches,
} from "./chart-tooltip.styles";

export interface ChartTooltipItem {
	id: string;
	label: ReactNode;
	tone: ChartSeriesTone;
	value: ReactNode;
}

export type ChartTooltipProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "role"
> & {
	items: readonly ChartTooltipItem[];
	label?: ReactNode;
};

function protectProps(attributes: Record<string, unknown>) {
	for (const name of ["children", "className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(attributes, name);
	}
}

function assertUniqueIds(items: readonly ChartTooltipItem[]) {
	if (new Set(items.map(({ id }) => id)).size !== items.length) {
		throw new TypeError("ChartTooltip item ids must be unique.");
	}
}

export function ChartTooltip({
	items,
	label,
	ref: forwardedRef,
	...rest
}: ChartTooltipProps) {
	protectProps(rest);
	if (items.length === 0) {
		return null;
	}
	assertUniqueIds(items);

	return (
		<div
			{...rest}
			data-slot="chart-tooltip"
			ref={forwardedRef}
			{...props(chartTooltipStyles.root, typeRoles.ui)}
		>
			{label === null || label === undefined ? null : (
				<p data-slot="chart-tooltip-label" {...props(chartTooltipStyles.label)}>
					{label}
				</p>
			)}
			<dl data-slot="chart-tooltip-rows" {...props(chartTooltipStyles.rows)}>
				{items.map(({ id, label: itemLabel, tone, value }) => (
					<div
						data-slot="chart-tooltip-row"
						key={id}
						{...props(chartTooltipStyles.row)}
					>
						<dt
							data-slot="chart-tooltip-term"
							{...props(chartTooltipStyles.term)}
						>
							<span
								aria-hidden="true"
								data-slot="chart-tooltip-swatch"
								{...props(
									chartTooltipStyles.swatch,
									chartTooltipSwatches[tone]
								)}
							/>
							{itemLabel}
						</dt>
						<dd
							data-slot="chart-tooltip-value"
							{...props(chartTooltipStyles.value)}
						>
							{value}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}
