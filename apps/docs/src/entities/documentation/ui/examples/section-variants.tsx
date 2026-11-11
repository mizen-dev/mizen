import {
	Field,
	FieldLabel,
	Section,
	SectionDescription,
	SectionHeader,
	SectionTitle,
	Stack,
	Switch,
	Text,
} from "@mizen-labs/ui";

export function SectionNorthstarLaunchExample1() {
	return (
		<Section aria-labelledby="section-launch-title">
			<SectionHeader>
				<SectionTitle id="section-launch-title">Northstar launch</SectionTitle>
				<SectionDescription>
					Owned by Maya Chen · Updated today
				</SectionDescription>
			</SectionHeader>
			<Text>
				Coordinate the autumn release across product, support, and operations.
			</Text>
		</Section>
	);
}

const notifications = [
	["mentions", "Mentions and replies", true],
	["weekly", "Weekly summary", true],
	["product", "Product news", false],
] as const;

export function SectionNotificationsExample2() {
	return (
		<Section aria-labelledby="section-notifications-title">
			<SectionHeader>
				<SectionTitle id="section-notifications-title" level={3}>
					Notifications
				</SectionTitle>
				<SectionDescription>Choose what reaches your inbox.</SectionDescription>
			</SectionHeader>
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
