import {
	Meter,
	MeterIndicator,
	MeterLabel,
	MeterTrack,
	MeterValue,
	PropertyList,
	PropertyListItem,
	PropertyListLabel,
	PropertyListValue,
	Stack,
	Text,
} from "@mizen-labs/ui";

export function MeterStorageUsageExample1() {
	return (
		<Stack gap="4">
			<Stack gap="2">
				<Meter max={100} value={72}>
					<MeterLabel>Workspace storage</MeterLabel>
					<Stack gap="1">
						<MeterValue />
						<MeterTrack>
							<MeterIndicator />
						</MeterTrack>
					</Stack>
				</Meter>
				<PropertyList aria-label="Storage breakdown">
					<PropertyListItem>
						<PropertyListLabel>Documents</PropertyListLabel>
						<PropertyListValue>18 GB</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Media</PropertyListLabel>
						<PropertyListValue>46 GB</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Archives</PropertyListLabel>
						<PropertyListValue>8 GB</PropertyListValue>
					</PropertyListItem>
				</PropertyList>
				<Text size="ui" tone="muted">
					28 GB available on your workspace plan.
				</Text>
			</Stack>
		</Stack>
	);
}
