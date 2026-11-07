import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { citationStyles } from "./citation.styles";

export type CitationProps = Omit<
	Closed<ComponentPropsWithRef<"cite">>,
	"children" | "data-slot" | "role"
> & { children: ReactNode };

export function Citation({
	children,
	ref: forwardedRef,
	...rest
}: CitationProps) {
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}

	return (
		<cite
			{...rest}
			data-slot="citation"
			ref={forwardedRef}
			{...props(citationStyles.root)}
		>
			{children}
		</cite>
	);
}
