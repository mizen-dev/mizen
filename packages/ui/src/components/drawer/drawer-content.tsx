"use client";

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { props } from "@stylexjs/stylex";
import { drawerStyles } from "./drawer.styles";
import type { DrawerContentProps } from "./drawer.types";

export function DrawerContent({
	children,
	ref,
	render,
	...rest
}: DrawerContentProps) {
	return (
		<BaseDrawer.Content
			{...rest}
			data-slot="drawer-content"
			ref={ref}
			render={render}
			{...props(drawerStyles.content)}
		>
			{children}
		</BaseDrawer.Content>
	);
}
