import {
	Field,
	FieldLabel,
	Heading,
	Section,
	Stack,
	Switch,
	Text,
} from "@mizen/ui";

const notifications = [
	["mentions", "Mentions and replies", true],
	["weekly", "Weekly summary", true],
	["product", "Product news", false],
] as const;

export function ProjectSettingsSection() {
	return (
		<Section aria-labelledby="notifications-heading">
			<Stack gap="1">
				<Heading id="notifications-heading" level={3}>
					Notifications
				</Heading>
				<Text size="ui" tone="muted">
					Choose what reaches your inbox.
				</Text>
			</Stack>
			<Stack gap="3">
				{notifications.map(([name, label, checked]) => (
					<Field key={name}>
						<FieldLabel>
							<Switch defaultChecked={checked} name={name} />
							{label}
						</FieldLabel>
					</Field>
				))}
			</Stack>
		</Section>
	);
}
