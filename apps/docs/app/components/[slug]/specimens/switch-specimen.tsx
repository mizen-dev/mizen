import { Field, FieldDescription, FieldLabel, Switch } from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function SwitchSpecimen() {
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Choose how this workspace syncs and displays content."
				primary
				title="Workspace preferences"
			>
				<Field>
					<FieldLabel>
						<Switch defaultChecked name="sync" value="enabled" />
						Sync changes
					</FieldLabel>
					<FieldDescription>
						Keep this workspace synchronized across devices.
					</FieldDescription>
				</Field>
				<Field>
					<FieldLabel>
						<Switch name="compact-mode" size="sm" />
						Compact mode
					</FieldLabel>
				</Field>
			</SpecimenSection>
			<SpecimenSection title="Permissions and validation">
				<Field disabled>
					<FieldLabel>
						<Switch defaultChecked name="managed-mode" readOnly size="lg" />
						Managed setting
					</FieldLabel>
				</Field>
				<Field>
					<FieldLabel>
						<Switch defaultChecked name="read-only-mode" readOnly />
						Read-only mode
					</FieldLabel>
				</Field>
				<Field invalid>
					<FieldLabel>
						<Switch invalid name="invalid-mode" />
						Invalid mode
					</FieldLabel>
				</Field>
			</SpecimenSection>
		</div>
	);
}
