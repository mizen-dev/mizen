import type { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import type { ComponentPropsWithRef, ReactNode } from "react";

type Closed<T> = Omit<T, "className" | "data-slot" | "style">;

export type NumberFieldSize = "default" | "sm" | "lg";

export type NumberFieldProps = Closed<NumberFieldPrimitive.Root.Props> & {
	children?: ReactNode;
	ref?: ComponentPropsWithRef<"div">["ref"];
	size?: NumberFieldSize;
};

export type NumberFieldGroupProps = Closed<NumberFieldPrimitive.Group.Props> & {
	children?: ReactNode;
	ref?: ComponentPropsWithRef<"div">["ref"];
};

export type NumberFieldInputProps = Closed<NumberFieldPrimitive.Input.Props> & {
	ref?: ComponentPropsWithRef<"input">["ref"];
};

export type NumberFieldIncrementProps = Omit<
	Closed<NumberFieldPrimitive.Increment.Props>,
	"tabIndex"
> & {
	children?: ReactNode;
	ref?: ComponentPropsWithRef<"button">["ref"];
};

export type NumberFieldDecrementProps = Omit<
	Closed<NumberFieldPrimitive.Decrement.Props>,
	"tabIndex"
> & {
	children?: ReactNode;
	ref?: ComponentPropsWithRef<"button">["ref"];
};

export type NumberFieldScrubAreaProps = Omit<
	Closed<NumberFieldPrimitive.ScrubArea.Props>,
	"data-direction"
> & {
	children?: ReactNode;
	label?: string;
	ref?: ComponentPropsWithRef<"span">["ref"];
};
