import { Heading, Section, Stack, Text } from "@mizen/ui";
import { SpecimenSection } from "./specimen-section";

export function SectionSpecimen() {
	return (
		<SpecimenSection primary title="Project overview">
			<Section aria-labelledby="section-specimen-heading">
				<Stack gap="4">
					<Heading id="section-specimen-heading" level={4}>
						Northstar launch
					</Heading>
					<Text>
						Coordinate the autumn release across product, support, and
						operations.
					</Text>
					<Text size="ui" tone="muted">
						Owned by Maya Chen · Updated today
					</Text>
				</Stack>
			</Section>
		</SpecimenSection>
	);
}
