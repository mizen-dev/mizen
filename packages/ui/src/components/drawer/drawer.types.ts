import type {
	Drawer as BaseDrawer,
	DrawerCloseProps as BaseDrawerCloseProps,
	DrawerContentProps as BaseDrawerContentProps,
	DrawerDescriptionProps as BaseDrawerDescriptionProps,
	DrawerPopupProps as BaseDrawerPopupProps,
	DrawerPortalProps as BaseDrawerPortalProps,
	DrawerRootProps as BaseDrawerRootProps,
	DrawerTitleProps as BaseDrawerTitleProps,
	DrawerTriggerProps as BaseDrawerTriggerProps,
} from "@base-ui/react/drawer";
import type { useRender } from "@base-ui/react/use-render";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";

type DivProps = useRender.ComponentProps<"div">;
type DrawerTriggerRef = ComponentPropsWithRef<typeof BaseDrawer.Trigger>["ref"];
type DrawerPopupRef = ComponentPropsWithRef<typeof BaseDrawer.Popup>["ref"];

export type DrawerPosition = "top" | "right" | "bottom" | "left";
export type DrawerVariant = "default" | "straight" | "inset";

export type DrawerProps<Payload = unknown> = Closed<
	BaseDrawerRootProps<Payload> & {
		position?: DrawerPosition;
	}
>;

export type DrawerTriggerProps<Payload = unknown> = Closed<
	Omit<BaseDrawerTriggerProps<Payload>, "ref"> & {
		ref?: DrawerTriggerRef;
	}
>;

export type DrawerPopupProps = Closed<
	Omit<BaseDrawerPopupProps, "ref"> & {
		closeProps?: DrawerCloseProps;
		position?: DrawerPosition;
		portalProps?: Closed<BaseDrawerPortalProps>;
		ref?: DrawerPopupRef;
		showBar?: boolean;
		showCloseButton?: boolean;
		variant?: DrawerVariant;
	}
>;

export type DrawerContentProps = Closed<BaseDrawerContentProps>;

export type DrawerBarProps = Closed<DivProps & { position?: DrawerPosition }>;

export type DrawerTitleProps = Closed<BaseDrawerTitleProps>;
export type DrawerDescriptionProps = Closed<BaseDrawerDescriptionProps>;
export type DrawerCloseProps = Closed<BaseDrawerCloseProps>;
export type DrawerHeaderProps = Closed<
	Omit<useRender.ComponentProps<"div">, "data-slot"> & {
		allowSelection?: boolean;
	}
>;
export type DrawerPanelProps = Closed<
	Omit<useRender.ComponentProps<"div">, "data-slot"> & {
		allowSelection?: boolean;
		scrollFade?: boolean;
		scrollable?: boolean;
	}
>;
export type DrawerFooterProps = Closed<
	Omit<useRender.ComponentProps<"div">, "data-slot"> & {
		allowSelection?: boolean;
		variant?: "default" | "bare";
	}
>;

export type DrawerBackdropProps = Closed<BaseDrawer.Backdrop.Props>;
export type DrawerPortalProps = Closed<BaseDrawer.Portal.Props>;
export type DrawerViewportProps = Closed<
	BaseDrawer.Viewport.Props & {
		position?: DrawerPosition;
		variant?: DrawerVariant;
	}
>;
export type DrawerSwipeAreaProps = Closed<
	BaseDrawer.SwipeArea.Props & {
		position?: DrawerPosition;
	}
>;
