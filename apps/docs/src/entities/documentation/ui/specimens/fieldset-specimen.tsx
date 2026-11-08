import {
	Checkbox,
	Field,
	FieldDescription,
	FieldLabel,
	Fieldset,
	FieldsetLegend,
	Input,
	Stack,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function FieldsetSpecimen() {
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Related personal details belong in one fieldset."
				primary
				title="Account profile"
			>
				<Fieldset>
					<Stack gap="3">
						<FieldsetLegend>Personal details</FieldsetLegend>
						<Field>
							<FieldLabel>Full name</FieldLabel>
							<Input defaultValue="Alex Morgan" />
						</Field>
						<Field>
							<FieldLabel>Email address</FieldLabel>
							<Input defaultValue="alex@example.com" type="email" />
							<FieldDescription>
								Used for notifications and account verification.
							</FieldDescription>
						</Field>
					</Stack>
				</Fieldset>
			</SpecimenSection>
			<SpecimenSection
				description="Keep unavailable settings visible and explain who can edit them."
				title="Managed billing"
			>
				<Fieldset disabled>
					<Stack gap="3">
						<FieldsetLegend>Billing settings (disabled)</FieldsetLegend>
						<Field>
							<FieldLabel>Tax identifier</FieldLabel>
							<Input defaultValue="TAX-948102" readOnly />
							<FieldDescription>
								Managed by organization administrators.
							</FieldDescription>
						</Field>
						<Field>
							<FieldLabel>
								<Checkbox defaultChecked name="auto-renew" />
								<span>Automatically renew subscription</span>
							</FieldLabel>
						</Field>
					</Stack>
				</Fieldset>
			</SpecimenSection>
		</div>
	);
}
