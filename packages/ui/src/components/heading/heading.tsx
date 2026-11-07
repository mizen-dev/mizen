import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { typeRoles } from "../../styles/typography.styles";
import { headingStyles } from "./heading.styles";

type NativeHeadingProps = ComponentPropsWithRef<"h2">;

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "display" | "heading" | "subheading" | "title";

export type HeadingProps = Omit<NativeHeadingProps, "className" | "style"> & {
	level?: HeadingLevel;
	size?: HeadingSize;
};

const headingElements = {
	1: "h1",
	2: "h2",
	3: "h3",
	4: "h4",
	5: "h5",
	6: "h6",
} as const;

const sizeStyles = {
	display: typeRoles.display,
	heading: typeRoles.heading,
	subheading: typeRoles.subheading,
	title: typeRoles.title,
};

export function Heading({
	children,
	level = 2,
	ref: forwardedRef,
	size = "heading",
	...rest
}: HeadingProps) {
	const Component = headingElements[level];

	return (
		<Component
			{...rest}
			data-size={size}
			data-slot="heading"
			ref={forwardedRef}
			{...props(headingStyles.base, sizeStyles[size])}
		>
			{children}
		</Component>
	);
}
