import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { emptyStyles } from "./empty.styles";

export type EmptyMediaVariant = "default" | "icon";

export type EmptyProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type EmptyHeaderProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "style"
>;

export type EmptyMediaProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "data-slot" | "data-variant" | "style"
> & {
	variant?: EmptyMediaVariant;
};

export type EmptyTitleProps = Omit<
	ComponentPropsWithRef<"h3">,
	"className" | "data-slot" | "style"
> & {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
};

export type EmptyDescriptionProps = Omit<
	ComponentPropsWithRef<"p">,
	"className" | "data-slot" | "style"
>;

export type EmptyContentProps = Omit<
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

export function Empty({ children, ref: forwardedRef, ...rest }: EmptyProps) {
	return (
		<div
			{...rest}
			data-slot="empty"
			ref={forwardedRef}
			{...props(emptyStyles.root)}
		>
			{children}
		</div>
	);
}

export function EmptyHeader({
	children,
	ref: forwardedRef,
	...rest
}: EmptyHeaderProps) {
	return (
		<div
			{...rest}
			data-slot="empty-header"
			ref={forwardedRef}
			{...props(emptyStyles.header)}
		>
			{children}
		</div>
	);
}

export function EmptyMedia({
	"aria-hidden": ariaHidden = true,
	children,
	ref: forwardedRef,
	variant = "default",
	...rest
}: EmptyMediaProps) {
	return (
		<div
			{...rest}
			aria-hidden={ariaHidden}
			data-slot="empty-media"
			data-variant={variant}
			ref={forwardedRef}
			{...props(emptyStyles.media)}
		>
			{variant === "icon" ? (
				<>
					<div
						aria-hidden="true"
						{...props(
							emptyStyles.mediaCard,
							emptyStyles.mediaBackCard,
							emptyStyles.mediaBackCardLeft
						)}
					/>
					<div
						aria-hidden="true"
						{...props(
							emptyStyles.mediaCard,
							emptyStyles.mediaBackCard,
							emptyStyles.mediaBackCardRight
						)}
					/>
					<div {...props(emptyStyles.mediaCard)}>{children}</div>
				</>
			) : (
				children
			)}
		</div>
	);
}

export function EmptyTitle({
	children,
	level = 3,
	ref: forwardedRef,
	...rest
}: EmptyTitleProps) {
	const Component = headingElements[level];

	return (
		<Component
			{...rest}
			data-slot="empty-title"
			ref={forwardedRef}
			{...props(emptyStyles.title)}
		>
			{children}
		</Component>
	);
}

export function EmptyDescription({
	children,
	ref: forwardedRef,
	...rest
}: EmptyDescriptionProps) {
	return (
		<p
			{...rest}
			data-slot="empty-description"
			ref={forwardedRef}
			{...props(emptyStyles.description)}
		>
			{children}
		</p>
	);
}

export function EmptyContent({
	children,
	ref: forwardedRef,
	...rest
}: EmptyContentProps) {
	return (
		<div
			{...rest}
			data-slot="empty-content"
			ref={forwardedRef}
			{...props(emptyStyles.content)}
		>
			{children}
		</div>
	);
}
