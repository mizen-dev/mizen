import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import type { ListContentProps, ListItemProps } from "../list/list";
import { listStyles } from "../list/list.styles";
import { activityFeedStyles } from "./activity-feed.styles";

type ActivityFeedContentProps = ListContentProps;
type ActivityFeedItemProps = ListItemProps;
function ActivityFeedContent({ ref, ...rest }: ActivityFeedContentProps) {
	stripReservedProps(rest);
	return (
		<div
			{...rest}
			data-slot="activity-feed-content"
			ref={ref}
			{...props(activityFeedStyles.content)}
		/>
	);
}

export type ActivityFeedHeaderProps = ListContentProps;

export function ActivityFeedHeader({ ref, ...rest }: ActivityFeedHeaderProps) {
	stripReservedProps(rest);
	return (
		<div
			{...rest}
			data-slot="activity-feed-header"
			ref={ref}
			{...props(activityFeedStyles.header)}
		/>
	);
}

export type ActivityFeedMediaProps = ListContentProps;
export type ActivityFeedSummaryProps = Omit<
	Closed<ComponentPropsWithRef<"p">>,
	"data-slot" | "role"
>;
export type ActivityFeedDescriptionProps = ActivityFeedSummaryProps;
export type ActivityFeedDetailsProps = ListContentProps;

export function ActivityFeedMedia({ ref, ...rest }: ActivityFeedMediaProps) {
	stripReservedProps(rest);
	return (
		<div
			{...rest}
			data-slot="activity-feed-media"
			ref={ref}
			{...props(activityFeedStyles.media)}
		/>
	);
}
export function ActivityFeedSummary({
	ref,
	...rest
}: ActivityFeedSummaryProps) {
	stripReservedProps(rest);
	return (
		<p
			{...rest}
			data-slot="activity-feed-summary"
			ref={ref}
			{...props(typeRoles.body, activityFeedStyles.summary)}
		/>
	);
}
export function ActivityFeedDescription({
	ref,
	...rest
}: ActivityFeedDescriptionProps) {
	stripReservedProps(rest);
	return (
		<p
			{...rest}
			data-slot="activity-feed-description"
			ref={ref}
			{...props(typeRoles.ui, activityFeedStyles.description)}
		/>
	);
}
export function ActivityFeedDetails({
	ref,
	...rest
}: ActivityFeedDetailsProps) {
	stripReservedProps(rest);
	return (
		<div
			{...rest}
			data-slot="activity-feed-details"
			ref={ref}
			{...props(typeRoles.body, activityFeedStyles.details)}
		/>
	);
}

function ActivityFeedItem({
	children,
	ref: forwardedRef,
	...rest
}: ActivityFeedItemProps) {
	stripReservedProps(rest);

	return (
		<li
			{...rest}
			data-slot="activity-feed-item"
			ref={forwardedRef}
			{...props(activityFeedStyles.item)}
		>
			{children}
		</li>
	);
}

export type { ActivityFeedContentProps, ActivityFeedItemProps };
export { ActivityFeedContent, ActivityFeedItem };

export type ActivityFeedProps = Omit<
	Closed<ComponentPropsWithRef<"ol">>,
	"data-slot" | "role"
> & { variant?: "default" | "timeline" };

export type ActivityFeedTimeProps = Omit<
	Closed<ComponentPropsWithRef<"time">>,
	"children" | "data-slot" | "dateTime" | "role"
> & {
	children: ReactNode;
	dateTime: string;
};

function stripReservedProps(rest: object) {
	for (const key of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, key);
	}
}

export function ActivityFeed({
	children,
	variant = "default",
	ref: forwardedRef,
	...rest
}: ActivityFeedProps) {
	stripReservedProps(rest);

	return (
		<ol
			{...rest}
			data-slot="activity-feed"
			data-variant={variant}
			ref={forwardedRef}
			// biome-ignore lint/a11y/noRedundantRoles: list markers are removed, which can hide list semantics in Safari.
			role="list"
			{...props(listStyles.root, typeRoles.body, activityFeedStyles.root)}
		>
			{children}
		</ol>
	);
}

export function ActivityFeedTime({
	children,
	dateTime,
	ref: forwardedRef,
	...rest
}: ActivityFeedTimeProps) {
	stripReservedProps(rest);

	return (
		<time
			{...rest}
			data-slot="activity-feed-time"
			dateTime={dateTime}
			ref={forwardedRef}
			{...props(typeRoles.ui, activityFeedStyles.time)}
		>
			{children}
		</time>
	);
}
