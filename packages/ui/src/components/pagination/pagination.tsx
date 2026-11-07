import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { IconChevronLeft, IconChevronRight } from "../../icons";
import { paginationStyles } from "./pagination.styles";
import { PaginationLink, type PaginationLinkProps } from "./pagination-link";

export type { PaginationLinkProps } from "./pagination-link";
// biome-ignore lint/performance/noBarrelFile: Keep the link API beside the native pagination anatomy.
export { PaginationLink } from "./pagination-link";

type Part<T> = Omit<Closed<T>, "data-slot" | "role">;

export type PaginationProps = Omit<
	Part<ComponentPropsWithRef<"nav">>,
	"aria-label"
> & {
	"aria-label"?: string;
};
export type PaginationContentProps = Part<ComponentPropsWithRef<"ul">>;
export type PaginationItemProps = Part<ComponentPropsWithRef<"li">>;
export type PaginationPreviousProps = Omit<
	PaginationLinkProps,
	"children" | "active"
> & {
	children?: ReactNode;
};
export type PaginationNextProps = PaginationPreviousProps;
export type PaginationEllipsisProps = Part<ComponentPropsWithRef<"span">>;

function stripClosedProps<T extends object>(target: T): T {
	Reflect.deleteProperty(target, "className");
	Reflect.deleteProperty(target, "data-slot");
	Reflect.deleteProperty(target, "role");
	Reflect.deleteProperty(target, "style");
	return target;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
	return direction === "left" ? (
		<IconChevronLeft
			aria-hidden="true"
			focusable="false"
			{...props(paginationStyles.icon)}
			size={16}
		/>
	) : (
		<IconChevronRight
			aria-hidden="true"
			focusable="false"
			{...props(paginationStyles.icon)}
			size={16}
		/>
	);
}

export function Pagination({
	"aria-label": ariaLabel = "Pagination",
	children,
	ref: forwardedRef,
	...rest
}: PaginationProps) {
	stripClosedProps(rest);
	return (
		<nav
			{...rest}
			aria-label={ariaLabel}
			data-slot="pagination"
			ref={forwardedRef}
			{...props(paginationStyles.root)}
		>
			{children}
		</nav>
	);
}

export function PaginationContent({
	children,
	ref: forwardedRef,
	...rest
}: PaginationContentProps) {
	stripClosedProps(rest);
	return (
		<ul
			{...rest}
			data-slot="pagination-content"
			ref={forwardedRef}
			{...props(paginationStyles.content)}
		>
			{children}
		</ul>
	);
}

export function PaginationItem({
	children,
	ref: forwardedRef,
	...rest
}: PaginationItemProps) {
	stripClosedProps(rest);
	return (
		<li
			{...rest}
			data-slot="pagination-item"
			ref={forwardedRef}
			{...props(paginationStyles.item)}
		>
			{children}
		</li>
	);
}

export function PaginationPrevious({
	children = "Previous",
	...rest
}: PaginationPreviousProps) {
	return (
		<PaginationLink aria-label="Go to previous page" size="default" {...rest}>
			<Chevron direction="left" />
			<span {...props(paginationStyles.directionLabel)}>{children}</span>
		</PaginationLink>
	);
}

export function PaginationNext({
	children = "Next",
	...rest
}: PaginationNextProps) {
	return (
		<PaginationLink aria-label="Go to next page" size="default" {...rest}>
			<span {...props(paginationStyles.directionLabel)}>{children}</span>
			<Chevron direction="right" />
		</PaginationLink>
	);
}

export function PaginationEllipsis({
	ref: forwardedRef,
	...rest
}: PaginationEllipsisProps) {
	stripClosedProps(rest);
	return (
		<span
			{...rest}
			data-slot="pagination-ellipsis"
			ref={forwardedRef}
			{...props(paginationStyles.ellipsis)}
		>
			<span aria-hidden="true">…</span>
			<span {...props(paginationStyles.srOnly)}>More pages</span>
		</span>
	);
}
