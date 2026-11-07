import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { frameStyles } from "./frame.styles";

export type FrameProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "style"
>;
export type FramePanelProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "style"
>;
export type FrameHeaderProps = Omit<
	ComponentPropsWithRef<"header">,
	"className" | "style"
>;
export type FrameTitleProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "style"
>;
export type FrameDescriptionProps = Omit<
	ComponentPropsWithRef<"div">,
	"className" | "style"
>;
export type FrameFooterProps = Omit<
	ComponentPropsWithRef<"footer">,
	"className" | "style"
>;

export function Frame({ children, ref: forwardedRef, ...rest }: FrameProps) {
	return (
		<div
			{...rest}
			data-slot="frame"
			ref={forwardedRef}
			{...props(frameStyles.frame)}
		>
			{children}
		</div>
	);
}

export function FramePanel({
	children,
	ref: forwardedRef,
	...rest
}: FramePanelProps) {
	return (
		<div
			{...rest}
			data-slot="frame-panel"
			ref={forwardedRef}
			{...props(frameStyles.panel)}
		>
			{children}
		</div>
	);
}

export function FrameHeader({
	children,
	ref: forwardedRef,
	...rest
}: FrameHeaderProps) {
	return (
		<header
			{...rest}
			data-slot="frame-panel-header"
			ref={forwardedRef}
			{...props(frameStyles.header)}
		>
			{children}
		</header>
	);
}

export function FrameTitle({
	children,
	ref: forwardedRef,
	...rest
}: FrameTitleProps) {
	return (
		<div
			{...rest}
			data-slot="frame-panel-title"
			ref={forwardedRef}
			{...props(frameStyles.title)}
		>
			{children}
		</div>
	);
}

export function FrameDescription({
	children,
	ref: forwardedRef,
	...rest
}: FrameDescriptionProps) {
	return (
		<div
			{...rest}
			data-slot="frame-panel-description"
			ref={forwardedRef}
			{...props(frameStyles.description)}
		>
			{children}
		</div>
	);
}

export function FrameFooter({
	children,
	ref: forwardedRef,
	...rest
}: FrameFooterProps) {
	return (
		<footer
			{...rest}
			data-slot="frame-panel-footer"
			ref={forwardedRef}
			{...props(frameStyles.footer)}
		>
			{children}
		</footer>
	);
}
