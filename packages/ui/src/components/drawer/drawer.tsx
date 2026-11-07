"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { mergeProps } from "@base-ui/react/merge-props";
import { props } from "@stylexjs/stylex";
import { type ReactNode, useContext } from "react";
import { overlayLayerStyles } from "../../styles/overlay-layers.styles";
import {
	CloseIcon,
	DrawerContext,
	positionToSwipeDirection,
} from "./drawer.context";
import { drawerStyles } from "./drawer.styles";
import type {
	DrawerBackdropProps,
	DrawerBarProps,
	DrawerCloseProps,
	DrawerContentProps,
	DrawerDescriptionProps,
	DrawerFooterProps,
	DrawerHeaderProps,
	DrawerPanelProps,
	DrawerPopupProps,
	DrawerPortalProps,
	DrawerProps,
	DrawerSwipeAreaProps,
	DrawerTitleProps,
	DrawerTriggerProps,
	DrawerViewportProps,
} from "./drawer.types";
import { DrawerBar as InnerDrawerBar } from "./drawer-bar";
import { DrawerContent as BaseDrawerContent } from "./drawer-content";
import {
	DrawerFooter as LayoutDrawerFooter,
	DrawerHeader as LayoutDrawerHeader,
	DrawerPanel as LayoutDrawerPanel,
} from "./drawer-layout";
import {
	drawerPopupPositionStyles,
	drawerPositionsStyles,
	drawerViewportPositionStyles,
} from "./drawer-positions.styles";

export type {
	DrawerBackdropProps,
	DrawerBarProps,
	DrawerCloseProps,
	DrawerContentProps,
	DrawerDescriptionProps,
	DrawerFooterProps,
	DrawerHeaderProps,
	DrawerPanelProps,
	DrawerPopupProps,
	DrawerPortalProps,
	DrawerPosition,
	DrawerProps,
	DrawerSwipeAreaProps,
	DrawerTitleProps,
	DrawerTriggerProps,
	DrawerVariant,
	DrawerViewportProps,
} from "./drawer.types";

const drawerVariantStyles = {
	default: null,
	inset: drawerPositionsStyles.popup_inset,
	straight: drawerPositionsStyles.popup_straight,
};

export const DrawerPrimitive = BaseDrawer;
export const DrawerCreateHandle = BaseDrawer.createHandle;
export const DrawerPortal: (props: DrawerPortalProps) => ReactNode =
	BaseDrawer.Portal;

export function Drawer<Payload = unknown>({
	children,
	position = "bottom",
	swipeDirection,
	...rest
}: DrawerProps<Payload>) {
	return (
		<DrawerContext.Provider value={{ position }}>
			<BaseDrawer.Root
				{...rest}
				swipeDirection={swipeDirection ?? positionToSwipeDirection[position]}
			>
				{children}
			</BaseDrawer.Root>
		</DrawerContext.Provider>
	);
}

export function DrawerTrigger<Payload = unknown>({
	ref,
	render,
	type,
	...rest
}: DrawerTriggerProps<Payload>) {
	return (
		<BaseDrawer.Trigger
			{...rest}
			data-slot="drawer-trigger"
			ref={ref}
			render={render}
			type={render ? type : (type ?? "button")}
		/>
	);
}

export function DrawerBar(barProps: DrawerBarProps) {
	return <InnerDrawerBar {...barProps} />;
}

export function DrawerPopup({
	children,
	position: positionProp,
	closeProps,
	portalProps,
	ref,
	showBar = false,
	showCloseButton = false,
	variant = "default",
	...rest
}: DrawerPopupProps) {
	const { position: contextPosition } = useContext(DrawerContext);
	const position = positionProp ?? contextPosition;

	const popup = (
		<DrawerContext.Provider value={{ position, showCloseButton }}>
			<BaseDrawer.Portal
				{...mergeProps(props(overlayLayerStyles.modalPortal), portalProps)}
			>
				<DrawerBackdrop />
				<DrawerViewport position={position} variant={variant}>
					<BaseDrawer.Popup
						{...rest}
						data-slot="drawer-popup"
						ref={ref}
						{...props(
							drawerStyles.popup,
							drawerPopupPositionStyles[position],
							drawerVariantStyles[variant]
						)}
					>
						{showBar ? <DrawerBar /> : null}
						{showCloseButton ? (
							<BaseDrawer.Close
								aria-label="Close"
								{...closeProps}
								data-slot="drawer-default-close"
								{...props(drawerStyles.close)}
							>
								<CloseIcon />
							</BaseDrawer.Close>
						) : null}
						{children}
					</BaseDrawer.Popup>
				</DrawerViewport>
			</BaseDrawer.Portal>
		</DrawerContext.Provider>
	);
	return position === "bottom" ? (
		<BaseDrawer.VirtualKeyboardProvider>
			{popup}
		</BaseDrawer.VirtualKeyboardProvider>
	) : (
		popup
	);
}

export function DrawerBackdrop({ ...rest }: DrawerBackdropProps) {
	return (
		<BaseDrawer.Backdrop
			{...rest}
			data-slot="drawer-backdrop"
			{...props(drawerStyles.backdrop, overlayLayerStyles.backdrop)}
		/>
	);
}

export function DrawerViewport({
	position: positionProp,
	variant = "default",
	...rest
}: DrawerViewportProps) {
	const { position: contextPosition } = useContext(DrawerContext);
	const position = positionProp ?? contextPosition;
	return (
		<BaseDrawer.Viewport
			{...rest}
			data-slot="drawer-viewport"
			{...props(
				drawerStyles.viewport,
				drawerViewportPositionStyles[position],
				variant === "inset" ? drawerPositionsStyles.viewport_inset : null
			)}
		/>
	);
}

export function DrawerSwipeArea({
	position: positionProp,
	...rest
}: DrawerSwipeAreaProps) {
	const { position: contextPosition } = useContext(DrawerContext);
	const position = positionProp ?? contextPosition;
	return (
		<BaseDrawer.SwipeArea
			{...rest}
			data-slot="drawer-swipe-area"
			{...props(
				drawerStyles.swipeArea,
				drawerPositionsStyles[`swipeArea_${position}`]
			)}
		/>
	);
}

export function DrawerContent(contentProps: DrawerContentProps) {
	return <BaseDrawerContent {...contentProps} />;
}

export function DrawerTitle({ children, ref, ...rest }: DrawerTitleProps) {
	return (
		<BaseDrawer.Title
			{...rest}
			data-slot="drawer-title"
			ref={ref}
			{...props(drawerStyles.title)}
		>
			{children}
		</BaseDrawer.Title>
	);
}

export function DrawerDescription({
	children,
	ref,
	...rest
}: DrawerDescriptionProps) {
	return (
		<BaseDrawer.Description
			{...rest}
			data-slot="drawer-description"
			ref={ref}
			{...props(drawerStyles.description)}
		>
			{children}
		</BaseDrawer.Description>
	);
}

export function DrawerClose({ ref, render, type, ...rest }: DrawerCloseProps) {
	return (
		<BaseDrawer.Close
			{...rest}
			data-slot="drawer-close"
			ref={ref}
			render={render}
			type={render ? type : (type ?? "button")}
		/>
	);
}

export function DrawerHeader(headerProps: DrawerHeaderProps) {
	return <LayoutDrawerHeader {...headerProps} />;
}

export function DrawerPanel(panelProps: DrawerPanelProps) {
	return <LayoutDrawerPanel {...panelProps} />;
}

export function DrawerFooter(footerProps: DrawerFooterProps) {
	return <LayoutDrawerFooter {...footerProps} />;
}

// biome-ignore lint/performance/noBarrelFile: The public drawer subpath exposes its menu parts.
export * from "./drawer-menu";
