import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { spacerStyles } from "./spacer.styles";

type NativeDivProps = ComponentPropsWithRef<"div">;

export type SpacerProps = Omit<
	NativeDivProps,
	"children" | "className" | "dangerouslySetInnerHTML" | "role" | "style"
>;

export function Spacer({ ref: forwardedRef, ...rest }: SpacerProps) {
	Reflect.deleteProperty(rest, "role");
	Reflect.deleteProperty(rest, "children");
	Reflect.deleteProperty(rest, "dangerouslySetInnerHTML");

	return (
		<div
			{...rest}
			data-slot="spacer"
			ref={forwardedRef}
			{...props(spacerStyles.base)}
		/>
	);
}
