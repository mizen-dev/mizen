"use client";

import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, MouseEvent, ReactElement } from "react";
import { useCallback } from "react";
import type { Closed } from "../../closed";
import { protectRenderSlot } from "../../render-utils";
import type { InputProps } from "../input/input";
import { Input } from "../input/input";
import type { TextareaProps } from "../textarea/textarea";
import { Textarea } from "../textarea/textarea";
import { inputGroupStyles } from "./input-group.styles";

export type InputGroupProps = Closed<
	Omit<ComponentPropsWithRef<"div">, "data-slot">
>;

export type InputGroupAddonAlign =
	| "block-end"
	| "block-start"
	| "inline-end"
	| "inline-start";

export type InputGroupAddonProps = Closed<
	Omit<ComponentPropsWithRef<"div">, "data-slot"> & {
		align?: InputGroupAddonAlign;
	}
>;

export type InputGroupTextProps = Closed<
	Omit<ComponentPropsWithRef<"span">, "data-slot">
>;

export type InputGroupInputProps = Closed<
	Omit<InputProps, "data-slot" | "unstyled">
>;

export type InputGroupTextareaProps = Closed<
	Omit<TextareaProps, "data-slot" | "unstyled">
>;

const alignStyles = {
	"block-end": inputGroupStyles.alignBlockEnd,
	"block-start": inputGroupStyles.alignBlockStart,
	"inline-end": inputGroupStyles.alignInlineEnd,
	"inline-start": inputGroupStyles.alignInlineStart,
};

const interactiveSelector =
	"a[href], button, input, select, textarea, [contenteditable]:not([contenteditable='false']), [tabindex]:not([tabindex^='-']), [role='button'], [role='combobox'], [role='listbox'], [role='menuitem'], [role='checkbox'], [role='radio'], [role='switch'], [role='tab'], [data-slot='select-trigger']";

function shouldRedirectFocus(event: MouseEvent<HTMLDivElement>): boolean {
	const { currentTarget, target } = event;
	if (!(target instanceof Element)) {
		return false;
	}
	if (!currentTarget.contains(target)) {
		return false;
	}
	const interactive = target.closest(interactiveSelector);
	return interactive === null || !currentTarget.contains(interactive);
}

function findDirectControl(
	container: HTMLElement
): HTMLInputElement | HTMLTextAreaElement | null {
	for (const child of container.children) {
		if (
			child instanceof HTMLInputElement &&
			child.getAttribute("data-slot") === "input-group-input"
		) {
			return child;
		}
		if (
			child instanceof HTMLTextAreaElement &&
			child.getAttribute("data-slot") === "input-group-textarea"
		) {
			return child;
		}
	}
	return null;
}

function hasFocusedDirectControl(container: HTMLElement): boolean {
	const active = document.activeElement;
	if (!active || active.parentElement !== container) {
		return false;
	}
	const slot = active.getAttribute("data-slot");
	return slot === "input-group-input" || slot === "input-group-textarea";
}

function redirectFocusToSibling(container: HTMLElement | null): void {
	if (!container || hasFocusedDirectControl(container)) {
		return;
	}
	const control = findDirectControl(container);
	if (control && !control.disabled) {
		control.focus();
	}
}

export function InputGroup({
	role = "group",
	children,
	ref: forwardedRef,
	...rest
}: InputGroupProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<div
			{...rest}
			data-slot="input-group"
			ref={forwardedRef}
			role={role}
			{...props(inputGroupStyles.root)}
		>
			{children}
		</div>
	);
}

export function InputGroupAddon({
	align = "inline-start",
	children,
	onMouseDown,
	ref: forwardedRef,
	...rest
}: InputGroupAddonProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	const handleMouseDown = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			onMouseDown?.(event);
			if (event.defaultPrevented || !shouldRedirectFocus(event)) {
				return;
			}

			event.preventDefault();
			redirectFocusToSibling(event.currentTarget.parentElement);
		},
		[onMouseDown]
	);

	const addonProps = {
		...rest,
		onMouseDown: handleMouseDown,
	};

	return (
		<div
			{...addonProps}
			data-align={align}
			data-slot="input-group-addon"
			ref={forwardedRef}
			{...props(inputGroupStyles.addon, alignStyles[align])}
		>
			{children}
		</div>
	);
}

export function InputGroupText({
	children,
	ref: forwardedRef,
	...rest
}: InputGroupTextProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<span
			{...rest}
			data-slot="input-group-text"
			ref={forwardedRef}
			{...props(inputGroupStyles.text)}
		>
			{children}
		</span>
	);
}

export function InputGroupInput({
	ref: forwardedRef,
	render,
	...rest
}: InputGroupInputProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<Input
			{...rest}
			data-slot="input-group-input"
			ref={forwardedRef}
			render={protectRenderSlot("input-group-input", render ?? <input />)}
			unstyled
		/>
	);
}

export function InputGroupTextarea({
	ref: forwardedRef,
	...rest
}: InputGroupTextareaProps): ReactElement {
	Reflect.deleteProperty(rest, "data-slot");

	return (
		<Textarea
			{...rest}
			data-slot="input-group-textarea"
			ref={forwardedRef}
			unstyled
		/>
	);
}
