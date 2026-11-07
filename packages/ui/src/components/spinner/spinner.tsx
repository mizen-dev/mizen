import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { LoadingIndicator } from "../../loading-indicator";
import { spinnerStyles } from "./spinner.styles";

type NativeSvgProps = ComponentPropsWithRef<"svg">;

/**
 * `thinking` is the model reasoning, `dots` is work running, and `typing` is
 * a reply being written.
 */
export type SpinnerVariant = "dots" | "thinking" | "typing";

export type SpinnerProps = Omit<
	NativeSvgProps,
	| "aria-label"
	| "children"
	| "className"
	| "dangerouslySetInnerHTML"
	| "data-slot"
	| "fill"
	| "focusable"
	| "height"
	| "role"
	| "style"
	| "viewBox"
	| "width"
> & {
	/**
	 * What is happening, such as "Thinking". Defaults to "Loading", or
	 * "Typing" for the typing variant. With `aria-hidden`, the spinner is
	 * decorative and nearby text carries the meaning.
	 */
	"aria-label"?: string;
	variant?: SpinnerVariant;
};

const defaultLabels: Record<SpinnerVariant, string> = {
	dots: "Loading",
	thinking: "Thinking",
	typing: "Typing",
};
// The gap starts at the top-left cell; the centre dot holds still.
const thinkingDots = [
	{ cx: 12, cy: 4, style: spinnerStyles.thinkingDot1 },
	{ cx: 20, cy: 4, style: spinnerStyles.thinkingDot2 },
	{ cx: 20, cy: 12, style: spinnerStyles.thinkingDot3 },
	{ cx: 20, cy: 20, style: spinnerStyles.thinkingDot4 },
	{ cx: 12, cy: 20, style: spinnerStyles.thinkingDot5 },
	{ cx: 4, cy: 20, style: spinnerStyles.thinkingDot6 },
	{ cx: 4, cy: 12, style: spinnerStyles.thinkingDot7 },
] as const;
const typingDots = [
	{ cx: 4, style: spinnerStyles.typingFirst },
	{ cx: 12, style: spinnerStyles.typingSecond },
	{ cx: 20, style: spinnerStyles.typingThird },
] as const;

function accessibility(
	variant: SpinnerVariant,
	ariaHidden: SpinnerProps["aria-hidden"],
	ariaLabel: string | undefined
) {
	if (ariaHidden === true || ariaHidden === "true") {
		return { "aria-hidden": true } as const;
	}
	if (ariaLabel !== undefined && !ariaLabel.trim()) {
		throw new TypeError("Spinner aria-label must not be blank.");
	}
	return {
		"aria-label": ariaLabel ?? defaultLabels[variant],
		role: "status",
	} as const;
}

export function Spinner({
	"aria-hidden": ariaHidden,
	"aria-label": ariaLabel,
	ref: forwardedRef,
	variant = "dots",
	...rest
}: SpinnerProps) {
	for (const name of [
		"children",
		"className",
		"dangerouslySetInnerHTML",
		"height",
		"role",
		"style",
		"width",
	]) {
		Reflect.deleteProperty(rest, name);
	}
	const shared = {
		...rest,
		...accessibility(variant, ariaHidden, ariaLabel),
		"data-slot": "spinner",
		"data-variant": variant,
		focusable: false,
		ref: forwardedRef,
	} as const;

	if (variant === "dots") {
		return (
			<LoadingIndicator {...shared} indicatorStyles={spinnerStyles.textSize} />
		);
	}
	if (variant === "thinking") {
		return (
			// biome-ignore lint/a11y/noSvgWithoutTitle: the name comes from aria-label with role=status, or the SVG is aria-hidden; both arrive in the spread props.
			<svg
				{...shared}
				fill="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				{...props(spinnerStyles.thinking)}
			>
				{thinkingDots.map(({ cx, cy, style }) => (
					<circle
						cx={cx}
						cy={cy}
						key={`${cx}-${cy}`}
						r={2.5}
						{...props(spinnerStyles.thinkingDot, style)}
					/>
				))}
				<circle cx={12} cy={12} r={2.5} {...props(spinnerStyles.thinkingDot)} />
			</svg>
		);
	}
	// Three dots rise in turn and fall back, brightening at the top, like a
	// reply being written. Reduced motion holds them still as a fading row.
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: the name comes from aria-label with role=status, or the SVG is aria-hidden; both arrive in the spread props.
		<svg
			{...shared}
			fill="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			{...props(spinnerStyles.typing)}
		>
			{typingDots.map(({ cx, style }) => (
				<circle
					cx={cx}
					cy={12}
					key={cx}
					r={3}
					{...props(spinnerStyles.typingDot, style)}
				/>
			))}
		</svg>
	);
}
