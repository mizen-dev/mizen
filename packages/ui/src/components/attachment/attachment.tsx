import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { attachmentStyles } from "./attachment.styles";

type DivProps = ComponentPropsWithRef<"div">;
type SpanProps = ComponentPropsWithRef<"span">;
type Part<T> = Omit<Closed<T>, "children" | "data-slot" | "role"> & {
	children: ReactNode;
};

export type AttachmentProps = Part<DivProps>;
export type AttachmentMediaProps = Part<DivProps>;
export type AttachmentContentProps = Part<DivProps>;
export type AttachmentNameProps = Part<SpanProps>;
export type AttachmentDescriptionProps = Part<SpanProps>;
export type AttachmentActionsProps = Part<DivProps>;

function stripReservedProps(attributes: Record<string, unknown>) {
	for (const name of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(attributes, name);
	}
}

export function Attachment({
	children,
	ref: forwardedRef,
	...rest
}: AttachmentProps) {
	stripReservedProps(rest);
	return (
		<div
			{...rest}
			data-slot="attachment"
			ref={forwardedRef}
			{...props(attachmentStyles.root, typeRoles.body)}
		>
			{children}
		</div>
	);
}

export function AttachmentMedia({
	children,
	ref: forwardedRef,
	...rest
}: AttachmentMediaProps) {
	stripReservedProps(rest);
	return (
		<div
			{...rest}
			data-slot="attachment-media"
			ref={forwardedRef}
			{...props(attachmentStyles.media)}
		>
			{children}
		</div>
	);
}

export function AttachmentContent({
	children,
	ref: forwardedRef,
	...rest
}: AttachmentContentProps) {
	stripReservedProps(rest);
	return (
		<div
			{...rest}
			data-slot="attachment-content"
			ref={forwardedRef}
			{...props(attachmentStyles.content)}
		>
			{children}
		</div>
	);
}

export function AttachmentName({
	children,
	ref: forwardedRef,
	...rest
}: AttachmentNameProps) {
	stripReservedProps(rest);
	return (
		<span
			{...rest}
			data-slot="attachment-name"
			ref={forwardedRef}
			{...props(typeRoles.body, attachmentStyles.name)}
		>
			{children}
		</span>
	);
}

export function AttachmentDescription({
	children,
	ref: forwardedRef,
	...rest
}: AttachmentDescriptionProps) {
	stripReservedProps(rest);
	return (
		<span
			{...rest}
			data-slot="attachment-description"
			ref={forwardedRef}
			{...props(attachmentStyles.description, typeRoles.body)}
		>
			{children}
		</span>
	);
}

export function AttachmentActions({
	children,
	ref: forwardedRef,
	...rest
}: AttachmentActionsProps) {
	stripReservedProps(rest);
	return (
		<div
			{...rest}
			data-slot="attachment-actions"
			ref={forwardedRef}
			{...props(attachmentStyles.actions)}
		>
			{children}
		</div>
	);
}
