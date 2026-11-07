"use client";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	Slider,
	SliderValue,
	Stack,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { useState } from "react";
import { sliderPreviewStyles } from "./slider-preview.styles";

function getRangeAriaLabel(index: number): string {
	return index === 0 ? "Price range minimum" : "Price range maximum";
}
export function SliderAudioSettingsExample1() {
	const [volume, setVolume] = useState<number>(50);
	return (
		<Stack gap="4">
			<Field>
				<FieldLabel>Volume</FieldLabel>
				<Slider
					aria-label="Volume"
					data-testid="slider-default"
					onValueChange={setVolume}
					value={volume}
				/>
				<FieldDescription>
					Current level:{" "}
					<span data-testid="slider-default-value">{volume}</span>%
				</FieldDescription>
			</Field>
		</Stack>
	);
}
export function SliderControlSizesExample2() {
	return (
		<Stack gap="6">
			<Field>
				<FieldLabel>Small size</FieldLabel>
				<Slider
					aria-label="Small size"
					data-testid="slider-size-sm"
					defaultValue={30}
					size="sm"
				/>
			</Field>

			<Field>
				<FieldLabel>Default size</FieldLabel>
				<Slider
					aria-label="Default size"
					data-testid="slider-size-default"
					defaultValue={50}
					size="default"
				/>
			</Field>

			<Field>
				<FieldLabel>Large size</FieldLabel>
				<Slider
					aria-label="Large size"
					data-testid="slider-size-lg"
					defaultValue={70}
					size="lg"
				/>
			</Field>
		</Stack>
	);
}
export function SliderRangesAndOrientationExample3() {
	return (
		<Stack gap="6">
			<Field>
				<FieldLabel>Price range</FieldLabel>
				<Slider
					aria-label="Price range"
					data-testid="slider-range"
					defaultValue={[25, 75]}
					getAriaLabel={getRangeAriaLabel}
				/>
				<FieldDescription>
					Dual thumbs define lower and upper boundaries.
				</FieldDescription>
			</Field>

			<Field>
				<FieldLabel>Vertical level</FieldLabel>
				<Slider
					aria-label="Vertical level"
					data-testid="slider-vertical"
					defaultValue={60}
					orientation="vertical"
				/>
				<FieldDescription>
					Vertical orientation with rotated geometry.
				</FieldDescription>
			</Field>
		</Stack>
	);
}
export function SliderPermissionsAndValidationExample4() {
	return (
		<Stack gap="6">
			<Field disabled>
				<FieldLabel>Disabled</FieldLabel>
				<Slider
					aria-label="Disabled slider"
					data-testid="slider-disabled"
					defaultValue={40}
					disabled
				/>
				<FieldDescription>
					Temporarily unavailable for user interaction.
				</FieldDescription>
			</Field>

			<Field>
				<FieldLabel>Invalid</FieldLabel>
				<Slider
					aria-label="Invalid slider"
					data-testid="slider-invalid"
					defaultValue={85}
					invalid
				/>
				<FieldError match>Value exceeds permitted threshold.</FieldError>
			</Field>

			<Field disabled invalid>
				<FieldLabel>Disabled and invalid</FieldLabel>
				<Slider
					aria-label="Disabled and invalid slider"
					data-testid="slider-disabled-invalid"
					defaultValue={90}
					disabled
					invalid
				/>
				<FieldDescription>Disabled styling takes precedence.</FieldDescription>
			</Field>
		</Stack>
	);
}

export function SliderTicksAndValueExample5() {
	return (
		<Stack gap="6">
			<Field>
				<FieldLabel>Stepped level</FieldLabel>
				<Slider
					aria-label="Stepped level"
					data-testid="slider-ticks"
					defaultValue={50}
					step={10}
					ticks
				/>
				<FieldDescription>
					Dots follow step. Drag or use arrow keys to snap between them.
				</FieldDescription>
			</Field>
			<Field>
				<FieldLabel>Zoom</FieldLabel>
				<Slider
					aria-label="Zoom"
					data-testid="slider-thumb-value"
					defaultValue={1}
					format={{ style: "percent" }}
					max={2}
					min={0}
					step={0.1}
					thumbValue
					ticks
				/>
			</Field>
			<Field>
				<Slider
					aria-label="Opacity"
					data-testid="slider-with-value"
					defaultValue={50}
				>
					<div {...props(sliderPreviewStyles.valueRow)}>
						<FieldLabel>Opacity</FieldLabel>
						<SliderValue />
					</div>
				</Slider>
			</Field>
		</Stack>
	);
}
