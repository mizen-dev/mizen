import {
	Section,
	SectionDescription,
	SectionHeader,
	SectionTitle,
	Text,
} from "@mizen-labs/ui";
import { SpecimenSection } from "./specimen-section";

export function SectionSpecimen() {
	return (
		<SpecimenSection primary title="Project overview">
			<Section aria-labelledby="section-specimen-heading">
				<SectionHeader>
					<SectionTitle id="section-specimen-heading" level={4}>
						Northstar launch
					</SectionTitle>
					<SectionDescription>
						Owned by Maya Chen · Updated today
					</SectionDescription>
				</SectionHeader>
				<Text>
					Coordinate the autumn release across product, support, and operations.
				</Text>
			</Section>
		</SpecimenSection>
	);
}
