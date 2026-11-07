import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { inlineStyles } from "./inline.styles";

type NativeDivProps = ComponentPropsWithRef<"div">;

export type InlineProps = Omit<NativeDivProps, "className" | "role" | "style">;

export function Inline({ children, ref: forwardedRef, ...rest }: InlineProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-slot="inline"
			ref={forwardedRef}
			{...props(inlineStyles.base)}
		>
			{children}
		</div>
	);
}
