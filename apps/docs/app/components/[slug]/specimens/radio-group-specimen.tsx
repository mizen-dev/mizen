import {
	Field,
	FieldLabel,
	Radio,
	RadioCard,
	RadioGroup,
	Stack,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function RadioGroupSpecimen() {
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Choose one density for the workspace."
				primary
				title="Reading preferences"
			>
				<Stack gap="3">
					<RadioGroup
						aria-label="Interface density"
						defaultValue="comfortable"
						name="density"
					>
						<Field>
							<FieldLabel>
								<Radio size="sm" value="compact" />
								Compact density
							</FieldLabel>
						</Field>
						<Field>
							<FieldLabel>
								<Radio value="comfortable" />
								Comfortable density
							</FieldLabel>
						</Field>
						<Field>
							<FieldLabel>
								<Radio size="lg" value="spacious" />
								Spacious density
							</FieldLabel>
						</Field>
						<Field disabled>
							<FieldLabel>
								<Radio readOnly value="managed" />
								Managed density
							</FieldLabel>
						</Field>
						<Field>
							<FieldLabel>
								<Radio readOnly value="read-only" />
								Read-only density
							</FieldLabel>
						</Field>
						<Field invalid>
							<FieldLabel>
								<Radio invalid value="invalid" />
								Invalid density
							</FieldLabel>
						</Field>
					</RadioGroup>
				</Stack>
			</SpecimenSection>
			<SpecimenSection title="Subscription plan">
				<Stack gap="3">
					<RadioGroup
						aria-label="Workspace plan"
						defaultValue="personal"
						name="plan"
					>
						<RadioCard
							description="For focused work and personal projects."
							label="Personal plan"
							value="personal"
						/>
						<RadioCard
							description="Shared controls for growing teams."
							label="Team plan"
							value="team"
						/>
						<RadioCard
							description="Managed by your organization."
							disabled
							label="Enterprise plan"
							value="enterprise"
						/>
					</RadioGroup>
				</Stack>
			</SpecimenSection>
		</div>
	);
}
