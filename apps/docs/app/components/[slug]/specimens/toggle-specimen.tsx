import { Group, Toggle } from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { IconPlus } from "@tabler/icons-react";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

function PlusIcon() {
	return <IconPlus aria-hidden="true" focusable="false" size="1em" />;
}

export function ToggleSpecimen() {
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Toggle formatting and pin actions independently."
				primary
				title="Document tools"
			>
				<Group>
					<Toggle defaultPressed>Bold text</Toggle>
					<Toggle variant="outline">Italic text</Toggle>
					<Toggle aria-label="Pin item" size="icon">
						<PlusIcon />
					</Toggle>
				</Group>
			</SpecimenSection>
			<SpecimenSection title="Managed action">
				<Group>
					<Toggle disabled>Managed</Toggle>
				</Group>
			</SpecimenSection>
			<SpecimenSection title="Control sizes">
				<Group>
					<Toggle size="sm">Small</Toggle>
					<Toggle>Default toggle</Toggle>
					<Toggle size="lg">Large</Toggle>
				</Group>
			</SpecimenSection>
		</div>
	);
}
