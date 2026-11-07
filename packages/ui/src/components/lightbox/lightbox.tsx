"use client";

import {
	Dialog as BaseDialog,
	type DialogDescriptionProps as BaseDialogDescriptionProps,
	type DialogPopupProps as BaseDialogPopupProps,
	type DialogTitleProps as BaseDialogTitleProps,
} from "@base-ui/react/dialog";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { IconX } from "../../icons";
import { overlayLayerStyles } from "../../styles/overlay-layers.styles";
import {
	Dialog,
	DialogClose,
	type DialogCloseProps,
	type DialogProps,
	DialogTrigger,
	type DialogTriggerProps,
} from "../dialog/dialog";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";
import { lightboxStyles } from "./lightbox.styles";

const blockedHostProps = new Set(["className", "data-slot", "role", "style"]);

export function guardHostProps(propsToGuard: object) {
	return Object.fromEntries(
		Object.entries(propsToGuard).filter(([name]) => !blockedHostProps.has(name))
	);
}

export type LightboxProps<Payload = unknown> = DialogProps<Payload>;
export type LightboxTriggerProps<Payload = unknown> =
	DialogTriggerProps<Payload>;
export type LightboxTitleProps = Closed<BaseDialogTitleProps>;
export type LightboxDescriptionProps = Closed<BaseDialogDescriptionProps>;
export type LightboxCloseProps = DialogCloseProps;
export type LightboxPopupProps = Omit<
	Closed<BaseDialogPopupProps>,
	"data-slot" | "render" | "role"
>;
export type LightboxImageProps = Omit<
	Closed<ComponentPropsWithRef<"img">>,
	"alt" | "data-slot" | "role" | "src"
> & {
	alt: string;
	src: string;
};

export const Lightbox = Dialog;
export const LightboxTrigger = DialogTrigger;
export const LightboxClose = DialogClose;

/** Names the overlay for assistive technology; the image speaks for itself on screen. */
export function LightboxTitle({
	ref: forwardedRef,
	...rest
}: LightboxTitleProps) {
	return (
		<BaseDialog.Title
			{...guardHostProps(rest)}
			data-slot="lightbox-title"
			ref={forwardedRef}
			{...props(visuallyHiddenStyles.root)}
		/>
	);
}

/** Describes the image for assistive technology, without covering it. */
export function LightboxDescription({
	ref: forwardedRef,
	...rest
}: LightboxDescriptionProps) {
	return (
		<BaseDialog.Description
			{...guardHostProps(rest)}
			data-slot="lightbox-description"
			ref={forwardedRef}
			{...props(visuallyHiddenStyles.root)}
		/>
	);
}

/**
 * A fullscreen overlay: the image sits frameless on a dark scrim, with Close
 * in the corner. Escape, the close button, and a click on the scrim dismiss it.
 */
export function LightboxPopup({
	children,
	ref: forwardedRef,
	...rest
}: LightboxPopupProps) {
	return (
		<BaseDialog.Portal {...props(overlayLayerStyles.modalPortal)}>
			<BaseDialog.Backdrop
				data-slot="lightbox-backdrop"
				{...props(lightboxStyles.backdrop)}
			/>
			<BaseDialog.Popup
				{...guardHostProps(rest)}
				data-slot="lightbox-popup"
				ref={forwardedRef}
				{...props(lightboxStyles.popup)}
			>
				<BaseDialog.Close
					aria-label="Close"
					data-slot="lightbox-close"
					{...props(lightboxStyles.control, lightboxStyles.close)}
				>
					<IconX aria-hidden="true" focusable="false" size={18} />
				</BaseDialog.Close>
				{children}
			</BaseDialog.Popup>
		</BaseDialog.Portal>
	);
}

export function LightboxImage({
	alt,
	ref: forwardedRef,
	src,
	...rest
}: LightboxImageProps) {
	return (
		// biome-ignore lint/correctness/useImageSize: callers may omit source dimensions; the image keeps intrinsic ratio and viewport bounds.
		// biome-ignore lint/performance/noImgElement: Lightbox uses native images so this package stays framework-neutral.
		<img
			{...guardHostProps(rest)}
			alt={alt}
			data-slot="lightbox-image"
			ref={forwardedRef}
			src={src}
			{...props(lightboxStyles.image)}
		/>
	);
}
