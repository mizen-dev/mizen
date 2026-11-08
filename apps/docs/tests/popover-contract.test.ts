import type { ComponentProps } from "react";
import { describe, expect, it } from "vite-plus/test";
import type {
	PopoverPrimitive as BasePopover,
	PopoverCloseProps,
	PopoverDescriptionProps,
	PopoverPopup,
	PopoverPopupProps,
	PopoverPopupVariant,
	PopoverTitleProps,
	PopoverTriggerProps,
} from "../../../packages/ui/src/components/popover/popover";

type IsExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type RejectsStyling<T> = [Extract<keyof T, "className" | "style">] extends [
	never,
]
	? true
	: false;

type ClosedPopoverContract = [
	RejectsStyling<PopoverTriggerProps>,
	RejectsStyling<PopoverPopupProps>,
	IsExact<
		PopoverPopupProps["render"],
		ComponentProps<typeof BasePopover.Popup>["render"]
	>,
	IsExact<
		PopoverPopupProps["portalProps"],
		ComponentProps<typeof BasePopover.Portal> | undefined
	>,
	IsExact<PopoverTitleProps, ComponentProps<typeof BasePopover.Title>>,
	IsExact<
		PopoverDescriptionProps,
		ComponentProps<typeof BasePopover.Description>
	>,
	IsExact<PopoverCloseProps, ComponentProps<typeof BasePopover.Close>>,
	IsExact<PopoverPopupProps["tooltipStyle"], boolean | undefined>,
	IsExact<PopoverPopupVariant, "default" | "bare">,
	IsExact<PopoverPopupProps["variant"], PopoverPopupVariant | undefined>,
	IsExact<
		ComponentProps<typeof PopoverPopup>["variant"],
		PopoverPopupVariant | undefined
	>,
];

const contractChecks: ClosedPopoverContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];

describe("Popover popup variant contract", () => {
	it("enforces variant type options statically", () => {
		expect(contractChecks.every((check) => check === true)).toBe(true);
	});
});
