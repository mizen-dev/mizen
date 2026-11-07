import { Input } from "@mizen/ui";
import { Label } from "@mizen/ui/label";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../../../page.styles";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function LabelSpecimen() {
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Associate each visible label with its editable field."
				primary
				title="Workspace identity"
			>
				<div {...props(pageStyles.typographySpecimen)}>
					<Label htmlFor="workspace-name">Workspace name</Label>
					<Input id="workspace-name" placeholder="Mizen" />
				</div>
				<div {...props(pageStyles.typographySpecimen)}>
					<Label htmlFor="branch-name">Branch name</Label>
					<Input id="branch-name" placeholder="main" />
				</div>
			</SpecimenSection>
		</div>
	);
}
