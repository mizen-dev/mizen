import {
	Field,
	FieldLabel,
	Fieldset,
	FieldsetLegend,
	Radio,
	RadioGroup,
} from "@mizen-labs/ui";
export function DensityOptions() {
	return (
		<Fieldset render={<RadioGroup defaultValue="comfortable" name="density" />}>
			<FieldsetLegend>Interface density</FieldsetLegend>
			<Field>
				<FieldLabel>
					<Radio value="compact" />
					Compact
				</FieldLabel>
			</Field>
			<Field>
				<FieldLabel>
					<Radio value="comfortable" />
					Comfortable
				</FieldLabel>
			</Field>
			<Field>
				<FieldLabel>
					<Radio value="spacious" />
					Spacious
				</FieldLabel>
			</Field>
		</Fieldset>
	);
}
