import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { listStyles } from "./list.styles";

export type ListProps = Omit<
	Closed<ComponentPropsWithRef<"ul">>,
	"data-slot" | "role"
>;

export type ListItemProps = Omit<
	Closed<ComponentPropsWithRef<"li">>,
	"data-slot" | "role"
>;

export type ListContentProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"data-slot" | "role"
>;

export type ListActionsProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"data-slot" | "role"
>;

function stripReservedProps(rest: object) {
	for (const key of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, key);
	}
}

export function List({ children, ref: forwardedRef, ...rest }: ListProps) {
	stripReservedProps(rest);

	return (
		<ul
			{...rest}
			data-slot="list"
			ref={forwardedRef}
			// biome-ignore lint/a11y/noRedundantRoles: list markers are removed, which can hide list semantics in Safari.
			role="list"
			{...props(listStyles.root, typeRoles.body)}
		>
			{children}
		</ul>
	);
}

export function ListItem({
	children,
	ref: forwardedRef,
	...rest
}: ListItemProps) {
	stripReservedProps(rest);

	return (
		<li
			{...rest}
			data-slot="list-item"
			ref={forwardedRef}
			{...props(listStyles.item)}
		>
			{children}
		</li>
	);
}

export function ListContent({
	children,
	ref: forwardedRef,
	...rest
}: ListContentProps) {
	stripReservedProps(rest);

	return (
		<div
			{...rest}
			data-slot="list-content"
			ref={forwardedRef}
			{...props(listStyles.content)}
		>
			{children}
		</div>
	);
}

export function ListActions({
	children,
	ref: forwardedRef,
	...rest
}: ListActionsProps) {
	stripReservedProps(rest);

	return (
		<div
			{...rest}
			data-slot="list-actions"
			ref={forwardedRef}
			{...props(listStyles.actions)}
		>
			{children}
		</div>
	);
}
