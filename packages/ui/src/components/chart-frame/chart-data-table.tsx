import { props } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";

/**
 * A chart's exact values as a table for assistive technology. It stays out of
 * sight: sighted readers get the same values from tooltips and keyboard focus.
 */
export function ChartDataTable({ children }: { children: ReactNode }) {
	return (
		<div data-slot="chart-data" {...props(visuallyHiddenStyles.root)}>
			{children}
		</div>
	);
}
