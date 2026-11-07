"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { controlLabel } from "../../control-label";
import { LoadingIndicator } from "../../loading-indicator";
import "./button.css";
import { buttonStyles } from "./button.styles";

type BaseButtonProps = ComponentPropsWithRef<typeof BaseButton>;
type AccessibleIconName =
	| { "aria-label": string; "aria-labelledby"?: string }
	| { "aria-label"?: string; "aria-labelledby": string };

export type ButtonVariant =
	| "brand"
	| "default"
	| "destructive"
	| "destructive-outline"
	| "ghost"
	| "link"
	| "outline"
	| "secondary";
export type ButtonSize =
	| "default"
	| "icon"
	| "icon-lg"
	| "icon-sm"
	| "icon-xl"
	| "icon-xs"
	| "lg"
	| "sm"
	| "xl"
	| "xs";

type SharedButtonProps = Omit<
	BaseButtonProps,
	"children" | "className" | "disabled" | "ref" | "style"
> & {
	children?: ReactNode;
	disabled?: boolean;
	loading?: boolean;
	ref?: BaseButtonProps["ref"];
	variant?: ButtonVariant;
};

export type ButtonProps = SharedButtonProps &
	(
		| {
				size?: Exclude<
					ButtonSize,
					"icon" | "icon-lg" | "icon-sm" | "icon-xl" | "icon-xs"
				>;
		  }
		| ({
				size: "icon" | "icon-lg" | "icon-sm" | "icon-xl" | "icon-xs";
		  } & AccessibleIconName)
	);

const sizeStyles = {
	default: buttonStyles.defaultSize,
	icon: buttonStyles.icon,
	"icon-lg": buttonStyles["icon-lg"],
	"icon-sm": buttonStyles["icon-sm"],
	"icon-xl": buttonStyles["icon-xl"],
	"icon-xs": buttonStyles["icon-xs"],
	lg: buttonStyles.lg,
	sm: buttonStyles.sm,
	xl: buttonStyles.xl,
	xs: buttonStyles.xs,
};

const loadingIndicatorStyles = {
	brand: buttonStyles.loadingIndicatorBrand,
	default: buttonStyles.loadingIndicatorDefault,
	destructive: buttonStyles.loadingIndicatorDestructive,
	"destructive-outline": buttonStyles.loadingIndicatorDestructiveOutline,
	ghost: buttonStyles.loadingIndicatorContent,
	link: buttonStyles.loadingIndicatorContent,
	outline: buttonStyles.loadingIndicatorContent,
	secondary: buttonStyles.loadingIndicatorSecondary,
};

const interactionStyles = {
	brand: buttonStyles.interactionBrand,
	default: buttonStyles.interactionFilled,
	destructive: buttonStyles.interactionDestructive,
	"destructive-outline": buttonStyles.interactionDestructiveOutline,
	ghost: buttonStyles.interactionGhost,
	link: buttonStyles.interactionLink,
	outline: buttonStyles.interactionOutline,
	secondary: buttonStyles.interactionSecondary,
};

function getButtonType(
	render: BaseButtonProps["render"],
	type: BaseButtonProps["type"]
) {
	return render ? type : (type ?? "button");
}

function getLoadingIndicatorStyle(variant: ButtonVariant) {
	return loadingIndicatorStyles[variant];
}

function getButtonInteractionStyles(
	isDisabled: boolean,
	variant: ButtonVariant
) {
	return isDisabled
		? [buttonStyles.disabled]
		: [buttonStyles.press, interactionStyles[variant]];
}

export function Button(buttonProps: ButtonProps) {
	const {
		children,
		disabled,
		loading = false,
		ref: forwardedRef,
		size = "default",
		variant = "default",
		...rest
	} = buttonProps;
	const isLoading = loading;
	const isDisabled = Boolean(disabled || isLoading);
	const sizeStyle = sizeStyles[size];
	const loadingIndicatorStyle = getLoadingIndicatorStyle(variant);
	const stateStyles = getButtonInteractionStyles(isDisabled, variant);
	const { render, type, ...nativeProps } = rest;

	return (
		<BaseButton
			data-slot="button"
			{...nativeProps}
			aria-busy={isLoading || undefined}
			data-loading={isLoading ? "" : undefined}
			disabled={isDisabled}
			focusableWhenDisabled={buttonProps.focusableWhenDisabled ?? isLoading}
			nativeButton={buttonProps.nativeButton}
			ref={forwardedRef}
			render={render}
			type={getButtonType(render, type)}
			{...props(
				buttonStyles.base,
				buttonStyles[variant],
				sizeStyle,
				buttonStyles.loading,
				isLoading && buttonStyles.loadingContent,
				...stateStyles
			)}
		>
			{controlLabel(children)}
			{isLoading ? (
				<LoadingIndicator
					aria-hidden="true"
					data-slot="button-loading-indicator"
					focusable={false}
					indicatorStyles={[
						buttonStyles.loadingIndicator,
						loadingIndicatorStyle,
					]}
				/>
			) : null}
		</BaseButton>
	);
}
