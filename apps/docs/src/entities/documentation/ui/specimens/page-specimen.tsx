import {
	Button,
	Page,
	PageAction,
	PageDescription,
	PageHeader,
	PageTitle,
	Section,
	SectionDescription,
	SectionHeader,
	SectionTitle,
	Text,
} from "@mizen-labs/ui";
import { SpecimenSection } from "./specimen-section";

export function PageSpecimen() {
	return (
		<SpecimenSection
			description="A page with a header and one section."
			primary
			title="Projects"
		>
			<Page>
				<PageHeader>
					<PageTitle>Projects</PageTitle>
					<PageDescription>Everything your team ships.</PageDescription>
					<PageAction>
						<Button variant="brand">New project</Button>
					</PageAction>
				</PageHeader>
				<Section aria-labelledby="page-specimen-section">
					<SectionHeader>
						<SectionTitle id="page-specimen-section">Active</SectionTitle>
						<SectionDescription>Updated this week.</SectionDescription>
					</SectionHeader>
					<Text>Northstar launch, Field notes, and Website refresh.</Text>
				</Section>
			</Page>
		</SpecimenSection>
	);
}
