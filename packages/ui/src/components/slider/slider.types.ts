import type {
	SliderControlProps as BaseSliderControlProps,
	SliderIndicatorProps as BaseSliderIndicatorProps,
	SliderLabelProps as BaseSliderLabelProps,
	SliderRootProps as BaseSliderRootProps,
	SliderThumbProps as BaseSliderThumbProps,
	SliderTrackProps as BaseSliderTrackProps,
	SliderValueProps as BaseSliderValueProps,
} from "@base-ui/react/slider";
import type { ComponentPropsWithRef, ReactNode } from "react";

type Closed<T> = Omit<T, "className" | "data-slot" | "readOnly" | "style">;

export type SliderSize = "default" | "lg" | "sm";

export type SliderProps<Value extends number | readonly number[] = number> =
	Closed<
		Omit<BaseSliderRootProps<Value>, "data-slot"> & {
			getAriaLabel?: (index: number) => string;
			invalid?: boolean;
			ref?: ComponentPropsWithRef<"div">["ref"];
			size?: SliderSize;
			ticks?: boolean;
			thumbValue?: boolean;
		}
	>;

export type SliderControlProps = Closed<BaseSliderControlProps> & {
	children?: ReactNode;
	ref?: ComponentPropsWithRef<"div">["ref"];
};

export type SliderTrackProps = Closed<BaseSliderTrackProps> & {
	children?: ReactNode;
	ref?: ComponentPropsWithRef<"div">["ref"];
};

export type SliderIndicatorProps = Closed<BaseSliderIndicatorProps> & {
	children?: ReactNode;
	ref?: ComponentPropsWithRef<"div">["ref"];
};

export type SliderThumbProps = Closed<BaseSliderThumbProps> & {
	children?: ReactNode;
	ref?: ComponentPropsWithRef<"div">["ref"];
};

export type SliderLabelProps = Closed<BaseSliderLabelProps> & {
	children?: ReactNode;
	ref?: ComponentPropsWithRef<"div">["ref"];
};

export type SliderValueProps = Closed<
	Omit<BaseSliderValueProps, "data-slot"> & {
		ref?: ComponentPropsWithRef<"output">["ref"];
	}
>;
