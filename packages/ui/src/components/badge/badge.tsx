"use client";

import { useRender } from "@base-ui/react/use-render";
import { props, type StyleXStyles } from "@stylexjs/stylex";
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
export type BadgeAppearance = "dot" | "soft";

export type BadgeProps = Omit<
	useRender.ComponentProps<"span">,
	"className" | "data-slot" | "style"
> & {
	/** How a status variant shows its color: a dot beside ink text, or a soft fill. Other variants ignore it. */
	appearance?: BadgeAppearance;
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

const softStyles: Partial<Record<BadgeVariant, StyleXStyles>> = {
	destructive: badgeStyles.softDestructive,
	info: badgeStyles.softInfo,
	success: badgeStyles.softSuccess,
	warning: badgeStyles.softWarning,
};

const sizeStyles = {
	default: badgeStyles.defaultSize,
	lg: badgeStyles.lg,
	sm: badgeStyles.sm,
};

export function Badge({
	appearance = "dot",
	children,
	ref: forwardedRef,
	render,
	size = "default",
	variant = "default",
	...rest
}: BadgeProps) {
	const normalizedRender = protectRenderSlot("badge", render);
	const soft = appearance === "soft" ? softStyles[variant] : undefined;

	return useRender({
		defaultTagName: "span",
		props: {
			...rest,
			children: controlLabel(children),
			"data-slot": "badge",
			...props(
				badgeStyles.base,
				soft ?? variantStyles[variant],
				sizeStyles[size]
			),
		},
		ref: forwardedRef,
		render: normalizedRender,
	});
}
