import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { controlLabel } from "../../control-label";
import { kbdStyles } from "./kbd.styles";

type NativeKbdProps = ComponentPropsWithRef<"kbd">;

export type KbdProps = Omit<
	NativeKbdProps,
	| "aria-label"
	| "aria-labelledby"
	| "className"
	| "data-slot"
	| "role"
	| "style"
>;

export type KbdGroupProps = Omit<
	NativeKbdProps,
	| "aria-label"
	| "aria-labelledby"
	| "className"
	| "data-slot"
	| "role"
	| "style"
>;

export function Kbd({ children, ref: forwardedRef, ...rest }: KbdProps) {
	Reflect.deleteProperty(rest, "aria-label");
	Reflect.deleteProperty(rest, "aria-labelledby");
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "role");
	Reflect.deleteProperty(rest, "style");

	return (
		<kbd
			{...rest}
			data-slot="kbd"
			ref={forwardedRef}
			{...props(kbdStyles.root)}
		>
			{controlLabel(children)}
		</kbd>
	);
}

export function KbdGroup({
	children,
	ref: forwardedRef,
	...rest
}: KbdGroupProps) {
	Reflect.deleteProperty(rest, "aria-label");
	Reflect.deleteProperty(rest, "aria-labelledby");
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "role");
	Reflect.deleteProperty(rest, "style");

	return (
		<kbd
			{...rest}
			data-slot="kbd-group"
			ref={forwardedRef}
			{...props(kbdStyles.group)}
		>
			{children}
		</kbd>
	);
}
