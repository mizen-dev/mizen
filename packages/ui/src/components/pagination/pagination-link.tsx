"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { props } from "@stylexjs/stylex";
import type { Closed } from "../../closed";
import { controlLabel } from "../../control-label";
import { protectRenderSlot } from "../../render-utils";
import { paginationStyles } from "./pagination.styles";

type Part<T> = Omit<Closed<T>, "data-slot" | "role">;

export type PaginationLinkProps = Part<useRender.ComponentProps<"a">> & {
	disabled?: boolean;
	active?: boolean;
	size?: "default" | "icon";
};

function preventDisabledNavigation(event: { preventDefault: () => void }) {
	event.preventDefault();
}

function preventDisabledActivation(event: {
	key: string;
	preventDefault: () => void;
}) {
	if (event.key === "Enter") {
		event.preventDefault();
	}
}

function getLinkProps(
	linkProps: Omit<
		PaginationLinkProps,
		"children" | "disabled" | "active" | "ref" | "render" | "size"
	>,
	children: PaginationLinkProps["children"],
	active: boolean,
	disabled: boolean,
	size: "default" | "icon"
) {
	const { onAuxClick, onClick, onKeyDown, ...nativeProps } = linkProps;
	const interactionProps = disabled
		? {
				href: undefined,
				onAuxClick: preventDisabledNavigation,
				onClick: preventDisabledNavigation,
				onKeyDown: preventDisabledActivation,
				tabIndex: -1,
			}
		: { onAuxClick, onClick, onKeyDown };
	return mergeProps(nativeProps, {
		...props(
			paginationStyles.link,
			size === "default"
				? paginationStyles.labelled
				: paginationStyles.iconSize,
			!disabled && paginationStyles.interactive,
			active ? paginationStyles.active : null,
			disabled ? paginationStyles.disabled : null
		),
		"aria-current": active ? "page" : undefined,
		"aria-disabled": disabled || undefined,
		children: controlLabel(children),
		"data-size": size,
		"data-slot": "pagination-link",
		...interactionProps,
	});
}

export function PaginationLink({
	children,
	disabled = false,
	active = false,
	ref: forwardedRef,
	render,
	size = "icon",
	...rest
}: PaginationLinkProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "role");
	Reflect.deleteProperty(rest, "style");

	return useRender({
		defaultTagName: "a",
		props: getLinkProps(rest, children, active, disabled, size),
		ref: forwardedRef,
		render: disabled
			? undefined
			: protectRenderSlot("pagination-link", render, {
					"aria-current": active ? "page" : undefined,
					"aria-disabled": undefined,
				}),
	});
}
