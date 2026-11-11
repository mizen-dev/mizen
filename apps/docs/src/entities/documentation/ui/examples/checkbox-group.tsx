import {
	Checkbox,
	CheckboxGroup,
	Field,
	FieldLabel,
	Fieldset,
	FieldsetLegend,
} from "@mizen-labs/ui";
export function NotificationChannels() {
	return (
		<Fieldset
			render={
				<CheckboxGroup allValues={["email", "push"]} defaultValue={["email"]} />
			}
		>
			<FieldsetLegend>Notification channels</FieldsetLegend>
			<Field>
				<FieldLabel>
					<Checkbox parent />
					All channels
				</FieldLabel>
			</Field>
			<Field>
				<FieldLabel>
					<Checkbox name="notifications" value="email" />
					Email
				</FieldLabel>
			</Field>
			<Field>
				<FieldLabel>
					<Checkbox name="notifications" value="push" />
					Push
				</FieldLabel>
			</Field>
		</Fieldset>
	);
}
