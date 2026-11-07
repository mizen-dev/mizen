"use client";

import { useRender } from "@base-ui/react/use-render";
import { props } from "@stylexjs/stylex";
import { controlLabel } from "../../control-label";
import { protectRenderSlot } from "../../render-utils";
import { badgeStyles } from "./badge.styles";

export type BadgeVariant =
	| "default"
	| "destructive"
	| "info"
	| "outline"
	| "secondary"
	| "success"
	| "warning"
	| "brand";
export type BadgeSize = "default" | "sm" | "lg";

export type BadgeProps = Omit<
	useRender.ComponentProps<"span">,
	"className" | "data-slot" | "style"
> & {
	size?: BadgeSize;
	variant?: BadgeVariant;
};

const variantStyles = {
	brand: badgeStyles.brand,
	default: badgeStyles.default,
	destructive: badgeStyles.destructive,
	info: badgeStyles.info,
	outline: badgeStyles.outline,
	secondary: badgeStyles.secondary,
	success: badgeStyles.success,
	warning: badgeStyles.warning,
};

const sizeStyles = {
	default: badgeStyles.defaultSize,
	lg: badgeStyles.lg,
	sm: badgeStyles.sm,
};

export function Badge({
	children,
	ref: forwardedRef,
	render,
	size = "default",
	variant = "default",
	...rest
}: BadgeProps) {
	const normalizedRender = protectRenderSlot("badge", render);

	return useRender({
		defaultTagName: "span",
		props: {
			...rest,
			children: controlLabel(children),
			"data-slot": "badge",
			...props(badgeStyles.base, variantStyles[variant], sizeStyles[size]),
		},
		ref: forwardedRef,
		render: normalizedRender,
	});
}
