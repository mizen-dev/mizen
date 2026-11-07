import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { skeletonStyles } from "./skeleton.styles";

export type SkeletonShape = "line" | "circle" | "rectangle";

type NativeDivProps = ComponentPropsWithRef<"div">;

export type SkeletonProps = Omit<
	NativeDivProps,
	"className" | "data-slot" | "style"
> & {
	shape?: SkeletonShape;
};

export function Skeleton({
	"aria-hidden": ariaHidden = true,
	children,
	ref: forwardedRef,
	shape = "line",
	...rest
}: SkeletonProps) {
	return (
		<div
			{...rest}
			aria-hidden={ariaHidden}
			data-shape={shape}
			data-slot="skeleton"
			ref={forwardedRef}
			{...props(skeletonStyles.base, skeletonStyles[shape])}
		>
			{children}
		</div>
	);
}
