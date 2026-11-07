import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { separatorStyles } from "./separator.styles";

type NativeSeparatorProps = ComponentPropsWithRef<"hr">;

export type SeparatorProps = Omit<
	NativeSeparatorProps,
	"aria-orientation" | "children" | "className" | "role" | "style"
>;

export function Separator({ ref: forwardedRef, ...rest }: SeparatorProps) {
	Reflect.deleteProperty(rest, "role");
	Reflect.deleteProperty(rest, "aria-orientation");

	return (
		<hr
			{...rest}
			data-slot="separator"
			ref={forwardedRef}
			{...props(separatorStyles.base)}
		/>
	);
}
