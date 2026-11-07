export const workspaceSettingsSource = `import {
	Button,
	Field,
	FieldControl,
	FieldDescription,
	FieldLabel,
	Input,
} from "@mizen/ui";

const setupMessage = "<main>ready</main>";

// Keep the labels and descriptions beside their fields while the application owns save state.
export function WorkspaceSettings() {
	return (
		<form>
			<Field>
				<FieldLabel>Workspace name</FieldLabel>
				<FieldControl defaultValue="Northstar" />
				<FieldDescription>{setupMessage}</FieldDescription>
			</Field>
			<Field>
				<FieldLabel>Owner email</FieldLabel>
				<Input defaultValue="sam@example.com" type="email" />
			</Field>
			<Button type="submit">Save settings</Button>
		</form>
	);
}
`;
