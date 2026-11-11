import { mergeProps } from "@base-ui/react/merge-props";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { cloneElement, createContext, useCallback, useContext } from "react";
import { assignRef } from "../../ref-utils";
import { protectRenderSlot } from "../../render-utils";
import { controlSize } from "../../styles/dimensions.stylex";
import { space } from "../../styles/spacing.stylex";
import { typographyStyles } from "../../styles/typography.styles";
import { sliderStyles } from "./slider.styles";
import type {
	SliderControlProps,
	SliderIndicatorProps,
	SliderSize,
	SliderThumbProps,
	SliderTrackProps,
} from "./slider.types";
import { syncInputInvalid } from "./slider-ref-utils";
import { stripForbidden } from "./slider-slot";

export interface SliderContextValue {
	readonly disabled?: boolean;
	readonly getAriaLabel?: (index: number) => string;
	readonly invalid: boolean;
	readonly max: number;
	readonly min: number;
	readonly orientation: "horizontal" | "vertical";
	readonly range: boolean;
	readonly size: SliderSize;
	readonly step: number;
	readonly thumbAlignment: "edge" | "center" | "edge-client-only";
	readonly thumbValue: boolean;
	readonly ticks: boolean;
	readonly valueCharacters: number;
}

export const SliderContext = createContext<SliderContextValue>({
	disabled: undefined,
	invalid: false,
	max: 100,
	min: 0,
	orientation: "horizontal",
	range: false,
	size: "default",
	step: 1,
	thumbAlignment: "edge",
	thumbValue: false,
	ticks: false,
	valueCharacters: 3,
});

export function useSliderContext(): SliderContextValue {
	return useContext(SliderContext);
}

const controlStyles = {
	default: {
		horizontal: sliderStyles.controlDefaultHorizontal,
		vertical: sliderStyles.controlDefaultVertical,
	},
	lg: {
		horizontal: sliderStyles.controlLgHorizontal,
		vertical: sliderStyles.controlLgVertical,
	},
	sm: {
		horizontal: sliderStyles.controlSmHorizontal,
		vertical: sliderStyles.controlSmVertical,
	},
};

const trackStyles = {
	default: {
		horizontal: sliderStyles.trackDefaultHorizontal,
		vertical: sliderStyles.trackDefaultVertical,
	},
	lg: {
		horizontal: sliderStyles.trackLgHorizontal,
		vertical: sliderStyles.trackLgVertical,
	},
	sm: {
		horizontal: sliderStyles.trackSmHorizontal,
		vertical: sliderStyles.trackSmVertical,
	},
};

const thumbSizeStyles = {
	default: sliderStyles.thumbDefault,
	lg: sliderStyles.thumbLg,
	sm: sliderStyles.thumbSm,
};

export function SliderControl({
	children,
	ref: forwardedRef,
	render,
	...rest
}: SliderControlProps): ReactElement {
	const { orientation, size } = useSliderContext();
	stripForbidden(rest);

	return (
		<BaseSlider.Control
			{...rest}
			data-orientation={orientation}
			data-size={size}
			data-slot="slider-control"
			ref={forwardedRef}
			render={protectRenderSlot("slider-control", render, {
				"data-orientation": orientation,
				"data-size": size,
			})}
			{...props(
				sliderStyles.control,
				orientation === "vertical"
					? sliderStyles.controlVertical
					: sliderStyles.controlHorizontal,
				controlStyles[size][orientation]
			)}
		>
			{children}
		</BaseSlider.Control>
	);
}

type TrackRender = SliderTrackProps["render"];
type IndicatorRender = SliderIndicatorProps["render"];

function isFilled(tick: number, values: readonly number[], range: boolean) {
	const first = values[0] ?? 0;
	return range
		? tick >= first && tick <= (values.at(-1) ?? first)
		: tick <= first;
}

// The step dots. Dots inside the filled range are marked so they read on the
// accent fill.
function SliderTicks({ values }: { values: readonly number[] }) {
	const {
		max,
		min,
		orientation,
		range,
		size,
		step,
		thumbAlignment,
		thumbValue,
		valueCharacters,
	} = useSliderContext();
	if (!(max > min && step > 0)) {
		return null;
	}
	const count = Math.floor((max - min) / step) + 1;
	return (
		<span
			aria-hidden="true"
			data-slot="slider-ticks"
			{...props(
				sliderStyles.ticks,
				orientation === "vertical"
					? sliderStyles.ticksVertical
					: sliderStyles.ticksHorizontal,
				sliderStyles.tickInset(
					thumbAlignment,
					thumbValue,
					valueCharacters,
					size
				)
			)}
		>
			{Array.from({ length: count }, (_, index) => min + index * step).map(
				(tick) => (
					<span
						data-filled={isFilled(tick, values, range) || undefined}
						key={tick}
						{...props(
							sliderStyles.tick,
							sliderStyles.tickPosition(
								orientation,
								((tick - min) / (max - min)) * 100
							)
						)}
					/>
				)
			)}
		</span>
	);
}

type PartRender = ReactElement | ((props: never, state: never) => ReactElement);

// Calls the part's own render (element, function, or a plain div) with extra
// props built from Base UI's state, which carries the current values.
function composeRender<State extends { values: readonly number[] }>(
	render: PartRender | undefined,
	extend: (
		renderProps: ComponentPropsWithRef<"div">,
		state: State
	) => ComponentPropsWithRef<"div">
) {
	return (renderProps: ComponentPropsWithRef<"div">, state: State) => {
		const merged = extend(renderProps, state);
		if (typeof render === "function") {
			return (render as (p: typeof merged, s: State) => ReactElement)(
				merged,
				state
			);
		}
		return render ? (
			cloneElement(render, mergeProps(render.props as object, merged))
		) : (
			<div {...merged} />
		);
	};
}

// Base UI passes the current values to the track's render function, so the
// ticks render there instead of as plain children.
function withTicks(render: TrackRender, ticks: boolean): TrackRender {
	if (!ticks) {
		return render;
	}
	return composeRender(
		render as PartRender | undefined,
		(renderProps, state) => ({
			...renderProps,
			children: (
				<>
					<SliderTicks values={state.values} />
					{renderProps.children}
				</>
			),
		})
	) as TrackRender;
}

// A fill with no length draws only its padding, a ring around the thumb.
// That happens at the minimum of a single slider, or when range thumbs meet.
function isEmptyFill(values: readonly number[], range: boolean, min: number) {
	const first = values[0] ?? min;
	return range ? first === (values.at(-1) ?? first) : first <= min;
}

function withEmptyMark(
	render: IndicatorRender,
	range: boolean,
	min: number
): IndicatorRender {
	return composeRender(
		render as PartRender | undefined,
		(renderProps, state) => ({
			...renderProps,
			...(isEmptyFill(state.values, range, min) ? { "data-empty": "" } : {}),
		})
	) as IndicatorRender;
}

export function SliderTrack({
	children,
	ref: forwardedRef,
	render,
	...rest
}: SliderTrackProps): ReactElement {
	const { invalid, orientation, size, ticks } = useSliderContext();
	stripForbidden(rest);

	return (
		<BaseSlider.Track
			{...rest}
			{...(invalid ? { "data-invalid": "" } : {})}
			data-orientation={orientation}
			data-size={size}
			data-slot="slider-track"
			ref={forwardedRef}
			render={protectRenderSlot("slider-track", withTicks(render, ticks), {
				...(invalid ? { "data-invalid": "" } : {}),
				"data-orientation": orientation,
				"data-size": size,
			})}
			{...props(
				sliderStyles.track,
				orientation === "vertical"
					? sliderStyles.trackVertical
					: sliderStyles.trackHorizontal,
				trackStyles[size][orientation]
			)}
		>
			{children}
		</BaseSlider.Track>
	);
}

export function SliderIndicator({
	children,
	ref: forwardedRef,
	render,
	...rest
}: SliderIndicatorProps): ReactElement {
	const {
		invalid,
		min,
		orientation,
		size,
		thumbValue,
		valueCharacters,
		range,
	} = useSliderContext();
	const thumbSize = {
		default: controlSize.xs,
		lg: controlSize.sm,
		sm: controlSize.xs,
	}[size];
	const extent =
		thumbValue && orientation === "horizontal"
			? `max(1.75rem, calc((${valueCharacters}ch + ${space["3"]}) / 2))`
			: `calc(${thumbSize} / 2)`;
	stripForbidden(rest);

	return (
		<BaseSlider.Indicator
			{...rest}
			{...(invalid ? { "data-invalid": "" } : {})}
			data-orientation={orientation}
			data-size={size}
			data-slot="slider-indicator"
			ref={forwardedRef}
			render={protectRenderSlot(
				"slider-indicator",
				withEmptyMark(render, range, min),
				{
					...(invalid ? { "data-invalid": "" } : {}),
					"data-orientation": orientation,
					"data-size": size,
				}
			)}
			{...props(
				sliderStyles.indicator,
				sliderStyles.indicatorExtent(orientation, extent, range)
			)}
		>
			{children}
		</BaseSlider.Indicator>
	);
}

export function SliderThumb({
	children,
	disabled: disabledProp,
	getAriaLabel: getAriaLabelProp,
	index,
	inputRef: consumerInputRef,
	ref: forwardedRef,
	render,
	...rest
}: SliderThumbProps): ReactElement {
	const {
		disabled: contextDisabled,
		getAriaLabel: contextGetAriaLabel,
		invalid,
		orientation,
		size,
		thumbValue,
		valueCharacters,
	} = useSliderContext();
	const disabled = disabledProp ?? contextDisabled;
	const getAriaLabel =
		getAriaLabelProp === undefined ? contextGetAriaLabel : getAriaLabelProp;
	stripForbidden(rest);

	const handleInputRef = useCallback(
		(element: HTMLInputElement | null) => {
			syncInputInvalid(element, invalid);
			return assignRef(consumerInputRef, element);
		},
		[consumerInputRef, invalid]
	);

	return (
		<BaseSlider.Thumb
			{...rest}
			{...(invalid ? { "data-invalid": "" } : {})}
			data-orientation={orientation}
			data-size={size}
			data-slot="slider-thumb"
			disabled={disabled}
			getAriaLabel={getAriaLabel}
			index={index}
			inputRef={handleInputRef}
			ref={forwardedRef}
			render={protectRenderSlot("slider-thumb", render, {
				...(index === undefined ? {} : { "data-index": index }),
				...(invalid ? { "data-invalid": "" } : {}),
				"data-orientation": orientation,
				"data-size": size,
			})}
			{...props(
				sliderStyles.thumb,
				thumbSizeStyles[size],
				thumbValue && sliderStyles.thumbWithValue(valueCharacters),
				disabled && sliderStyles.thumbDisabled
			)}
		>
			{children ??
				(thumbValue ? (
					<BaseSlider.Value
						aria-hidden="true"
						{...props(sliderStyles.thumbValue, typographyStyles.controlLabel)}
					>
						{(formattedValues) => formattedValues[index ?? 0]}
					</BaseSlider.Value>
				) : null)}
		</BaseSlider.Thumb>
	);
}
