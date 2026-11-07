import {
	Field,
	FieldDescription,
	FieldLabel,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@mizen/ui";
export function WebsiteInputGroup() {
	return (
		<Field>
			<FieldLabel>Website</FieldLabel>
			<InputGroup>
				<InputGroupInput name="website" placeholder="example.com" />
				<InputGroupAddon align="inline-start">
					<InputGroupText>https://</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
			<FieldDescription>
				Enter the public domain without the protocol.
			</FieldDescription>
		</Field>
	);
}
