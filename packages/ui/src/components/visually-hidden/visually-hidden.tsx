import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { visuallyHiddenStyles } from "./visually-hidden.styles";

export type VisuallyHiddenProps = Omit<
	Closed<ComponentPropsWithRef<"span">>,
	"aria-hidden" | "children" | "data-slot" | "role"
> & { children: ReactNode };

export function VisuallyHidden({
	children,
	ref: forwardedRef,
	...rest
}: VisuallyHiddenProps) {
	for (const name of [
		"aria-hidden",
		"className",
		"data-slot",
		"role",
		"style",
	]) {
		Reflect.deleteProperty(rest, name);
	}

	return (
		<span
			{...rest}
			data-slot="visually-hidden"
			ref={forwardedRef}
			{...props(visuallyHiddenStyles.root)}
		>
			{children}
		</span>
	);
}
