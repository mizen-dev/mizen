import { createContext } from "react";
import { IconX } from "../../icons";
import type { DrawerPosition, DrawerProps } from "./drawer.types";

export const DrawerContext = createContext<{
	position: DrawerPosition;
	showCloseButton?: boolean;
}>({
	position: "bottom",
	showCloseButton: false,
});

export const positionToSwipeDirection: Record<
	DrawerPosition,
	NonNullable<DrawerProps["swipeDirection"]>
> = {
	bottom: "down",
	left: "left",
	right: "right",
	top: "up",
};

export function CloseIcon() {
	return <IconX aria-hidden="true" focusable="false" size="16" />;
}
