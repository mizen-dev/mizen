import { Badge, Heading, Stack } from "@mizen-labs/ui";
import { Inline } from "@mizen-labs/ui/inline";
import { Spacer } from "@mizen-labs/ui/spacer";
import { Text } from "@mizen-labs/ui/text";

export function SpacerProjectStatusExample1() {
	return (
		<Stack gap="4">
			<Heading level={4}>Northstar launch</Heading>
			<Text size="ui" tone="muted">
				Coordinate the autumn release across product, support, and operations.
			</Text>
			<Inline>
				<Text size="ui" tone="muted">
					Maya Chen
				</Text>
				<Spacer />
				<Badge variant="outline">In progress</Badge>
			</Inline>
		</Stack>
	);
}
