"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { props } from "@stylexjs/stylex";
import { IconX } from "../../icons";
import { overlayLayerStyles } from "../../styles/overlay-layers.styles";
import { sheetStyles } from "./sheet.styles";
import type {
	SheetCloseProps,
	SheetDescriptionProps,
	SheetFooterProps,
	SheetHeaderProps,
	SheetPanelProps,
	SheetPopupProps,
	SheetProps,
	SheetTitleProps,
	SheetTriggerProps,
} from "./sheet.types";
import {
	SheetFooter as LayoutSheetFooter,
	SheetHeader as LayoutSheetHeader,
	SheetPanel as LayoutSheetPanel,
} from "./sheet-layout";
import {
	popupSideStyles,
	sheetPositionsStyles,
	viewportSideStyles,
} from "./sheet-positions.styles";

export type {
	SheetCloseProps,
	SheetContentProps,
	SheetDescriptionProps,
	SheetFooterProps,
	SheetHeaderProps,
	SheetPanelProps,
	SheetPopupProps,
	SheetProps,
	SheetSide,
	SheetTitleProps,
	SheetTriggerProps,
	SheetVariant,
} from "./sheet.types";

export const SheetPrimitive = BaseDialog;
export const SheetCreateHandle = BaseDialog.createHandle;

function CloseIcon() {
	return <IconX aria-hidden="true" focusable="false" size="16" />;
}

export function Sheet<Payload = unknown>(rootProps: SheetProps<Payload>) {
	return <BaseDialog.Root {...rootProps} />;
}

export function SheetTrigger<Payload = unknown>({
	ref,
	render,
	type,
	...rest
}: SheetTriggerProps<Payload>) {
	return (
		<BaseDialog.Trigger
			{...rest}
			data-slot="sheet-trigger"
			ref={ref}
			render={render}
			type={render ? type : (type ?? "button")}
		/>
	);
}

export function SheetPopup({
	children,
	closeProps,
	portalProps,
	ref,
	showCloseButton = true,
	side = "right",
	variant = "default",
	...rest
}: SheetPopupProps) {
	return (
		<BaseDialog.Portal
			{...portalProps}
			{...props(overlayLayerStyles.modalPortal)}
		>
			<BaseDialog.Backdrop
				data-slot="sheet-backdrop"
				{...props(sheetStyles.backdrop, overlayLayerStyles.backdrop)}
			/>
			<BaseDialog.Viewport
				data-slot="sheet-viewport"
				{...props(
					sheetStyles.viewport,
					overlayLayerStyles.modalViewport,
					viewportSideStyles[side],
					variant === "inset" ? sheetPositionsStyles.viewport_inset : null
				)}
			>
				<BaseDialog.Popup
					{...rest}
					data-slot="sheet-popup"
					ref={ref}
					{...props(
						sheetStyles.popup,
						popupSideStyles[side],
						variant === "inset" ? sheetPositionsStyles.popup_inset : null
					)}
				>
					{showCloseButton ? (
						<BaseDialog.Close
							aria-label="Close"
							data-slot="sheet-default-close"
							{...closeProps}
							{...props(sheetStyles.close)}
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

export const SheetContent = SheetPopup;

export function SheetTitle({ children, ref, ...rest }: SheetTitleProps) {
	return (
		<BaseDialog.Title
			{...rest}
			data-slot="sheet-title"
			ref={ref}
			{...props(sheetStyles.title)}
		>
			{children}
		</BaseDialog.Title>
	);
}

export function SheetDescription({
	children,
	ref,
	...rest
}: SheetDescriptionProps) {
	return (
		<BaseDialog.Description
			{...rest}
			data-slot="sheet-description"
			ref={ref}
			{...props(sheetStyles.description)}
		>
			{children}
		</BaseDialog.Description>
	);
}

export function SheetClose({ ref, render, type, ...rest }: SheetCloseProps) {
	return (
		<BaseDialog.Close
			{...rest}
			data-slot="sheet-close"
			ref={ref}
			render={render}
			type={render ? type : (type ?? "button")}
		/>
	);
}

export function SheetHeader(headerProps: SheetHeaderProps) {
	return <LayoutSheetHeader {...headerProps} />;
}

export function SheetPanel(panelProps: SheetPanelProps) {
	return <LayoutSheetPanel {...panelProps} />;
}

export function SheetFooter(footerProps: SheetFooterProps) {
	return <LayoutSheetFooter {...footerProps} />;
}
