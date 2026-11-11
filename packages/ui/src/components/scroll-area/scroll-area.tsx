"use client";

import type {
	ScrollAreaRootProps as BaseScrollAreaRootProps,
	ScrollAreaScrollbarProps as BaseScrollAreaScrollbarProps,
} from "@base-ui/react/scroll-area";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { omitProps, protectRenderSlot } from "../../render-utils";
import { scrollAreaStyles } from "./scroll-area.styles";

type BaseRootProps = ComponentPropsWithRef<typeof BaseScrollArea.Root>;
type BaseScrollbarProps = ComponentPropsWithRef<
	typeof BaseScrollArea.Scrollbar
>;

export type ScrollAreaProps = Omit<
	BaseScrollAreaRootProps,
	"className" | "data-slot" | "style"
> & {
	clampContentMinWidth?: boolean;
	fill?: boolean;
	overscrollContain?: boolean;
	ref?: BaseRootProps["ref"];
	scrollFade?: boolean;
	scrollbarGutter?: boolean;
	/**
	 * Props and ref for the element that scrolls: an id, data attributes, an
	 * accessible name, or a scroll handler.
	 */
	viewportProps?: Omit<ScrollAreaViewportProps, "children" | "render">;
};

export type ScrollAreaViewportProps = Omit<
	ComponentPropsWithRef<typeof BaseScrollArea.Viewport>,
	"className" | "data-slot" | "style"
>;

const STYLE_PROPS = ["className", "data-slot", "style"];
export type ScrollAreaThumbProps = Omit<
	ComponentPropsWithRef<typeof BaseScrollArea.Thumb>,
	"className" | "data-slot" | "style"
>;
export type ScrollAreaCornerProps = Omit<
	ComponentPropsWithRef<typeof BaseScrollArea.Corner>,
	"className" | "data-slot" | "style"
>;

export type ScrollAreaScrollbarProps = Omit<
	BaseScrollAreaScrollbarProps,
	"className" | "data-slot" | "style"
> & {
	ref?: BaseScrollbarProps["ref"];
};

function getViewportStyles(
	scrollFade?: boolean,
	scrollbarGutter?: boolean,
	overscrollContain?: boolean
) {
	return props(
		scrollAreaStyles.viewport,
		scrollFade ? scrollAreaStyles.viewportFade : null,
		scrollbarGutter ? scrollAreaStyles.viewportGutter : null,
		overscrollContain ? scrollAreaStyles.viewportOverscrollContain : null
	);
}

function getContentProps(clampContentMinWidth?: boolean, fill?: boolean) {
	const contentProps = props(
		scrollAreaStyles.content,
		fill ? scrollAreaStyles.contentFill : null
	);
	return {
		...contentProps,
		style: clampContentMinWidth
			? { ...contentProps.style, minWidth: 0 }
			: contentProps.style,
	};
}

export function ScrollAreaScrollbar({
	children,
	orientation = "vertical",
	ref: forwardedRef,
	render,
	...rest
}: ScrollAreaScrollbarProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<BaseScrollArea.Scrollbar
			{...rest}
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			ref={forwardedRef}
			render={protectRenderSlot("scroll-area-scrollbar", render)}
			{...props(
				scrollAreaStyles.scrollbar,
				orientation === "horizontal"
					? scrollAreaStyles.scrollbarHorizontal
					: scrollAreaStyles.scrollbarVertical
			)}
		>
			{children ?? <ScrollAreaThumb />}
		</BaseScrollArea.Scrollbar>
	);
}

export function ScrollAreaViewport({
	render,
	...rest
}: ScrollAreaViewportProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");
	return (
		<BaseScrollArea.Viewport
			{...rest}
			data-slot="scroll-area-viewport"
			render={protectRenderSlot("scroll-area-viewport", render)}
			{...props(scrollAreaStyles.viewport)}
		/>
	);
}

export function ScrollAreaThumb({ render, ...rest }: ScrollAreaThumbProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");
	return (
		<BaseScrollArea.Thumb
			{...rest}
			data-slot="scroll-area-thumb"
			render={protectRenderSlot("scroll-area-thumb", render)}
			{...props(scrollAreaStyles.thumb)}
		/>
	);
}

export function ScrollAreaCorner({ render, ...rest }: ScrollAreaCornerProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");
	return (
		<BaseScrollArea.Corner
			{...rest}
			data-slot="scroll-area-corner"
			render={protectRenderSlot("scroll-area-corner", render)}
			{...props(scrollAreaStyles.corner)}
		/>
	);
}

export function ScrollArea({
	children,
	clampContentMinWidth = true,
	fill = false,
	overscrollContain = false,
	ref: forwardedRef,
	render,
	scrollFade = false,
	scrollbarGutter = false,
	viewportProps = {},
	...rest
}: ScrollAreaProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	const viewportStyles = getViewportStyles(
		scrollFade,
		scrollbarGutter,
		overscrollContain
	);
	const contentProps = getContentProps(clampContentMinWidth, fill);

	return (
		<BaseScrollArea.Root
			{...rest}
			data-slot="scroll-area"
			ref={forwardedRef}
			render={protectRenderSlot("scroll-area", render)}
			{...props(
				scrollAreaStyles.root,
				scrollFade && scrollAreaStyles.rootFadeFocus
			)}
		>
			<BaseScrollArea.Viewport
				{...omitProps(viewportProps, STYLE_PROPS)}
				data-slot="scroll-area-viewport"
				{...viewportStyles}
			>
				<BaseScrollArea.Content
					data-slot="scroll-area-content"
					{...contentProps}
				>
					{children}
				</BaseScrollArea.Content>
			</BaseScrollArea.Viewport>
			<ScrollAreaScrollbar orientation="vertical" />
			<ScrollAreaScrollbar orientation="horizontal" />
			<ScrollAreaCorner />
		</BaseScrollArea.Root>
	);
}

export const ScrollAreaPrimitive = BaseScrollArea;
