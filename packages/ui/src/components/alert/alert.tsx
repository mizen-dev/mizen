import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { alertStyles } from "./alert.styles";

export type AlertVariant = "default" | "error" | "info" | "success" | "warning";

export type AlertProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
> & {
	variant?: AlertVariant;
};

export type AlertIconProps = Omit<
	ComponentPropsWithRef<"span">,
	"className" | "data-slot" | "style"
>;

export type AlertTitleProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type AlertDescriptionProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type AlertActionProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export function Alert({
	children,
	ref: forwardedRef,
	role = "alert",
	variant = "default",
	...rest
}: AlertProps) {
	return (
		<div
			{...rest}
			data-slot="alert"
			data-variant={variant}
			ref={forwardedRef}
			role={role}
			{...props(alertStyles.root, alertStyles[variant])}
		>
			{children}
		</div>
	);
}

export function AlertIcon({
	"aria-hidden": ariaHidden = true,
	children,
	ref: forwardedRef,
	...rest
}: AlertIconProps) {
	return (
		<span
			{...rest}
			aria-hidden={ariaHidden}
			data-slot="alert-icon"
			ref={forwardedRef}
			{...props(alertStyles.icon)}
		>
			{children}
		</span>
	);
}

export function AlertTitle({
	children,
	ref: forwardedRef,
	...rest
}: AlertTitleProps) {
	return (
		<div
			{...rest}
			data-slot="alert-title"
			ref={forwardedRef}
			{...props(alertStyles.title)}
		>
			{children}
		</div>
	);
}

export function AlertDescription({
	children,
	ref: forwardedRef,
	...rest
}: AlertDescriptionProps) {
	return (
		<div
			{...rest}
			data-slot="alert-description"
			ref={forwardedRef}
			{...props(alertStyles.description)}
		>
			{children}
		</div>
	);
}

export function AlertAction({
	children,
	ref: forwardedRef,
	...rest
}: AlertActionProps) {
	return (
		<div
			{...rest}
			data-slot="alert-action"
			ref={forwardedRef}
			{...props(alertStyles.action)}
		>
			{children}
		</div>
	);
}
