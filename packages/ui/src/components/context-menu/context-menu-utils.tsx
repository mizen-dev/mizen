"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import type { MenuCheckboxItemIndicatorState as ContextMenuCheckboxItemIndicatorState } from "@base-ui/react/menu";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { IconCheck, IconChevronLeft, IconChevronRight } from "../../icons";
import { menuStyles } from "../menu/menu.styles";

export const itemVariantStyles = {
	default: menuStyles.itemDefault,
	destructive: menuStyles.itemDestructive,
};

export function CheckIcon() {
	return (
		<IconCheck
			aria-hidden="true"
			focusable="false"
			{...props(menuStyles.checkIcon)}
			size="1em"
		/>
	);
}

export function ChevronIcon() {
	const direction = useDirection();
	return direction === "rtl" ? (
		<IconChevronLeft
			aria-hidden="true"
			focusable="false"
			{...props(menuStyles.chevron)}
			size="1em"
		/>
	) : (
		<IconChevronRight
			aria-hidden="true"
			focusable="false"
			{...props(menuStyles.chevron)}
			size="1em"
		/>
	);
}

export function renderSwitchIndicator(
	indicatorProps: ComponentPropsWithRef<"span">,
	state: ContextMenuCheckboxItemIndicatorState
) {
	return (
		<span
			{...indicatorProps}
			{...props(
				menuStyles.switchIndicator,
				state.checked && menuStyles.switchIndicatorChecked
			)}
		>
			<span
				{...props(
					menuStyles.switchThumb,
					state.checked && menuStyles.switchThumbChecked
				)}
			/>
		</span>
	);
}
