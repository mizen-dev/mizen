import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { statusDotStyles } from "./status-dot.styles";

type NativeSpanProps = ComponentPropsWithRef<"span">;

export type StatusDotVariant =
	| "success"
	| "warning"
	| "error"
	| "accent"
	| "neutral";

export type StatusDotProps = Omit<
	NativeSpanProps,
	| "aria-label"
	| "children"
	| "className"
	| "dangerouslySetInnerHTML"
	| "data-slot"
	| "role"
	| "style"
> & {
	label: string;
	variant: StatusDotVariant;
};

const variantStyles = {
	accent: statusDotStyles.accent,
	error: statusDotStyles.error,
	neutral: statusDotStyles.neutral,
	success: statusDotStyles.success,
	warning: statusDotStyles.warning,
};

export function StatusDot({
	label,
	ref: forwardedRef,
	variant,
	...rest
}: StatusDotProps) {
	Reflect.deleteProperty(rest, "children");
	Reflect.deleteProperty(rest, "dangerouslySetInnerHTML");

	return (
		<span
			{...rest}
			aria-label={label}
			data-slot="status-dot"
			ref={forwardedRef}
			role="img"
			{...props(statusDotStyles.base, variantStyles[variant])}
		/>
	);
}
