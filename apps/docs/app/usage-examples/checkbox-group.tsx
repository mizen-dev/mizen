import {
	Checkbox,
	CheckboxGroup,
	Field,
	FieldLabel,
	Heading,
	Stack,
} from "@mizen-labs/ui";
export function NotificationChannels() {
	return (
		<Stack gap="3">
			<Heading id="notification-channel-options" level={3}>
				Notification channels
			</Heading>
			<CheckboxGroup
				allValues={["email", "push"]}
				aria-labelledby="notification-channel-options"
				defaultValue={["email"]}
			>
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
			</CheckboxGroup>
		</Stack>
	);
}
