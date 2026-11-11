import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { typeRoles } from "../../styles/typography.styles";
import { sectionStyles } from "./section.styles";

type NativeSectionProps = ComponentPropsWithRef<"section">;
type NativeDivProps = ComponentPropsWithRef<"div">;
type NativeHeadingProps = ComponentPropsWithRef<"h2">;
type NativeParagraphProps = ComponentPropsWithRef<"p">;

export type SectionProps = Omit<
	NativeSectionProps,
	"className" | "role" | "style"
>;

export type SectionHeaderProps = Omit<
	NativeDivProps,
	"className" | "role" | "style"
>;

export type SectionTitleLevel = 2 | 3 | 4 | 5 | 6;

export type SectionTitleProps = Omit<
	NativeHeadingProps,
	"className" | "role" | "style"
> & {
	/** The heading level in the document outline. The look stays the same. */
	level?: SectionTitleLevel;
};

export type SectionDescriptionProps = Omit<
	NativeParagraphProps,
	"className" | "role" | "style"
>;

export type SectionActionProps = Omit<
	NativeDivProps,
	"className" | "role" | "style"
>;

const titleElements = {
	2: "h2",
	3: "h3",
	4: "h4",
	5: "h5",
	6: "h6",
} as const;

export function Section({
	children,
	ref: forwardedRef,
	...rest
}: SectionProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<section
			{...rest}
			data-slot="section"
			ref={forwardedRef}
			{...props(sectionStyles.base)}
		>
			{children}
		</section>
	);
}

export function SectionHeader({
	children,
	ref: forwardedRef,
	...rest
}: SectionHeaderProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-slot="section-header"
			ref={forwardedRef}
			{...props(sectionStyles.header)}
		>
			{children}
		</div>
	);
}

export function SectionTitle({
	children,
	level = 2,
	ref: forwardedRef,
	...rest
}: SectionTitleProps) {
	Reflect.deleteProperty(rest, "role");
	const Component = titleElements[level];

	return (
		<Component
			{...rest}
			data-slot="section-title"
			ref={forwardedRef}
			{...props(typeRoles.subheading, sectionStyles.title)}
		>
			{children}
		</Component>
	);
}

export function SectionDescription({
	children,
	ref: forwardedRef,
	...rest
}: SectionDescriptionProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<p
			{...rest}
			data-slot="section-description"
			ref={forwardedRef}
			{...props(sectionStyles.description)}
		>
			{children}
		</p>
	);
}

export function SectionAction({
	children,
	ref: forwardedRef,
	...rest
}: SectionActionProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<div
			{...rest}
			data-slot="section-action"
			ref={forwardedRef}
			{...props(sectionStyles.action)}
		>
			{children}
		</div>
	);
}
