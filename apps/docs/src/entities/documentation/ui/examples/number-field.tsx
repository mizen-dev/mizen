import {
	Field,
	FieldDescription,
	FieldLabel,
	NumberField,
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
} from "@mizen-labs/ui";
export function BoundedQuantity() {
	return (
		<Field>
			<FieldLabel>Seats</FieldLabel>
			<NumberField defaultValue={4} max={12} min={1} name="seats" step={1}>
				<NumberFieldGroup>
					<NumberFieldDecrement aria-label="Decrease seats" />
					<NumberFieldInput />
					<NumberFieldIncrement aria-label="Increase seats" />
				</NumberFieldGroup>
			</NumberField>
			<FieldDescription>Choose between 1 and 12 seats.</FieldDescription>
		</Field>
	);
}
