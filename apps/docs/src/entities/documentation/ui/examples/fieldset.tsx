import {
	Field,
	FieldDescription,
	FieldLabel,
	Fieldset,
	FieldsetLegend,
	Input,
	Stack,
} from "@mizen-labs/ui";
export function ContactDetailsFieldset() {
	return (
		<Fieldset>
			<Stack gap="3">
				<FieldsetLegend>Contact details</FieldsetLegend>
				<Field>
					<FieldLabel>Full name</FieldLabel>
					<Input autoComplete="name" defaultValue="Maya Chen" name="name" />
				</Field>
				<Field>
					<FieldLabel>Email address</FieldLabel>
					<Input
						autoComplete="email"
						defaultValue="maya@northstar.dev"
						name="email"
						type="email"
					/>
					<FieldDescription>Used for account notifications.</FieldDescription>
				</Field>
			</Stack>
		</Fieldset>
	);
}
