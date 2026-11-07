import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { errorStateStyles } from "./error-state.styles";

export type ErrorStateProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type ErrorStateHeaderProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type ErrorStateMediaProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type ErrorStateTitleProps = Omit<
	ComponentPropsWithRef<"h3">,
	"className" | "data-slot" | "style"
> & {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
};

export type ErrorStateDescriptionProps = Omit<
	ComponentPropsWithRef<"p">,
	"className" | "data-slot" | "style"
>;

export type ErrorStateContentProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

const headingElements = {
	1: "h1",
	2: "h2",
	3: "h3",
	4: "h4",
	5: "h5",
	6: "h6",
} as const;

export function ErrorState({
	children,
	ref: forwardedRef,
	...rest
}: ErrorStateProps) {
	return (
		<div
			{...rest}
			data-slot="error-state"
			ref={forwardedRef}
			{...props(errorStateStyles.root)}
		>
			{children}
		</div>
	);
}

export function ErrorStateHeader({
	children,
	ref: forwardedRef,
	...rest
}: ErrorStateHeaderProps) {
	return (
		<div
			{...rest}
			data-slot="error-state-header"
			ref={forwardedRef}
			{...props(errorStateStyles.header)}
		>
			{children}
		</div>
	);
}

export function ErrorStateMedia({
	"aria-hidden": ariaHidden = true,
	children,
	ref: forwardedRef,
	...rest
}: ErrorStateMediaProps) {
	return (
		<div
			{...rest}
			aria-hidden={ariaHidden}
			data-slot="error-state-media"
			ref={forwardedRef}
			{...props(errorStateStyles.media)}
		>
			{children}
		</div>
	);
}

export function ErrorStateTitle({
	children,
	level = 3,
	ref: forwardedRef,
	...rest
}: ErrorStateTitleProps) {
	const Component = headingElements[level];

	return (
		<Component
			{...rest}
			data-slot="error-state-title"
			ref={forwardedRef}
			{...props(errorStateStyles.title)}
		>
			{children}
		</Component>
	);
}

export function ErrorStateDescription({
	children,
	ref: forwardedRef,
	...rest
}: ErrorStateDescriptionProps) {
	return (
		<p
			{...rest}
			data-slot="error-state-description"
			ref={forwardedRef}
			{...props(errorStateStyles.description)}
		>
			{children}
		</p>
	);
}

export function ErrorStateContent({
	children,
	ref: forwardedRef,
	...rest
}: ErrorStateContentProps) {
	return (
		<div
			{...rest}
			data-slot="error-state-content"
			ref={forwardedRef}
			{...props(errorStateStyles.content)}
		>
			{children}
		</div>
	);
}
