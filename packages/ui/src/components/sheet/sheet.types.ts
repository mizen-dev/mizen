import type {
	Dialog as BaseDialog,
	DialogCloseProps as BaseDialogCloseProps,
	DialogDescriptionProps as BaseDialogDescriptionProps,
	DialogPopupProps as BaseDialogPopupProps,
	DialogPortalProps as BaseDialogPortalProps,
	DialogRootProps as BaseDialogRootProps,
	DialogTitleProps as BaseDialogTitleProps,
	DialogTriggerProps as BaseDialogTriggerProps,
} from "@base-ui/react/dialog";
import type { useRender } from "@base-ui/react/use-render";
import type { ComponentPropsWithRef } from "react";

type Closed<T> = Omit<T, "className" | "style">;
type SheetTriggerRef = ComponentPropsWithRef<typeof BaseDialog.Trigger>["ref"];
type SheetPopupRef = ComponentPropsWithRef<typeof BaseDialog.Popup>["ref"];

export type SheetSide = "top" | "right" | "bottom" | "left";
export type SheetVariant = "default" | "inset";

export type SheetProps<Payload = unknown> = BaseDialogRootProps<Payload>;

export type SheetTriggerProps<Payload = unknown> = Omit<
	BaseDialogTriggerProps<Payload>,
	"className" | "ref" | "style"
> & {
	ref?: SheetTriggerRef;
};

export type SheetPopupProps = Omit<
	BaseDialogPopupProps,
	"className" | "ref" | "render" | "style"
> & {
	closeProps?: SheetCloseProps;
	portalProps?: Omit<
		BaseDialogPortalProps,
		"children" | "className" | "ref" | "render" | "style"
	>;
	ref?: SheetPopupRef;
	showCloseButton?: boolean;
	side?: SheetSide;
	variant?: SheetVariant;
};

export type SheetContentProps = SheetPopupProps;
export type SheetTitleProps = Closed<BaseDialogTitleProps>;
export type SheetDescriptionProps = Closed<BaseDialogDescriptionProps>;
export type SheetCloseProps = Omit<BaseDialogCloseProps, "className" | "style">;

export type SheetHeaderProps = Omit<
	useRender.ComponentProps<"div">,
	"className" | "data-slot" | "style"
>;

export type SheetPanelProps = Omit<
	useRender.ComponentProps<"div">,
	"className" | "data-slot" | "style"
> & {
	scrollFade?: boolean;
};

export type SheetFooterProps = Omit<
	useRender.ComponentProps<"div">,
	"className" | "data-slot" | "style"
> & {
	variant?: "default" | "bare";
};
