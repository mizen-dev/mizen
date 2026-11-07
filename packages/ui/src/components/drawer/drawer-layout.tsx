"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { props } from "@stylexjs/stylex";
import { useContext } from "react";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import { ScrollArea } from "../scroll-area/scroll-area";
import { DrawerContext } from "./drawer.context";
import { drawerStyles } from "./drawer.styles";
import type {
	DrawerFooterProps,
	DrawerHeaderProps,
	DrawerPanelProps,
} from "./drawer.types";

export function DrawerHeader({
	allowSelection = false,
	children,
	ref: forwardedRef,
	render,
	...rest
}: DrawerHeaderProps) {
	const { showCloseButton } = useContext(DrawerContext);
	const protectedRender = protectSlot("drawer-header", render);

	return useRender({
		defaultTagName: "div",
		props: mergeProps(
			{
				children,
				...props(
					drawerStyles.header,
					showCloseButton ? drawerStyles.headerWithClose : null,
					allowSelection ? null : drawerStyles.noSelection
				),
				"data-slot": "drawer-header",
			},
			rest
		),
		ref: forwardedRef,
		render: allowSelection ? (
			<BaseDrawer.Content render={protectedRender} />
		) : (
			protectedRender
		),
	});
}

export function DrawerPanel({
	allowSelection = true,
	children,
	ref: forwardedRef,
	render,
	scrollFade = true,
	scrollable = true,
	...rest
}: DrawerPanelProps) {
	const protectedRender = protectSlot("drawer-panel", render);
	const panel = useRender({
		defaultTagName: "div",
		props: mergeProps(
			{
				children,
				...props(
					drawerStyles.panel,
					allowSelection ? null : drawerStyles.noSelection
				),
				"data-slot": "drawer-panel",
			},
			rest
		),
		ref: forwardedRef,
		render: allowSelection ? (
			<BaseDrawer.Content render={protectedRender} />
		) : (
			protectedRender
		),
	});

	if (scrollable) {
		return (
			<ScrollArea
				fill
				overscrollContain
				render={<div {...props(drawerStyles.scrollArea)} />}
				scrollFade={scrollFade}
			>
				{panel}
			</ScrollArea>
		);
	}

	return panel;
}

export function DrawerFooter({
	allowSelection = true,
	children,
	ref: forwardedRef,
	render,
	variant = "default",
	...rest
}: DrawerFooterProps) {
	const protectedRender = protectSlot("drawer-footer", render);

	return useRender({
		defaultTagName: "div",
		props: mergeProps(
			{
				children,
				...props(
					drawerStyles.footer,
					variant === "bare" ? drawerStyles.footerBare : null,
					allowSelection ? null : drawerStyles.noSelection
				),
				"data-slot": "drawer-footer",
			},
			rest
		),
		ref: forwardedRef,
		render: allowSelection ? (
			<BaseDrawer.Content render={protectedRender} />
		) : (
			protectedRender
		),
	});
}
