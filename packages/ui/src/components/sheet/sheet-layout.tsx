"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { props } from "@stylexjs/stylex";
import { protectRenderSlot as protectSlot } from "../../render-utils";
import { ScrollArea } from "../scroll-area/scroll-area";
import { sheetStyles } from "./sheet.styles";
import type {
	SheetFooterProps,
	SheetHeaderProps,
	SheetPanelProps,
} from "./sheet.types";

export function SheetHeader({
	children,
	ref: forwardedRef,
	render,
	...rest
}: SheetHeaderProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(
			{
				children,
				...props(sheetStyles.header),
				"data-slot": "sheet-header",
			},
			rest
		),
		ref: forwardedRef,
		render: protectSlot("sheet-header", render),
	});
}

export function SheetPanel({
	children,
	ref: forwardedRef,
	render,
	scrollFade = true,
	...rest
}: SheetPanelProps) {
	const panel = useRender({
		defaultTagName: "div",
		props: mergeProps(
			{
				children,
				...props(sheetStyles.panel),
				"data-slot": "sheet-panel",
			},
			rest
		),
		ref: forwardedRef,
		render: protectSlot("sheet-panel", render),
	});

	return (
		<ScrollArea
			fill
			overscrollContain
			render={<div {...props(sheetStyles.scrollArea)} />}
			scrollFade={scrollFade}
		>
			{panel}
		</ScrollArea>
	);
}

export function SheetFooter({
	children,
	ref: forwardedRef,
	render,
	variant = "default",
	...rest
}: SheetFooterProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(
			{
				children,
				...props(
					sheetStyles.footer,
					variant === "bare" ? sheetStyles.footerBare : null
				),
				"data-slot": "sheet-footer",
			},
			rest
		),
		ref: forwardedRef,
		render: protectSlot("sheet-footer", render),
	});
}
