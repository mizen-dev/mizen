import { Inline, StatusDot, Text } from "@mizen/ui";

export function ServiceStatus() {
	return (
		<Inline>
			<StatusDot aria-hidden="true" label="Operational" variant="success" />
			<Text>API service operational</Text>
		</Inline>
	);
}
