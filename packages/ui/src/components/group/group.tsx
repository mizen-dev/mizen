import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { groupStyles } from "./group.styles";

type NativeDivProps = ComponentPropsWithRef<"div">;

export type GroupProps = Omit<NativeDivProps, "className" | "role" | "style">;

export function Group({ children, ref: forwardedRef, ...rest }: GroupProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-slot="group"
			ref={forwardedRef}
			{...props(groupStyles.base)}
		>
			{children}
		</div>
	);
}
