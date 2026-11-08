import { Heading, Section, Stack, Text } from "@mizen-labs/ui";

export function SectionNorthstarLaunchExample1() {
	return (
		<Section aria-labelledby="section-specimen-heading">
			<Stack gap="4">
				<Heading id="section-specimen-heading" level={4}>
					Northstar launch
				</Heading>
				<Text>
					Coordinate the autumn release across product, support, and operations.
				</Text>
				<Text size="ui" tone="muted">
					Owned by Maya Chen · Updated today
				</Text>
			</Stack>
		</Section>
	);
}
