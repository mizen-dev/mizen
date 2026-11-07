"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { protectRenderSlot } from "../../render-utils";
import { Button } from "../button/button";
import { collapsibleStyles } from "./collapsible.styles";

type BaseCollapsibleRootProps = ComponentPropsWithRef<
	typeof BaseCollapsible.Root
>;
type BaseCollapsibleTriggerProps = ComponentPropsWithRef<
	typeof BaseCollapsible.Trigger
>;
type BaseCollapsiblePanelProps = ComponentPropsWithRef<
	typeof BaseCollapsible.Panel
>;

export type CollapsibleProps = Omit<
	BaseCollapsibleRootProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseCollapsibleRootProps["ref"];
};

export type CollapsibleTriggerProps = Omit<
	BaseCollapsibleTriggerProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseCollapsibleTriggerProps["ref"];
};

export type CollapsiblePanelProps = Omit<
	BaseCollapsiblePanelProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseCollapsiblePanelProps["ref"];
};

export function Collapsible({
	ref: forwardedRef,
	render,
	...rest
}: CollapsibleProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseCollapsible.Root
			{...rest}
			data-slot="collapsible"
			ref={forwardedRef}
			render={protectRenderSlot("collapsible", render)}
		/>
	);
}

export function CollapsibleTrigger({
	ref: forwardedRef,
	render,
	...rest
}: CollapsibleTriggerProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseCollapsible.Trigger
			{...rest}
			data-slot="collapsible-trigger"
			ref={forwardedRef}
			render={protectRenderSlot(
				"collapsible-trigger",
				render ?? <Button variant="ghost" />
			)}
		/>
	);
}

export function CollapsiblePanel({
	children,
	ref: forwardedRef,
	render,
	...rest
}: CollapsiblePanelProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseCollapsible.Panel
			{...rest}
			data-slot="collapsible-panel"
			ref={forwardedRef}
			render={protectRenderSlot("collapsible-panel", render)}
			{...props(collapsibleStyles.panel)}
		>
			<div
				data-slot="collapsible-content"
				{...props(collapsibleStyles.content)}
			>
				{children}
			</div>
		</BaseCollapsible.Panel>
	);
}
export const CollapsiblePrimitive = BaseCollapsible;
