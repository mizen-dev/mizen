import {
	PropertyList,
	PropertyListItem,
	PropertyListLabel,
	PropertyListValue,
} from "@mizen/ui";

export function DeploymentMetadata() {
	return (
		<PropertyList aria-label="Deployment metadata">
			<PropertyListItem>
				<PropertyListLabel>Environment</PropertyListLabel>
				<PropertyListValue>Production</PropertyListValue>
			</PropertyListItem>
			<PropertyListItem>
				<PropertyListLabel>Region</PropertyListLabel>
				<PropertyListValue>us-east-1</PropertyListValue>
			</PropertyListItem>
			<PropertyListItem>
				<PropertyListLabel>Version</PropertyListLabel>
				<PropertyListValue>2.4.1</PropertyListValue>
			</PropertyListItem>
		</PropertyList>
	);
}
