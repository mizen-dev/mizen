"use client";

import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	Slider,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { useState } from "react";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

function getRangeAriaLabel(index: number): string {
	return index === 0 ? "Price range minimum" : "Price range maximum";
}

export function SliderSpecimen() {
	const [volume, setVolume] = useState<number>(50);

	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Adjust playback volume with the keyboard or pointer."
				primary
				title="Audio settings"
			>
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
			</SpecimenSection>
			<SpecimenSection title="Control sizes">
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
			</SpecimenSection>
			<SpecimenSection title="Ranges and orientation">
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
			</SpecimenSection>
			<SpecimenSection title="Permissions and validation">
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
					<FieldDescription>
						Disabled styling takes precedence.
					</FieldDescription>
				</Field>
			</SpecimenSection>
		</div>
	);
}
