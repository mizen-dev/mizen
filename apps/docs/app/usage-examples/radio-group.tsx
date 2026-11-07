import {
	Field,
	FieldLabel,
	Heading,
	Radio,
	RadioGroup,
	Stack,
} from "@mizen/ui";
export function DensityOptions() {
	return (
		<Stack gap="3">
			<Heading id="density-options" level={3}>
				Interface density
			</Heading>
			<RadioGroup
				aria-labelledby="density-options"
				defaultValue="comfortable"
				name="density"
			>
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
			</RadioGroup>
		</Stack>
	);
}
