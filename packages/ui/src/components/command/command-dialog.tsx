"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { props } from "@stylexjs/stylex";
import type { ReactElement, ReactNode } from "react";
import type { Closed } from "../../closed";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import { overlayLayerStyles } from "../../styles/overlay-layers.styles";
import { dialogStyles } from "../dialog/dialog.styles";
import type {
	CommandDialogBackdropProps,
	CommandDialogPopupProps,
	CommandDialogTriggerProps,
	CommandDialogViewportProps,
} from "./command.types";
import { commandDialogStyles } from "./command-dialog.styles";

export const CommandDialogPrimitive = BaseDialog;

export const CommandDialog = BaseDialog.Root;

export const CommandDialogPortal: (
	props: Closed<BaseDialog.Portal.Props>
) => ReactNode = BaseDialog.Portal;

export const CommandCreateHandle = BaseDialog.createHandle;

export function CommandDialogTrigger<Payload = unknown>({
	ref: forwardedRef = undefined,
	render,
	type,
	...rest
}: CommandDialogTriggerProps<Payload>): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<CommandDialogPrimitive.Trigger
			{...rest}
			data-slot="command-dialog-trigger"
			ref={forwardedRef}
			render={protectSlot("command-dialog-trigger", render)}
			type={render ? type : (type ?? "button")}
		/>
	);
}

export function CommandDialogBackdrop({
	ref: forwardedRef = undefined,
	render,
	...rest
}: CommandDialogBackdropProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<CommandDialogPrimitive.Backdrop
			{...rest}
			data-slot="command-dialog-backdrop"
			ref={forwardedRef}
			render={protectSlot("command-dialog-backdrop", render)}
			{...props(
				dialogStyles.backdrop,
				overlayLayerStyles.backdrop,
				commandDialogStyles.backdrop
			)}
		/>
	);
}

export function CommandDialogViewport({
	children,
	ref: forwardedRef = undefined,
	render,
	...rest
}: CommandDialogViewportProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<CommandDialogPrimitive.Viewport
			{...rest}
			data-slot="command-dialog-viewport"
			ref={forwardedRef}
			render={protectSlot("command-dialog-viewport", render)}
			{...props(commandDialogStyles.viewport)}
		>
			{children}
		</CommandDialogPrimitive.Viewport>
	);
}

export function CommandDialogPopup({
	children,
	portalProps,
	ref: forwardedRef = undefined,
	render,
	...rest
}: CommandDialogPopupProps): ReactElement {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<CommandDialogPortal
			{...portalProps}
			{...props(overlayLayerStyles.modalPortal)}
		>
			<CommandDialogBackdrop />
			<CommandDialogViewport>
				<CommandDialogPrimitive.Popup
					{...rest}
					data-slot="command-dialog-popup"
					ref={forwardedRef}
					render={protectSlot("command-dialog-popup", render)}
					{...props(dialogStyles.popup, commandDialogStyles.popup)}
				>
					{children}
				</CommandDialogPrimitive.Popup>
			</CommandDialogViewport>
		</CommandDialogPortal>
	);
}
