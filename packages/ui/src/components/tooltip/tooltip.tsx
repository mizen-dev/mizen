"use client";

import {
	Tooltip as BaseTooltip,
	type TooltipPopupProps as BaseTooltipPopupProps,
	type TooltipPortalProps as BaseTooltipPortalProps,
	type TooltipPositionerProps as BaseTooltipPositionerProps,
	type TooltipProviderProps as BaseTooltipProviderProps,
	type TooltipRootProps as BaseTooltipRootProps,
	type TooltipTriggerProps as BaseTooltipTriggerProps,
} from "@base-ui/react/tooltip";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { protectRenderSlot } from "../../render-utils";
import { tooltipStyles } from "./tooltip.styles";

type TooltipTriggerRef = ComponentPropsWithRef<
	typeof BaseTooltip.Trigger
>["ref"];
type TooltipPopupRef = ComponentPropsWithRef<typeof BaseTooltip.Popup>["ref"];

export type TooltipProps<Payload = unknown> = Closed<
	BaseTooltipRootProps<Payload>
>;
export type TooltipProviderProps = Closed<BaseTooltipProviderProps>;

export type TooltipTriggerProps<Payload = unknown> = Closed<
	Omit<BaseTooltipTriggerProps<Payload>, "ref"> & {
		ref?: TooltipTriggerRef;
	}
>;

export type TooltipPopupProps = Closed<
	Omit<BaseTooltipPopupProps, "ref"> & {
		align?: BaseTooltipPositionerProps["align"];
		anchor?: BaseTooltipPositionerProps["anchor"];
		portalProps?: Closed<BaseTooltipPortalProps>;
		ref?: TooltipPopupRef;
		side?: BaseTooltipPositionerProps["side"];
		sideOffset?: BaseTooltipPositionerProps["sideOffset"];
	}
>;

export const TooltipCreateHandle = BaseTooltip.createHandle;

export const Tooltip = BaseTooltip.Root;
export const TooltipPrimitive = BaseTooltip;
export const TooltipProvider = BaseTooltip.Provider;

export function TooltipTrigger<Payload = unknown>({
	ref: forwardedRef = undefined,
	render,
	type,
	...rest
}: TooltipTriggerProps<Payload>) {
	return (
		<BaseTooltip.Trigger
			{...rest}
			data-slot="tooltip-trigger"
			ref={forwardedRef}
			render={protectRenderSlot("tooltip-trigger", render)}
			type={render ? type : (type ?? "button")}
		/>
	);
}

export function TooltipPopup({
	align = "center",
	anchor,
	children,
	render,
	portalProps,
	ref: forwardedRef = undefined,
	side = "top",
	sideOffset = 4,
	...rest
}: TooltipPopupProps) {
	return (
		<BaseTooltip.Portal {...portalProps}>
			<BaseTooltip.Positioner
				align={align}
				anchor={anchor}
				data-slot="tooltip-positioner"
				side={side}
				sideOffset={sideOffset}
				{...props(tooltipStyles.positioner)}
			>
				<BaseTooltip.Popup
					{...rest}
					data-slot="tooltip-popup"
					ref={forwardedRef}
					render={protectRenderSlot("tooltip-popup", render)}
					{...props(tooltipStyles.popup)}
				>
					<BaseTooltip.Viewport
						data-slot="tooltip-viewport"
						{...props(tooltipStyles.viewport, tooltipStyles.viewportContent)}
					>
						{children}
					</BaseTooltip.Viewport>
				</BaseTooltip.Popup>
			</BaseTooltip.Positioner>
		</BaseTooltip.Portal>
	);
}
