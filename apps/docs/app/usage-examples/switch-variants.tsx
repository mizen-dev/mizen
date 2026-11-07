import { Field, FieldDescription, FieldLabel, Stack, Switch } from "@mizen/ui";

export function SwitchWorkspacePreferencesExample1() {
	return (
		<Stack gap="4">
			<Field>
				<FieldLabel>
					<Switch defaultChecked name="sync" value="enabled" />
					Sync changes
				</FieldLabel>
				<FieldDescription>
					Keep this workspace synchronized across devices.
				</FieldDescription>
			</Field>
			<Field>
				<FieldLabel>
					<Switch name="compact-mode" size="sm" />
					Compact mode
				</FieldLabel>
			</Field>
		</Stack>
	);
}
export function SwitchPermissionsAndValidationExample2() {
	return (
		<Stack gap="4">
			<Field disabled>
				<FieldLabel>
					<Switch defaultChecked name="managed-mode" readOnly size="lg" />
					Managed setting
				</FieldLabel>
			</Field>
			<Field>
				<FieldLabel>
					<Switch defaultChecked name="read-only-mode" readOnly />
					Read-only mode
				</FieldLabel>
			</Field>
			<Field invalid>
				<FieldLabel>
					<Switch invalid name="invalid-mode" />
					Invalid mode
				</FieldLabel>
			</Field>
		</Stack>
	);
}
