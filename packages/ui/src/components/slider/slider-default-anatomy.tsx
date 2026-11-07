import type { ReactElement, ReactNode } from "react";
import {
	SliderControl,
	SliderIndicator,
	SliderThumb,
	SliderTrack,
} from "./slider-context";

function getArrayVal(
	value: number | readonly number[] | undefined,
	defaultValue: number | readonly number[] | undefined
): readonly number[] | null {
	const activeValue = value === undefined ? defaultValue : value;
	return Array.isArray(activeValue) ? activeValue : null;
}

function getThumbAriaLabel(
	label: string | undefined,
	index: number,
	count: number
): string | undefined {
	if (!label) {
		return undefined;
	}
	if (count === 1) {
		return label;
	}
	if (count === 2) {
		return index === 0 ? `${label} minimum` : `${label} maximum`;
	}
	return `${label} value ${index + 1}`;
}

export function renderDefaultAnatomy(
	value: number | readonly number[] | undefined,
	defaultValue: number | readonly number[] | undefined,
	ariaLabel?: string
): ReactNode {
	const arrayVal = getArrayVal(value, defaultValue);

	if (arrayVal !== null) {
		const thumbs: ReactElement[] = [];
		for (let i = 0; i < arrayVal.length; i += 1) {
			const thumbAriaLabel = getThumbAriaLabel(ariaLabel, i, arrayVal.length);
			thumbs.push(
				<SliderThumb
					aria-label={thumbAriaLabel}
					index={i}
					key={`slider-thumb-${i}`}
				/>
			);
		}
		return (
			<SliderControl>
				<SliderTrack>
					<SliderIndicator />
					{thumbs}
				</SliderTrack>
			</SliderControl>
		);
	}

	return (
		<SliderControl>
			<SliderTrack>
				<SliderIndicator />
				<SliderThumb aria-label={ariaLabel} />
			</SliderTrack>
		</SliderControl>
	);
}
