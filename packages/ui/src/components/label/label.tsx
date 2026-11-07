import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { typeRoles } from "../../styles/typography.styles";
import { labelStyles } from "./label.styles";

type NativeLabelProps = ComponentPropsWithRef<"label">;

export type LabelProps = Omit<NativeLabelProps, "className" | "role" | "style">;

export function Label({
	children,
	htmlFor,
	ref: forwardedRef,
	...rest
}: LabelProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<label
			htmlFor={htmlFor}
			{...rest}
			data-slot="label"
			ref={forwardedRef}
			{...props(labelStyles.base, typeRoles.label)}
		>
			{children}
		</label>
	);
}
