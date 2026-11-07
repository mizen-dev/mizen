"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { props } from "@stylexjs/stylex";
import { protectRenderSlot } from "../../render-utils";
import { cardStyles } from "./card.styles";

export type CardProps = Omit<
	useRender.ComponentProps<"div">,
	"className" | "data-slot" | "style"
>;

export type CardHeaderProps = Omit<
	useRender.ComponentProps<"div">,
	"className" | "data-slot" | "style"
>;

export type CardTitleProps = Omit<
	useRender.ComponentProps<"div">,
	"className" | "data-slot" | "style"
>;

export type CardDescriptionProps = Omit<
	useRender.ComponentProps<"div">,
	"className" | "data-slot" | "style"
>;

export type CardActionProps = Omit<
	useRender.ComponentProps<"div">,
	"className" | "data-slot" | "style"
>;

export type CardPanelProps = Omit<
	useRender.ComponentProps<"div">,
	"className" | "data-slot" | "style"
>;

export type CardFooterProps = Omit<
	useRender.ComponentProps<"div">,
	"className" | "data-slot" | "style"
>;

export type CardContentProps = CardPanelProps;

export function Card({ ref: forwardedRef, render, ...rest }: CardProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(rest, {
			...props(cardStyles.root),
			"data-slot": "card",
		}),
		ref: forwardedRef,
		render: protectRenderSlot("card", render),
	});
}

export function CardHeader({
	ref: forwardedRef,
	render,
	...rest
}: CardHeaderProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(rest, {
			...props(cardStyles.header),
			"data-slot": "card-header",
		}),
		ref: forwardedRef,
		render: protectRenderSlot("card-header", render),
	});
}

export function CardTitle({
	ref: forwardedRef,
	render,
	...rest
}: CardTitleProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(rest, {
			...props(cardStyles.title),
			"data-slot": "card-title",
		}),
		ref: forwardedRef,
		render: protectRenderSlot("card-title", render),
	});
}

export function CardDescription({
	ref: forwardedRef,
	render,
	...rest
}: CardDescriptionProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(rest, {
			...props(cardStyles.description),
			"data-slot": "card-description",
		}),
		ref: forwardedRef,
		render: protectRenderSlot("card-description", render),
	});
}

export function CardAction({
	ref: forwardedRef,
	render,
	...rest
}: CardActionProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(rest, {
			...props(cardStyles.action),
			"data-slot": "card-action",
		}),
		ref: forwardedRef,
		render: protectRenderSlot("card-action", render),
	});
}

export function CardPanel({
	ref: forwardedRef,
	render,
	...rest
}: CardPanelProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(rest, {
			...props(cardStyles.panel),
			"data-slot": "card-panel",
		}),
		ref: forwardedRef,
		render: protectRenderSlot("card-panel", render),
	});
}

export function CardFooter({
	ref: forwardedRef,
	render,
	...rest
}: CardFooterProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps(rest, {
			...props(cardStyles.footer),
			"data-slot": "card-footer",
		}),
		ref: forwardedRef,
		render: protectRenderSlot("card-footer", render),
	});
}

export { CardPanel as CardContent };
