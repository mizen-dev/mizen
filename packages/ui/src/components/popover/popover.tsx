"use client";

import {
	Popover as BasePopover,
	type PopoverCloseProps as BasePopoverCloseProps,
	type PopoverDescriptionProps as BasePopoverDescriptionProps,
	type PopoverPopupProps as BasePopoverPopupProps,
	type PopoverPortalProps as BasePopoverPortalProps,
	type PopoverPositionerProps as BasePopoverPositionerProps,
	type PopoverRootProps as BasePopoverRootProps,
	type PopoverTitleProps as BasePopoverTitleProps,
	type PopoverTriggerProps as BasePopoverTriggerProps,
} from "@base-ui/react/popover";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { protectRenderSlot } from "../../render-utils";
import { popoverStyles } from "./popover.styles";

type PopoverTriggerRef = ComponentPropsWithRef<
	typeof BasePopover.Trigger
>["ref"];
type PopoverPopupRef = ComponentPropsWithRef<typeof BasePopover.Popup>["ref"];

export type PopoverProps<Payload = unknown> = Closed<
	BasePopoverRootProps<Payload>
>;

export type PopoverTriggerProps<Payload = unknown> = Closed<
	Omit<BasePopoverTriggerProps<Payload>, "ref"> & {
		ref?: PopoverTriggerRef;
	}
>;

export type PopoverPopupVariant = "default" | "bare";

export type PopoverPopupProps = Closed<
	Omit<BasePopoverPopupProps, "ref"> & {
		align?: BasePopoverPositionerProps["align"];
		alignOffset?: BasePopoverPositionerProps["alignOffset"];
		anchor?: BasePopoverPositionerProps["anchor"];
		portalProps?: Closed<BasePopoverPortalProps>;
		ref?: PopoverPopupRef;
		side?: BasePopoverPositionerProps["side"];
		sideOffset?: BasePopoverPositionerProps["sideOffset"];
		tooltipStyle?: boolean;
		variant?: PopoverPopupVariant;
	}
>;

export type PopoverTitleProps = Closed<BasePopoverTitleProps>;
export type PopoverDescriptionProps = Closed<BasePopoverDescriptionProps>;
export type PopoverCloseProps = Closed<BasePopoverCloseProps>;

export const PopoverCreateHandle = BasePopover.createHandle;

export const Popover = BasePopover.Root;
export const PopoverPrimitive = BasePopover;

export function PopoverTrigger<Payload = unknown>({
	ref: forwardedRef = undefined,
	render,
	type,
	...rest
}: PopoverTriggerProps<Payload>) {
	return (
		<BasePopover.Trigger
			{...rest}
			data-slot="popover-trigger"
			ref={forwardedRef}
			render={protectRenderSlot("popover-trigger", render)}
			type={render ? type : (type ?? "button")}
		/>
	);
}

function getPopoverStyles(variant: PopoverPopupVariant, tooltipStyle: boolean) {
	const bare = variant === "bare";
	return {
		popup: props(
			popoverStyles.popup,
			tooltipStyle && popoverStyles.popupTooltip,
			bare && popoverStyles.popupBare
		),
		positioner: props(
			popoverStyles.positioner,
			bare && popoverStyles.positionerBare
		),
		viewport: props(
			popoverStyles.viewport,
			popoverStyles.viewportContent,
			tooltipStyle && popoverStyles.viewportTooltip,
			tooltipStyle && popoverStyles.viewportContentTooltip,
			bare && popoverStyles.viewportBare,
			bare && popoverStyles.viewportContentBare
		),
	};
}

export function PopoverPopup({
	align = "center",
	alignOffset = 0,
	anchor,
	children,
	render,
	portalProps,
	ref: forwardedRef = undefined,
	side = "bottom",
	sideOffset = 4,
	tooltipStyle = false,
	variant = "default",
	...rest
}: PopoverPopupProps) {
	const styles = getPopoverStyles(variant, tooltipStyle);
	const Viewport = portalProps?.keepMounted ? "div" : BasePopover.Viewport;

	return (
		<BasePopover.Portal {...portalProps}>
			<BasePopover.Positioner
				align={align}
				alignOffset={alignOffset}
				anchor={anchor}
				data-slot="popover-positioner"
				side={side}
				sideOffset={sideOffset}
				{...styles.positioner}
			>
				<BasePopover.Popup
					{...rest}
					data-slot="popover-popup"
					ref={forwardedRef}
					render={protectRenderSlot("popover-popup", render)}
					{...styles.popup}
				>
					<Viewport data-slot="popover-viewport" {...styles.viewport}>
						{children}
					</Viewport>
				</BasePopover.Popup>
			</BasePopover.Positioner>
		</BasePopover.Portal>
	);
}

export function PopoverTitle({
	children,
	render,
	ref: forwardedRef,
	...rest
}: PopoverTitleProps) {
	return (
		<BasePopover.Title
			{...rest}
			data-slot="popover-title"
			ref={forwardedRef}
			render={protectRenderSlot("popover-title", render)}
			{...props(popoverStyles.title)}
		>
			{children}
		</BasePopover.Title>
	);
}

export function PopoverDescription({
	children,
	render,
	ref: forwardedRef,
	...rest
}: PopoverDescriptionProps) {
	return (
		<BasePopover.Description
			{...rest}
			data-slot="popover-description"
			ref={forwardedRef}
			render={protectRenderSlot("popover-description", render)}
			{...props(popoverStyles.description)}
		>
			{children}
		</BasePopover.Description>
	);
}

export function PopoverClose({
	ref: forwardedRef,
	render,
	type,
	...rest
}: PopoverCloseProps) {
	return (
		<BasePopover.Close
			{...rest}
			data-slot="popover-close"
			ref={forwardedRef}
			render={protectRenderSlot("popover-close", render)}
			type={render ? type : (type ?? "button")}
		/>
	);
}
