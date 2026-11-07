"use client";

import {
	AlertDialog as BaseAlertDialog,
	type AlertDialogCloseProps as BaseAlertDialogCloseProps,
	type AlertDialogDescriptionProps as BaseAlertDialogDescriptionProps,
	type AlertDialogPopupProps as BaseAlertDialogPopupProps,
	type AlertDialogPortalProps as BaseAlertDialogPortalProps,
	type AlertDialogRootProps as BaseAlertDialogRootProps,
	type AlertDialogTitleProps as BaseAlertDialogTitleProps,
	type AlertDialogTriggerProps as BaseAlertDialogTriggerProps,
} from "@base-ui/react/alert-dialog";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { overlayLayerStyles } from "../../styles/overlay-layers.styles";
import { dialogStyles } from "../dialog/dialog.styles";
import { alertDialogStyles } from "./alert-dialog.styles";

type Closed<T> = Omit<T, "className" | "style">;
type DivProps = Omit<ComponentPropsWithRef<"div">, "className" | "style">;
type AlertDialogTriggerRef = ComponentPropsWithRef<
	typeof BaseAlertDialog.Trigger
>["ref"];
type AlertDialogPopupRef = ComponentPropsWithRef<
	typeof BaseAlertDialog.Popup
>["ref"];

export type AlertDialogProps<Payload = unknown> =
	BaseAlertDialogRootProps<Payload>;

export type AlertDialogTriggerProps<Payload = unknown> = Omit<
	BaseAlertDialogTriggerProps<Payload>,
	"className" | "ref" | "style"
> & {
	ref?: AlertDialogTriggerRef;
};

export type AlertDialogPopupProps = Omit<
	BaseAlertDialogPopupProps,
	"className" | "ref" | "render" | "style"
> & {
	portalProps?: Omit<
		BaseAlertDialogPortalProps,
		"children" | "className" | "ref" | "render" | "style"
	>;
	ref?: AlertDialogPopupRef;
};

export type AlertDialogTitleProps = Closed<BaseAlertDialogTitleProps>;
export type AlertDialogDescriptionProps =
	Closed<BaseAlertDialogDescriptionProps>;
export type AlertDialogCloseProps = Omit<
	BaseAlertDialogCloseProps,
	"className" | "style"
>;
export type AlertDialogHeaderProps = DivProps;
export type AlertDialogFooterProps = DivProps;

export const AlertDialogCreateHandle = BaseAlertDialog.createHandle;

export function AlertDialog<Payload = unknown>(
	rootProps: AlertDialogProps<Payload>
) {
	return <BaseAlertDialog.Root {...rootProps} />;
}

export function AlertDialogTrigger<Payload = unknown>({
	ref: forwardedRef = undefined,
	render,
	type,
	...rest
}: AlertDialogTriggerProps<Payload>) {
	return (
		<BaseAlertDialog.Trigger
			{...rest}
			ref={forwardedRef}
			render={render}
			type={render ? type : (type ?? "button")}
		/>
	);
}

export function AlertDialogPopup({
	children,
	portalProps,
	ref: forwardedRef = undefined,
	...rest
}: AlertDialogPopupProps) {
	return (
		<BaseAlertDialog.Portal
			{...portalProps}
			{...props(overlayLayerStyles.modalPortal)}
		>
			<BaseAlertDialog.Backdrop
				data-slot="alert-dialog-backdrop"
				{...props(dialogStyles.backdrop, overlayLayerStyles.backdrop)}
			/>
			<BaseAlertDialog.Viewport
				data-slot="alert-dialog-viewport"
				{...props(dialogStyles.viewport, overlayLayerStyles.modalViewport)}
			>
				<BaseAlertDialog.Popup
					{...rest}
					data-slot="alert-dialog-popup"
					ref={forwardedRef}
					{...props(dialogStyles.popup, alertDialogStyles.popup)}
				>
					{children}
				</BaseAlertDialog.Popup>
			</BaseAlertDialog.Viewport>
		</BaseAlertDialog.Portal>
	);
}

export function AlertDialogHeader({
	children,
	ref: forwardedRef,
	...rest
}: AlertDialogHeaderProps) {
	return (
		<div
			{...rest}
			data-slot="alert-dialog-header"
			ref={forwardedRef}
			{...props(alertDialogStyles.header)}
		>
			{children}
		</div>
	);
}

export function AlertDialogTitle({
	children,
	ref: forwardedRef,
	...rest
}: AlertDialogTitleProps) {
	return (
		<BaseAlertDialog.Title
			{...rest}
			data-slot="alert-dialog-title"
			ref={forwardedRef}
			{...props(dialogStyles.title, alertDialogStyles.title)}
		>
			{children}
		</BaseAlertDialog.Title>
	);
}

export function AlertDialogDescription({
	children,
	ref: forwardedRef,
	...rest
}: AlertDialogDescriptionProps) {
	return (
		<BaseAlertDialog.Description
			{...rest}
			data-slot="alert-dialog-description"
			ref={forwardedRef}
			{...props(dialogStyles.description, alertDialogStyles.description)}
		>
			{children}
		</BaseAlertDialog.Description>
	);
}

export function AlertDialogFooter({
	children,
	ref: forwardedRef,
	...rest
}: AlertDialogFooterProps) {
	return (
		<div
			{...rest}
			data-slot="alert-dialog-footer"
			ref={forwardedRef}
			{...props(dialogStyles.footer, alertDialogStyles.footer)}
		>
			{children}
		</div>
	);
}

export function AlertDialogClose({
	ref: forwardedRef,
	render,
	type,
	...rest
}: AlertDialogCloseProps) {
	return (
		<BaseAlertDialog.Close
			{...rest}
			ref={forwardedRef}
			render={render}
			type={render ? type : (type ?? "button")}
		/>
	);
}
