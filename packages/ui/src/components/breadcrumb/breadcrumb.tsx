import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { controlLabel } from "../../control-label";
import { IconChevronRight, IconDots } from "../../icons";
import { breadcrumbStyles } from "./breadcrumb.styles";

export type { BreadcrumbLinkProps } from "./breadcrumb-link";
// biome-ignore lint/performance/noBarrelFile: Keep the link API beside the native breadcrumb anatomy.
export { BreadcrumbLink } from "./breadcrumb-link";

export type BreadcrumbProps = Closed<ComponentPropsWithRef<"nav">>;
export type BreadcrumbListProps = Closed<ComponentPropsWithRef<"ol">>;
export type BreadcrumbItemProps = Closed<ComponentPropsWithRef<"li">>;
export type BreadcrumbPageProps = Closed<ComponentPropsWithRef<"span">>;
export type BreadcrumbSeparatorProps = Closed<ComponentPropsWithRef<"li">>;
export type BreadcrumbEllipsisProps = Closed<ComponentPropsWithRef<"span">>;

function ChevronIcon() {
	return (
		<IconChevronRight
			aria-hidden="true"
			focusable="false"
			{...props(breadcrumbStyles.separatorIcon)}
			size="1em"
		/>
	);
}

export function Breadcrumb({
	"aria-label": ariaLabel = "breadcrumb",
	children,
	ref: forwardedRef,
	...rest
}: BreadcrumbProps) {
	return (
		<nav
			{...rest}
			aria-label={ariaLabel}
			data-slot="breadcrumb"
			ref={forwardedRef}
			{...props(breadcrumbStyles.root)}
		>
			{children}
		</nav>
	);
}

export function BreadcrumbList({
	children,
	ref: forwardedRef,
	...rest
}: BreadcrumbListProps) {
	return (
		<ol
			{...rest}
			data-slot="breadcrumb-list"
			ref={forwardedRef}
			{...props(breadcrumbStyles.list)}
		>
			{children}
		</ol>
	);
}

export function BreadcrumbItem({
	children,
	ref: forwardedRef,
	...rest
}: BreadcrumbItemProps) {
	return (
		<li
			{...rest}
			data-slot="breadcrumb-item"
			ref={forwardedRef}
			{...props(breadcrumbStyles.item, breadcrumbStyles.iconContent)}
		>
			{children}
		</li>
	);
}

export function BreadcrumbPage({
	children,
	ref: forwardedRef,
	...rest
}: BreadcrumbPageProps) {
	return (
		<span
			aria-current="page"
			{...rest}
			data-slot="breadcrumb-page"
			ref={forwardedRef}
			{...props(breadcrumbStyles.page, breadcrumbStyles.iconContent)}
		>
			{controlLabel(children)}
		</span>
	);
}

export function BreadcrumbSeparator({
	children,
	ref: forwardedRef,
	...rest
}: BreadcrumbSeparatorProps) {
	return (
		<li
			aria-hidden="true"
			role="presentation"
			{...rest}
			data-slot="breadcrumb-separator"
			ref={forwardedRef}
			{...props(breadcrumbStyles.separator, breadcrumbStyles.iconContent)}
		>
			{children ?? <ChevronIcon />}
		</li>
	);
}

export function BreadcrumbEllipsis({
	children: _children,
	ref: forwardedRef,
	...rest
}: BreadcrumbEllipsisProps) {
	return (
		<span
			aria-hidden="true"
			role="presentation"
			{...rest}
			data-slot="breadcrumb-ellipsis"
			ref={forwardedRef}
			{...props(breadcrumbStyles.ellipsis)}
		>
			<IconDots aria-hidden="true" focusable="false" size={16} />
		</span>
	);
}
