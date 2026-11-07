import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { thumbnailStyles } from "./thumbnail.styles";

export type ThumbnailSize = "default" | "lg" | "sm";
export type ThumbnailProps = Omit<
	Closed<ComponentPropsWithRef<"img">>,
	"alt" | "children" | "data-slot" | "height" | "role" | "src" | "width"
> & {
	alt: string;
	size?: ThumbnailSize;
	src: string;
};

const sizeStyles = {
	default: thumbnailStyles.defaultSize,
	lg: thumbnailStyles.lg,
	sm: thumbnailStyles.sm,
} satisfies Record<ThumbnailSize, object>;

const dimensions = {
	default: 48,
	lg: 64,
	sm: 32,
} satisfies Record<ThumbnailSize, number>;

export function Thumbnail({
	alt,
	ref: forwardedRef,
	size = "default",
	src,
	...rest
}: ThumbnailProps) {
	if (!src.trim()) {
		throw new TypeError("Thumbnail requires a non-empty image source.");
	}
	for (const name of [
		"className",
		"data-slot",
		"height",
		"role",
		"style",
		"width",
	]) {
		Reflect.deleteProperty(rest, name);
	}

	const dimension = dimensions[size];
	return (
		// biome-ignore lint/performance/noImgElement: Keep this UI component framework-neutral instead of coupling it to Next.js image optimization.
		<img
			{...rest}
			alt={alt}
			data-slot="thumbnail"
			height={dimension}
			ref={forwardedRef}
			src={src}
			width={dimension}
			{...props(thumbnailStyles.image, sizeStyles[size])}
		/>
	);
}
