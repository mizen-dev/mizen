"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { props } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import type { Closed } from "../../closed";
import { protectRenderSlot } from "../../render-utils";
import { linkStyles } from "./link.styles";

type NativeLinkProps = Omit<
	Closed<useRender.ComponentProps<"a">>,
	"children" | "data-slot" | "href" | "render" | "role"
> & { children: ReactNode };

export type LinkProps = NativeLinkProps &
	(
		| { href: string; render?: undefined }
		| {
				href?: string;
				render: NonNullable<useRender.ComponentProps<"a">["render"]>;
		  }
	);

export function Link({
	children,
	href,
	ref: forwardedRef,
	render,
	...rest
}: LinkProps) {
	if (!render && typeof href !== "string") {
		throw new TypeError("Link requires an href string or a render target.");
	}
	for (const name of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	return useRender({
		defaultTagName: "a",
		props: mergeProps(rest, props(linkStyles.root), {
			children,
			"data-slot": "link",
			...(href === undefined ? {} : { href }),
		}),
		ref: forwardedRef,
		render: protectRenderSlot("link", render),
	});
}
