import { props, type StyleXStyles } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { spinnerStyles } from "./components/spinner/spinner.styles";

// The ring clockwise from the top, so the bright head travels clockwise.
const ringDots = [
	{ cx: 12, cy: 3, style: spinnerStyles.loaderDot0 },
	{ cx: 18.36, cy: 5.64, style: spinnerStyles.loaderDot1 },
	{ cx: 21, cy: 12, style: spinnerStyles.loaderDot2 },
	{ cx: 18.36, cy: 18.36, style: spinnerStyles.loaderDot3 },
	{ cx: 12, cy: 21, style: spinnerStyles.loaderDot4 },
	{ cx: 5.64, cy: 18.36, style: spinnerStyles.loaderDot5 },
	{ cx: 3, cy: 12, style: spinnerStyles.loaderDot6 },
	{ cx: 5.64, cy: 5.64, style: spinnerStyles.loaderDot7 },
] as const;

// Private shared glyph. Public components retain their own closed prop contracts.
export function LoadingIndicator({
	indicatorStyles,
	ref,
	...rest
}: ComponentPropsWithRef<"svg"> & { indicatorStyles?: StyleXStyles }) {
	return (
		<svg
			{...rest}
			aria-label={rest["aria-label"]}
			fill="currentColor"
			ref={ref}
			stroke="none"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			{...props(spinnerStyles.base, indicatorStyles)}
		>
			{ringDots.map(({ cx, cy, style }) => (
				<circle
					cx={cx}
					cy={cy}
					key={`${cx}-${cy}`}
					r={2.5}
					{...props(spinnerStyles.loaderDot, style)}
				/>
			))}
		</svg>
	);
}
