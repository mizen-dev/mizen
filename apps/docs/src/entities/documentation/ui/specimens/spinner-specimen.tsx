import { Inline } from "@mizen-labs/ui/inline";
import { Spinner } from "@mizen-labs/ui/spinner";
import { Text } from "@mizen-labs/ui/text";
import { SpecimenSection } from "./specimen-section";

export function SpinnerSpecimen() {
	return (
		<SpecimenSection primary title="Workspace sync">
			<Inline>
				<Spinner aria-hidden="true" />
				<Text>Saving workspace…</Text>
			</Inline>
		</SpecimenSection>
	);
}
