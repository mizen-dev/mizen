import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { typeRoles } from "../../styles/typography.styles";
import { pageStyles } from "./page.styles";

type NativeDivProps = ComponentPropsWithRef<"div">;
type NativeHeadingProps = ComponentPropsWithRef<"h1">;
type NativeParagraphProps = ComponentPropsWithRef<"p">;

export type PageWidth = "full" | "narrow";

export type PageProps = Omit<NativeDivProps, "className" | "role" | "style"> & {
	/** `"narrow"` keeps a form or settings page in one readable column. */
	width?: PageWidth;
};

export type PageHeaderProps = Omit<
	NativeDivProps,
	"className" | "role" | "style"
>;

export type PageTitleProps = Omit<
	NativeHeadingProps,
	"className" | "role" | "style"
>;

export type PageDescriptionProps = Omit<
	NativeParagraphProps,
	"className" | "role" | "style"
>;

export type PageActionProps = Omit<
	NativeDivProps,
	"className" | "role" | "style"
>;

export function Page({
	children,
	ref: forwardedRef,
	width = "full",
	...rest
}: PageProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-slot="page"
			data-width={width}
			ref={forwardedRef}
			{...props(pageStyles.root, width === "narrow" && pageStyles.narrow)}
		>
			{children}
		</div>
	);
}

export function PageHeader({
	children,
	ref: forwardedRef,
	...rest
}: PageHeaderProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-slot="page-header"
			ref={forwardedRef}
			{...props(pageStyles.header)}
		>
			{children}
		</div>
	);
}

export function PageTitle({
	children,
	ref: forwardedRef,
	...rest
}: PageTitleProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<h1
			{...rest}
			data-slot="page-title"
			ref={forwardedRef}
			{...props(typeRoles.heading, pageStyles.title)}
		>
			{children}
		</h1>
	);
}

export function PageDescription({
	children,
	ref: forwardedRef,
	...rest
}: PageDescriptionProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<p
			{...rest}
			data-slot="page-description"
			ref={forwardedRef}
			{...props(pageStyles.description)}
		>
			{children}
		</p>
	);
}

export function PageAction({
	children,
	ref: forwardedRef,
	...rest
}: PageActionProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-slot="page-action"
			ref={forwardedRef}
			{...props(pageStyles.action)}
		>
			{children}
		</div>
	);
}
