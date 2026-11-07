import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { stackGapStyles, stackStyles } from "./stack.styles";

type NativeDivProps = ComponentPropsWithRef<"div">;

export type StackGap = keyof typeof stackGapStyles;

export type StackProps = Omit<
	NativeDivProps,
	"className" | "role" | "style"
> & {
	gap?: StackGap;
};

export function Stack({
	children,
	gap,
	ref: forwardedRef,
	...rest
}: StackProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-slot="stack"
			ref={forwardedRef}
			{...props(stackStyles.base, gap ? stackGapStyles[gap] : null)}
		>
			{children}
		</div>
	);
}
