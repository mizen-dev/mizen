import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { gridStyles } from "./grid.styles";

type NativeDivProps = ComponentPropsWithRef<"div">;

export type GridProps = Omit<NativeDivProps, "className" | "role" | "style">;

export function Grid({ children, ref: forwardedRef, ...rest }: GridProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-slot="grid"
			ref={forwardedRef}
			{...props(gridStyles.base)}
		>
			{children}
		</div>
	);
}
