import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { stackGapStyles } from "../stack/stack.styles";
import { gridColumnStyles, gridStyles } from "./grid.styles";

type NativeDivProps = ComponentPropsWithRef<"div">;

export type GridColumns = keyof typeof gridColumnStyles;
export type GridGap = keyof typeof stackGapStyles;

export type GridProps = Omit<NativeDivProps, "className" | "role" | "style"> & {
	/**
	 * Equal columns (`"1"` to `"4"`), as many as fit (`"auto"`), or a main
	 * column beside a narrower one (`"2:1"`, `"1:2"`). Columns stack when the
	 * grid is too narrow for them.
	 */
	columns?: GridColumns;
	gap?: GridGap;
};

export function Grid({
	children,
	columns = "2",
	gap = "3",
	ref: forwardedRef,
	...rest
}: GridProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-columns={columns}
			data-slot="grid"
			ref={forwardedRef}
			{...props(gridStyles.base)}
		>
			<div
				data-slot="grid-track"
				{...props(
					gridStyles.track,
					gridColumnStyles[columns],
					stackGapStyles[gap]
				)}
			>
				{children}
			</div>
		</div>
	);
}
