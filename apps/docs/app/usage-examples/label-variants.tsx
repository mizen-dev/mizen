import { Input, Stack } from "@mizen/ui";
import { Label } from "@mizen/ui/label";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../page.styles";

export function LabelWorkspaceIdentityExample1() {
	return (
		<Stack gap="4">
			<div {...props(pageStyles.typographySpecimen)}>
				<Label htmlFor="workspace-name">Workspace name</Label>
				<Input id="workspace-name" placeholder="Mizen" />
			</div>
			<div {...props(pageStyles.typographySpecimen)}>
				<Label htmlFor="branch-name">Branch name</Label>
				<Input id="branch-name" placeholder="main" />
			</div>
		</Stack>
	);
}
