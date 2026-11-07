"use client";

import type { CheckboxIndicatorState } from "@base-ui/react/checkbox";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { props } from "@stylexjs/stylex";
import { type ComponentPropsWithRef, useCallback, useState } from "react";
import { checkboxStyles } from "./checkbox.styles";

type BaseCheckboxProps = ComponentPropsWithRef<typeof BaseCheckbox.Root>;

export type CheckboxSize = "default" | "lg" | "sm";

export type CheckboxProps = Omit<
	BaseCheckboxProps,
	| "className"
	| "children"
	| "disabled"
	| "nativeButton"
	| "parent"
	| "ref"
	| "render"
	| "style"
> & {
	disabled?: boolean;
	invalid?: boolean;
	parent?: boolean;
	ref?: BaseCheckboxProps["ref"];
	size?: CheckboxSize;
};

const sizeStyles = {
	default: checkboxStyles.sizeDefault,
	lg: checkboxStyles.sizeLg,
	sm: checkboxStyles.sizeSm,
};

// The marks are drawn here rather than taken from the icon pack: they are
// part of the control, and pathLength="1" lets the stroke draw on exactly.
// The stroke draws only when a check makes the mark appear, and once: a
// mark that mounts checked, or shows again after being hidden, stays still.
function CheckboxMark({ state }: { state: CheckboxIndicatorState }) {
	const [drawing, setDrawing] = useState(state.transitionStatus === "starting");
	const settle = useCallback(() => setDrawing(false), []);
	return (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			viewBox="0 0 16 16"
			{...props(checkboxStyles.icon)}
		>
			<path
				d={state.indeterminate ? "M4 8h8" : "M3.5 8.5l3 3l6 -6.5"}
				onAnimationEnd={settle}
				pathLength={1}
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				{...props(checkboxStyles.mark, drawing && checkboxStyles.draw)}
			/>
		</svg>
	);
}

function renderIndicator(
	indicatorProps: ComponentPropsWithRef<"span">,
	state: CheckboxIndicatorState
) {
	return (
		<span {...indicatorProps} {...props(checkboxStyles.indicator)}>
			<CheckboxMark state={state} />
		</span>
	);
}

export function Checkbox({
	disabled = false,
	indeterminate,
	invalid = false,
	parent = false,
	readOnly = false,
	ref: forwardedRef = undefined,
	size = "default",
	...rest
}: CheckboxProps) {
	return (
		<BaseCheckbox.Root
			{...rest}
			aria-invalid={invalid || undefined}
			disabled={disabled}
			indeterminate={indeterminate}
			parent={parent}
			readOnly={readOnly}
			ref={forwardedRef}
			{...props(
				checkboxStyles.base,
				checkboxStyles.forcedColorsSelected,
				sizeStyles[size]
			)}
		>
			<BaseCheckbox.Indicator render={renderIndicator} />
		</BaseCheckbox.Root>
	);
}
