import { Field, FieldDescription, FieldLabel, Slider } from "@mizen-labs/ui";
export function VolumeSlider() {
	return (
		<Field>
			<FieldLabel>Volume</FieldLabel>
			<Slider
				aria-label="Volume"
				defaultValue={50}
				max={100}
				min={0}
				step={1}
			/>
			<FieldDescription>
				Adjust from 0 to 100 percent with the arrow keys.
			</FieldDescription>
		</Field>
	);
}
