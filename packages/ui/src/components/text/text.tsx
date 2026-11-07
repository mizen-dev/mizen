import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { typeRoles } from "../../styles/typography.styles";
import { textStyles } from "./text.styles";

type NativeParagraphProps = ComponentPropsWithRef<"p">;

export type TextSize = "body" | "caption" | "ui";
export type TextTone = "default" | "muted";

export type TextProps = Omit<
	NativeParagraphProps,
	"className" | "role" | "style"
> & {
	size?: TextSize;
	/** Ink. Defaults to muted for `caption` and to content otherwise. */
	tone?: TextTone;
};

const sizeStyles = {
	body: typeRoles.body,
	caption: typeRoles.caption,
	ui: typeRoles.ui,
};

export function Text({
	children,
	ref: forwardedRef,
	size = "body",
	tone = size === "caption" ? "muted" : "default",
	...rest
}: TextProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<p
			{...rest}
			data-size={size}
			data-slot="text"
			data-tone={tone}
			ref={forwardedRef}
			{...props(textStyles.base, sizeStyles[size], textStyles[tone])}
		>
			{children}
		</p>
	);
}
