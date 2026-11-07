import { Input, Label, Stack } from "@mizen-labs/ui";

export function WorkspaceNameField() {
	return (
		<Stack gap="2">
			<Label htmlFor="usage-workspace-name">Workspace name</Label>
			<Input defaultValue="Northstar" id="usage-workspace-name" />
		</Stack>
	);
}
