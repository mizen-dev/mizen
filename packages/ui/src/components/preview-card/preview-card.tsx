"use client";

import {
	PreviewCard as BasePreviewCard,
	type PreviewCardPopupProps as BasePreviewCardPopupProps,
	type PreviewCardPortalProps as BasePreviewCardPortalProps,
	type PreviewCardPositionerProps as BasePreviewCardPositionerProps,
	type PreviewCardRootProps as BasePreviewCardRootProps,
	type PreviewCardTriggerProps as BasePreviewCardTriggerProps,
} from "@base-ui/react/preview-card";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { protectRenderSlot } from "../../render-utils";
import { previewCardStyles } from "./preview-card.styles";

type PreviewCardTriggerRef = ComponentPropsWithRef<
	typeof BasePreviewCard.Trigger
>["ref"];
type PreviewCardPopupRef = ComponentPropsWithRef<
	typeof BasePreviewCard.Popup
>["ref"];

export type PreviewCardProps<Payload = unknown> = Closed<
	BasePreviewCardRootProps<Payload>
>;

export type PreviewCardTriggerProps<Payload = unknown> = Closed<
	Omit<BasePreviewCardTriggerProps<Payload>, "ref"> & {
		ref?: PreviewCardTriggerRef;
	}
>;

export type PreviewCardPopupProps = Closed<
	Omit<BasePreviewCardPopupProps, "ref"> & {
		align?: BasePreviewCardPositionerProps["align"];
		anchor?: BasePreviewCardPositionerProps["anchor"];
		portalProps?: Closed<BasePreviewCardPortalProps>;
		ref?: PreviewCardPopupRef;
		sideOffset?: BasePreviewCardPositionerProps["sideOffset"];
	}
>;

export const PreviewCard = BasePreviewCard.Root;

export function PreviewCardTrigger<Payload = unknown>({
	ref: forwardedRef = undefined,
	render,
	...rest
}: PreviewCardTriggerProps<Payload>) {
	return (
		<BasePreviewCard.Trigger
			{...rest}
			data-slot="preview-card-trigger"
			ref={forwardedRef}
			render={protectRenderSlot("preview-card-trigger", render)}
		/>
	);
}

export function PreviewCardPopup({
	align = "center",
	anchor,
	children,
	render,
	portalProps,
	ref: forwardedRef = undefined,
	sideOffset = 4,
	...rest
}: PreviewCardPopupProps) {
	return (
		<BasePreviewCard.Portal {...portalProps}>
			<BasePreviewCard.Positioner
				align={align}
				anchor={anchor}
				data-slot="preview-card-positioner"
				sideOffset={sideOffset}
				{...props(previewCardStyles.positioner)}
			>
				<BasePreviewCard.Popup
					{...rest}
					data-slot="preview-card-content"
					ref={forwardedRef}
					render={protectRenderSlot("preview-card-content", render)}
					{...props(previewCardStyles.popup)}
				>
					{children}
				</BasePreviewCard.Popup>
			</BasePreviewCard.Positioner>
		</BasePreviewCard.Portal>
	);
}

export const PreviewCardPrimitive = BasePreviewCard;
