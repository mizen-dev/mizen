"use client";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	NumberField,
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
	NumberFieldScrubArea,
	Stack,
} from "@mizen/ui";
import { useState } from "react";

export function NumberFieldPurchaseDetailsExample1() {
	const [quantity, setQuantity] = useState<number | null>(4);
	return (
		<Stack gap="6">
			<Field>
				<FieldLabel>Transaction amount</FieldLabel>
				<NumberField
					data-testid="number-field-formatted"
					defaultValue={1250}
					format={{
						currency: "USD",
						minimumFractionDigits: 2,
						style: "currency",
					}}
					locale="en-US"
					step={10}
				>
					<NumberFieldGroup>
						<NumberFieldDecrement data-testid="formatted-decrement" />
						<NumberFieldInput data-testid="formatted-input" />
						<NumberFieldIncrement data-testid="formatted-increment" />
					</NumberFieldGroup>
				</NumberField>
				<FieldDescription>
					Formatted with US currency and deterministic fractions.
				</FieldDescription>
			</Field>

			<Field>
				<FieldLabel>Bounded quantity</FieldLabel>
				<NumberField
					allowWheelScrub
					data-testid="number-field-bounded"
					max={10}
					min={1}
					onValueChange={setQuantity}
					step={1}
					value={quantity}
				>
					<NumberFieldGroup>
						<NumberFieldDecrement data-testid="bounded-decrement" />
						<NumberFieldInput data-testid="bounded-input" />
						<NumberFieldIncrement data-testid="bounded-increment" />
					</NumberFieldGroup>
				</NumberField>
				<FieldDescription>
					Current value:{" "}
					<span data-testid="bounded-value">{quantity ?? "Empty"}</span> (range
					1–10, step 1).
				</FieldDescription>
			</Field>
		</Stack>
	);
}
export function NumberFieldCanvasSpacingExample2() {
	return (
		<Stack gap="6">
			<Field>
				<NumberField
					data-testid="number-field-scrub-horizontal"
					defaultValue={64}
					max={512}
					min={0}
					step={8}
				>
					<NumberFieldScrubArea
						data-testid="scrub-area-horizontal"
						direction="horizontal"
						label="Horizontal padding"
					/>
					<NumberFieldGroup>
						<NumberFieldDecrement data-testid="scrub-horizontal-decrement" />
						<NumberFieldInput data-testid="scrub-horizontal-input" />
						<NumberFieldIncrement data-testid="scrub-horizontal-increment" />
					</NumberFieldGroup>
				</NumberField>
				<FieldDescription>
					Drag horizontally across the label to scrub values.
				</FieldDescription>
			</Field>

			<Field>
				<NumberField
					data-testid="number-field-scrub-vertical"
					defaultValue={32}
					max={256}
					min={0}
					step={4}
				>
					<NumberFieldScrubArea
						data-testid="scrub-area-vertical"
						direction="vertical"
					>
						Vertical margin
					</NumberFieldScrubArea>
					<NumberFieldGroup>
						<NumberFieldDecrement data-testid="scrub-vertical-decrement" />
						<NumberFieldInput data-testid="scrub-vertical-input" />
						<NumberFieldIncrement data-testid="scrub-vertical-increment" />
					</NumberFieldGroup>
				</NumberField>
				<FieldDescription>
					Drag vertically across the label to scrub values.
				</FieldDescription>
			</Field>
		</Stack>
	);
}
export function NumberFieldControlSizesExample3() {
	return (
		<Stack gap="6">
			<Field>
				<FieldLabel>Small size</FieldLabel>
				<NumberField
					data-testid="number-field-size-sm"
					defaultValue={12}
					size="sm"
				>
					<NumberFieldGroup>
						<NumberFieldDecrement />
						<NumberFieldInput />
						<NumberFieldIncrement />
					</NumberFieldGroup>
				</NumberField>
			</Field>

			<Field>
				<FieldLabel>Default size</FieldLabel>
				<NumberField
					data-testid="number-field-size-default"
					defaultValue={24}
					size="default"
				>
					<NumberFieldGroup>
						<NumberFieldDecrement />
						<NumberFieldInput />
						<NumberFieldIncrement />
					</NumberFieldGroup>
				</NumberField>
			</Field>

			<Field>
				<FieldLabel>Large size</FieldLabel>
				<NumberField
					data-testid="number-field-size-lg"
					defaultValue={48}
					size="lg"
				>
					<NumberFieldGroup>
						<NumberFieldDecrement />
						<NumberFieldInput />
						<NumberFieldIncrement />
					</NumberFieldGroup>
				</NumberField>
			</Field>
		</Stack>
	);
}
export function NumberFieldLimitsAndValidationExample4() {
	return (
		<Stack gap="6">
			<Field>
				<FieldLabel>Read-only threshold</FieldLabel>
				<NumberField
					data-testid="number-field-readonly"
					defaultValue={100}
					readOnly
				>
					<NumberFieldGroup>
						<NumberFieldDecrement data-testid="readonly-decrement" />
						<NumberFieldInput data-testid="readonly-input" />
						<NumberFieldIncrement data-testid="readonly-increment" />
					</NumberFieldGroup>
				</NumberField>
				<FieldDescription>
					Fixed system limit that cannot be altered.
				</FieldDescription>
			</Field>

			<Field disabled>
				<FieldLabel>Disabled parameter</FieldLabel>
				<NumberField
					data-testid="number-field-disabled"
					defaultValue={50}
					disabled
				>
					<NumberFieldGroup>
						<NumberFieldDecrement data-testid="disabled-decrement" />
						<NumberFieldInput data-testid="disabled-input" />
						<NumberFieldIncrement data-testid="disabled-increment" />
					</NumberFieldGroup>
				</NumberField>
				<FieldDescription>
					Temporarily unavailable for editing.
				</FieldDescription>
			</Field>

			<Field invalid>
				<FieldLabel>Invalid port</FieldLabel>
				<NumberField data-testid="number-field-invalid" defaultValue={99_999}>
					<NumberFieldGroup>
						<NumberFieldDecrement data-testid="invalid-decrement" />
						<NumberFieldInput data-testid="invalid-input" />
						<NumberFieldIncrement data-testid="invalid-increment" />
					</NumberFieldGroup>
				</NumberField>
				<FieldError match>
					Value exceeds maximum allowed network port.
				</FieldError>
			</Field>

			<Field disabled invalid>
				<FieldLabel>Disabled and invalid setting</FieldLabel>
				<NumberField
					data-testid="number-field-disabled-invalid"
					defaultValue={0}
					disabled
				>
					<NumberFieldGroup>
						<NumberFieldDecrement data-testid="disabled-invalid-decrement" />
						<NumberFieldInput data-testid="disabled-invalid-input" />
						<NumberFieldIncrement data-testid="disabled-invalid-increment" />
					</NumberFieldGroup>
				</NumberField>
				<FieldDescription>
					Disabled state takes visual precedence over invalid state.
				</FieldDescription>
			</Field>
		</Stack>
	);
}
