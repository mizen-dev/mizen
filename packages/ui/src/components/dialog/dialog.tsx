"use client";

import {
	Dialog as BaseDialog,
	type DialogCloseProps as BaseDialogCloseProps,
	type DialogDescriptionProps as BaseDialogDescriptionProps,
	type DialogPopupProps as BaseDialogPopupProps,
	type DialogPortalProps as BaseDialogPortalProps,
	type DialogRootProps as BaseDialogRootProps,
	type DialogTitleProps as BaseDialogTitleProps,
	type DialogTriggerProps as BaseDialogTriggerProps,
} from "@base-ui/react/dialog";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { IconX } from "../../icons";
import { overlayLayerStyles } from "../../styles/overlay-layers.styles";
import { dialogStyles } from "./dialog.styles";

type Closed<T> = Omit<T, "className" | "style">;
type DivProps = Omit<ComponentPropsWithRef<"div">, "className" | "style">;
type DialogTriggerRef = ComponentPropsWithRef<typeof BaseDialog.Trigger>["ref"];
type DialogPopupRef = ComponentPropsWithRef<typeof BaseDialog.Popup>["ref"];

export type DialogSize = "sm" | "md" | "lg" | "xl";
export type DialogProps<Payload = unknown> = BaseDialogRootProps<Payload>;
export type DialogTriggerProps<Payload = unknown> = Omit<
	BaseDialogTriggerProps<Payload>,
	"className" | "ref" | "style"
> & {
	ref?: DialogTriggerRef;
};
export type DialogPopupProps = Omit<
	BaseDialogPopupProps,
	"className" | "ref" | "render" | "style"
> & {
	portalProps?: Omit<
		BaseDialogPortalProps,
		"children" | "className" | "ref" | "render" | "style"
	>;
	ref?: DialogPopupRef;
	showCloseButton?: boolean;
	size?: DialogSize;
};
export type DialogTitleProps = Closed<BaseDialogTitleProps>;
export type DialogDescriptionProps = Closed<BaseDialogDescriptionProps>;
export type DialogCloseProps = Omit<
	BaseDialogCloseProps,
	"className" | "style"
>;
export type DialogHeaderProps = DivProps;
export type DialogPanelProps = DivProps;
export type DialogFooterProps = DivProps;

const sizeStyles = {
	lg: dialogStyles.popupLg,
	md: dialogStyles.popupMd,
	sm: dialogStyles.popupSm,
	xl: dialogStyles.popupXl,
};

function CloseIcon() {
	return <IconX aria-hidden="true" focusable="false" size="16" />;
}

export const DialogCreateHandle = BaseDialog.createHandle;

export function Dialog<Payload = unknown>(rootProps: DialogProps<Payload>) {
	return <BaseDialog.Root {...rootProps} />;
}

export function DialogTrigger<Payload = unknown>({
	ref: forwardedRef = undefined,
	render,
	type,
	...rest
}: DialogTriggerProps<Payload>) {
	return (
		<BaseDialog.Trigger
			{...rest}
			ref={forwardedRef}
			render={render}
			type={render ? type : (type ?? "button")}
		/>
	);
}

export function DialogPopup({
	children,
	portalProps,
	ref: forwardedRef = undefined,
	showCloseButton = true,
	size = "md",
	...rest
}: DialogPopupProps) {
	return (
		<BaseDialog.Portal
			{...portalProps}
			{...props(overlayLayerStyles.modalPortal)}
		>
			<BaseDialog.Backdrop
				data-slot="dialog-backdrop"
				{...props(dialogStyles.backdrop, overlayLayerStyles.backdrop)}
			/>
			<BaseDialog.Viewport
				data-slot="dialog-viewport"
				{...props(dialogStyles.viewport, overlayLayerStyles.modalViewport)}
			>
				<BaseDialog.Popup
					{...rest}
					data-slot="dialog-popup"
					ref={forwardedRef}
					{...props(dialogStyles.popup, sizeStyles[size])}
				>
					{showCloseButton ? (
						<BaseDialog.Close
							aria-label="Close"
							data-slot="dialog-default-close"
							{...props(dialogStyles.close)}
						>
							<CloseIcon />
						</BaseDialog.Close>
					) : null}
					{children}
				</BaseDialog.Popup>
			</BaseDialog.Viewport>
		</BaseDialog.Portal>
	);
}

export function DialogTitle({
	children,
	ref: forwardedRef,
	...rest
}: DialogTitleProps) {
	return (
		<BaseDialog.Title
			{...rest}
			ref={forwardedRef}
			{...props(dialogStyles.title)}
		>
			{children}
		</BaseDialog.Title>
	);
}

export function DialogDescription({
	children,
	ref: forwardedRef,
	...rest
}: DialogDescriptionProps) {
	return (
		<BaseDialog.Description
			{...rest}
			ref={forwardedRef}
			{...props(dialogStyles.description)}
		>
			{children}
		</BaseDialog.Description>
	);
}

export function DialogClose({
	ref: forwardedRef,
	render,
	type,
	...rest
}: DialogCloseProps) {
	return (
		<BaseDialog.Close
			{...rest}
			ref={forwardedRef}
			render={render}
			type={render ? type : (type ?? "button")}
		/>
	);
}

export function DialogHeader({
	children,
	ref: forwardedRef,
	...rest
}: DialogHeaderProps) {
	return (
		<div
			{...rest}
			data-slot="dialog-header"
			ref={forwardedRef}
			{...props(dialogStyles.header)}
		>
			{children}
		</div>
	);
}

export function DialogPanel({
	children,
	ref: forwardedRef,
	...rest
}: DialogPanelProps) {
	return (
		<div
			{...rest}
			data-slot="dialog-panel"
			ref={forwardedRef}
			{...props(dialogStyles.panel)}
		>
			{children}
		</div>
	);
}

export function DialogFooter({
	children,
	ref: forwardedRef,
	...rest
}: DialogFooterProps) {
	return (
		<div
			{...rest}
			data-slot="dialog-footer"
			ref={forwardedRef}
			{...props(dialogStyles.footer)}
		>
			{children}
		</div>
	);
}
