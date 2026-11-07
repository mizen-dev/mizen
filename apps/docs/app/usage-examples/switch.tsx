import { Field, FieldDescription, FieldLabel, Switch } from "@mizen/ui";
export function AutomaticUpdatesSwitch() {
	return (
		<Field>
			<FieldLabel>
				<Switch defaultChecked name="automaticUpdates" />
				Automatic updates
			</FieldLabel>
			<FieldDescription>
				Install updates when they become available.
			</FieldDescription>
		</Field>
	);
}
