/// <reference path="../button/button.css.d.ts" />
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactElement } from "react";
import "./button-group.css";
import type { Closed } from "../../closed";
import { buttonGroupStyles } from "./button-group.styles";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"data-orientation" | "data-slot" | "role"
> & {
	orientation?: ButtonGroupOrientation;
};

export function ButtonGroup({
	children,
	orientation = "horizontal",
	ref: forwardedRef,
	...rest
}: ButtonGroupProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-orientation");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "role");
	Reflect.deleteProperty(rest, "style");

	return (
		// biome-ignore lint/a11y/useSemanticElements: This groups actions rather than form fields.
		<div
			{...rest}
			data-orientation={orientation}
			data-slot="button-group"
			ref={forwardedRef}
			role="group"
			{...props(
				buttonGroupStyles.base,
				orientation === "vertical"
					? buttonGroupStyles.vertical
					: buttonGroupStyles.horizontal
			)}
		>
			{children}
		</div>
	);
}
