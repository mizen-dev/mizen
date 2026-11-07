import type { Toast as BaseToast } from "@base-ui/react/toast";
import type { ComponentProps, ComponentPropsWithRef } from "react";

export type ToastPosition =
	| "top-left"
	| "top-center"
	| "top-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right";

export type ToastSwipeDirection = "up" | "down" | "left" | "right";

export interface ToastData {
	rootProps?: Omit<
		ComponentProps<typeof BaseToast.Root>,
		"children" | "className" | "style" | "swipeDirection" | "toast"
	>;
	tooltipStyle?: boolean;
	[key: string]: unknown;
}

type ToastPortalProps = Omit<
	ComponentPropsWithRef<typeof BaseToast.Portal>,
	"className" | "style"
>;

export type ToastProviderProps = Omit<
	ComponentPropsWithRef<typeof BaseToast.Provider>,
	"className" | "style"
> & {
	position?: ToastPosition;
	portalProps?: ToastPortalProps;
};

export type AnchoredToastProviderProps = Omit<
	ComponentPropsWithRef<typeof BaseToast.Provider>,
	"className" | "style"
> & {
	portalProps?: ToastPortalProps;
};
