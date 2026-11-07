"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { props } from "@stylexjs/stylex";
import { useContext } from "react";
import { DrawerContext } from "./drawer.context";
import type { DrawerBarProps } from "./drawer.types";
import {
	drawerAffordanceStyles,
	drawerBarPositionStyles,
} from "./drawer-affordance.styles";

export function DrawerBar({
	ref,
	render,
	position: positionProp,
	...rest
}: DrawerBarProps) {
	const { position: contextPosition } = useContext(DrawerContext);
	const position = positionProp ?? contextPosition;
	const horizontal = position === "left" || position === "right";

	return useRender({
		defaultTagName: "div",
		props: mergeProps(
			{
				"aria-hidden": true,
				"data-slot": "drawer-bar",
				...props(
					drawerAffordanceStyles.bar,
					horizontal
						? drawerAffordanceStyles.barHorizontal
						: drawerAffordanceStyles.barVertical,
					drawerBarPositionStyles[position]
				),
				children: (
					<div
						{...props(
							drawerAffordanceStyles.barHandle,
							horizontal
								? drawerAffordanceStyles.barHandleHorizontal
								: drawerAffordanceStyles.barHandleVertical
						)}
					/>
				),
			},
			rest
		),
		ref,
		render,
	});
}
