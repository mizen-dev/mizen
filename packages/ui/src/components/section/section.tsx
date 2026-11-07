import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { sectionStyles } from "./section.styles";

type NativeSectionProps = ComponentPropsWithRef<"section">;

export type SectionProps = Omit<
	NativeSectionProps,
	"className" | "role" | "style"
>;

export function Section({
	children,
	ref: forwardedRef,
	...rest
}: SectionProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<section
			{...rest}
			data-slot="section"
			ref={forwardedRef}
			{...props(sectionStyles.base)}
		>
			{children}
		</section>
	);
}
