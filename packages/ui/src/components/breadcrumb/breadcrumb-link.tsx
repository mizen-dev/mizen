"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { props } from "@stylexjs/stylex";
import type { Closed } from "../../closed";
import { controlLabel } from "../../control-label";
import { protectRenderSlot } from "../../render-utils";
import { breadcrumbStyles } from "./breadcrumb.styles";

export type BreadcrumbLinkProps = Closed<useRender.ComponentProps<"a">>;

export function BreadcrumbLink({
	children,
	ref: forwardedRef,
	render,
	...rest
}: BreadcrumbLinkProps) {
	return useRender({
		defaultTagName: "a",
		props: mergeProps(
			props(breadcrumbStyles.link, breadcrumbStyles.iconContent),
			rest,
			{
				children: controlLabel(children),
				"data-slot": "breadcrumb-link",
			}
		),
		ref: forwardedRef,
		render: protectRenderSlot("breadcrumb-link", render),
	});
}
