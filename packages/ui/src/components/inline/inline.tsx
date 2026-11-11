import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { stackGapStyles } from "../stack/stack.styles";
import {
	inlineAlignStyles,
	inlineJustifyStyles,
	inlineStyles,
} from "./inline.styles";

type NativeDivProps = ComponentPropsWithRef<"div">;

export type InlineAlign = keyof typeof inlineAlignStyles;
export type InlineGap = keyof typeof stackGapStyles;
export type InlineJustify = keyof typeof inlineJustifyStyles;

export type InlineProps = Omit<
	NativeDivProps,
	"className" | "role" | "style"
> & {
	align?: InlineAlign;
	gap?: InlineGap;
	/** `"between"` pushes the first and last items to opposite edges. */
	justify?: InlineJustify;
	/** Items wrap onto new lines by default. */
	wrap?: boolean;
};

export function Inline({
	align = "center",
	children,
	gap,
	justify = "start",
	ref: forwardedRef,
	wrap = true,
	...rest
}: InlineProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-slot="inline"
			ref={forwardedRef}
			{...props(
				inlineStyles.base,
				inlineAlignStyles[align],
				inlineJustifyStyles[justify],
				wrap ? inlineStyles.wrap : inlineStyles.nowrap,
				gap ? stackGapStyles[gap] : null
			)}
		>
			{children}
		</div>
	);
}
