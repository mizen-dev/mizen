import { Inline } from "@mizen/ui/inline";
import { Spinner } from "@mizen/ui/spinner";
import { Text } from "@mizen/ui/text";
import { SpecimenSection } from "./specimen-section";

export function SpinnerSpecimen() {
	return (
		<SpecimenSection primary title="Workspace sync">
			<Inline>
				<Spinner aria-hidden="true" />
				<Text>Saving workspace...</Text>
			</Inline>
		</SpecimenSection>
	);
}
