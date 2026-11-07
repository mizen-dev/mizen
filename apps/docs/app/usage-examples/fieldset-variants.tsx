import {
	Checkbox,
	Field,
	FieldDescription,
	FieldLabel,
	Fieldset,
	FieldsetLegend,
	Input,
	Stack,
} from "@mizen-labs/ui";

export function FieldsetAccountProfileExample1() {
	return (
		<Stack gap="4">
			<Fieldset>
				<Stack gap="3">
					<FieldsetLegend>Personal details</FieldsetLegend>
					<Field>
						<FieldLabel>Full name</FieldLabel>
						<Input defaultValue="Alex Morgan" />
					</Field>
					<Field>
						<FieldLabel>Email address</FieldLabel>
						<Input defaultValue="alex@example.com" type="email" />
						<FieldDescription>
							Used for notifications and account verification.
						</FieldDescription>
					</Field>
				</Stack>
			</Fieldset>
		</Stack>
	);
}
export function FieldsetManagedBillingExample2() {
	return (
		<Stack gap="4">
			<Fieldset disabled>
				<Stack gap="3">
					<FieldsetLegend>Billing settings (disabled)</FieldsetLegend>
					<Field>
						<FieldLabel>Tax identifier</FieldLabel>
						<Input defaultValue="TAX-948102" readOnly />
						<FieldDescription>
							Managed by organization administrators.
						</FieldDescription>
					</Field>
					<Field>
						<FieldLabel>
							<Checkbox defaultChecked name="auto-renew" />
							<span>Automatically renew subscription</span>
						</FieldLabel>
					</Field>
				</Stack>
			</Fieldset>
		</Stack>
	);
}
