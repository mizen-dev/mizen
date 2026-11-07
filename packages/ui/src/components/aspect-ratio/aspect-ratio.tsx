import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import { aspectRatioStyles } from "./aspect-ratio.styles";

export type AspectRatioProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "role"
> & {
	children: ReactNode;
	ratio?: number;
};

export function AspectRatio({
	children,
	ratio = 16 / 9,
	ref: forwardedRef,
	...rest
}: AspectRatioProps) {
	if (!Number.isFinite(ratio) || ratio <= 0) {
		throw new RangeError("ratio must be a finite positive number");
	}
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}

	return (
		<div
			{...rest}
			data-slot="aspect-ratio"
			ref={forwardedRef}
			{...props(aspectRatioStyles.root(ratio), typeRoles.body)}
		>
			<div
				data-slot="aspect-ratio-content"
				{...props(aspectRatioStyles.content)}
			>
				{children}
			</div>
		</div>
	);
}
