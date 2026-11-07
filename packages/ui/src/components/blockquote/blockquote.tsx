import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { blockquoteStyles } from "./blockquote.styles";

type Part<T> = Omit<Closed<T>, "children" | "data-slot" | "role"> & {
	children: ReactNode;
};

export type BlockquoteProps = Part<ComponentPropsWithRef<"figure">>;
export type BlockquoteContentProps = Part<ComponentPropsWithRef<"blockquote">>;
export type BlockquoteAttributionProps = Part<
	ComponentPropsWithRef<"figcaption">
>;

function stripReservedProps(attributes: Record<string, unknown>) {
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(attributes, prop);
	}
}

export function Blockquote({
	children,
	ref: forwardedRef,
	...rest
}: BlockquoteProps) {
	stripReservedProps(rest);
	return (
		<figure
			{...rest}
			data-slot="blockquote"
			ref={forwardedRef}
			{...props(blockquoteStyles.root, typeRoles.body)}
		>
			{children}
		</figure>
	);
}

export function BlockquoteContent({
	children,
	ref: forwardedRef,
	...rest
}: BlockquoteContentProps) {
	stripReservedProps(rest);
	return (
		<blockquote
			{...rest}
			data-slot="blockquote-content"
			ref={forwardedRef}
			{...props(blockquoteStyles.content, typeRoles.body)}
		>
			{children}
		</blockquote>
	);
}

export function BlockquoteAttribution({
	children,
	ref: forwardedRef,
	...rest
}: BlockquoteAttributionProps) {
	stripReservedProps(rest);
	return (
		<figcaption
			{...rest}
			data-slot="blockquote-attribution"
			ref={forwardedRef}
			{...props(blockquoteStyles.attribution, typeRoles.body)}
		>
			{children}
		</figcaption>
	);
}
