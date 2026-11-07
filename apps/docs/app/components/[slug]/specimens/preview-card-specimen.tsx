import { Stack } from "@mizen-labs/ui";
import {
	PreviewCardAlexMorganExample1,
	PreviewCardMizentokensExample2,
} from "../../../usage-examples/preview-card-variants";
import { SpecimenSection } from "./specimen-section";

export function PreviewCardSpecimen() {
	return (
		<Stack gap="8">
			<SpecimenSection
				description="Supplementary profile information behind a destination link."
				primary
				title="Profile preview"
			>
				<PreviewCardAlexMorganExample1 />
			</SpecimenSection>
			<SpecimenSection
				description="Repository metadata behind a destination link."
				title="Project preview"
			>
				<PreviewCardMizentokensExample2 />
			</SpecimenSection>
		</Stack>
	);
}
