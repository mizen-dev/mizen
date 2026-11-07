import type { ToastPosition, ToastSwipeDirection } from "./toast.types";

export function getPositionSwipeDirections(
	position: ToastPosition
): ToastSwipeDirection[] {
	switch (position) {
		case "top-left":
			return ["left", "up"];
		case "top-center":
			return ["up"];
		case "top-right":
			return ["right", "up"];
		case "bottom-left":
			return ["left", "down"];
		case "bottom-center":
			return ["down"];
		default:
			return ["right", "down"];
	}
}

export function isTopPosition(position: ToastPosition): boolean {
	return (
		position === "top-left" ||
		position === "top-center" ||
		position === "top-right"
	);
}

export function resolveSideOffset<T>(sideOffset?: T): T | number {
	return sideOffset ?? 4;
}

export type UpdateAnimation =
	| "shake-even"
	| "shake-odd"
	| "pulse-even"
	| "pulse-odd"
	| undefined;

export function getUpdateAnimation(
	type: string | undefined,
	updateKey: number | undefined
): UpdateAnimation {
	if (updateKey === undefined || updateKey <= 0) {
		return undefined;
	}
	const isEven = updateKey % 2 === 0;
	if (type === "error") {
		return isEven ? "shake-even" : "shake-odd";
	}
	return isEven ? "pulse-even" : "pulse-odd";
}
