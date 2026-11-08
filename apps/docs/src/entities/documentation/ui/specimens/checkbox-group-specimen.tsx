import {
	Checkbox,
	CheckboxCard,
	CheckboxGroup,
	Field,
	FieldLabel,
	Stack,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function CheckboxGroupSpecimen() {
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Select individual channels or enable them together."
				primary
				title="Delivery preferences"
			>
				<Stack gap="3">
					<CheckboxGroup
						allValues={["email", "push"]}
						aria-label="Notification channels"
						defaultValue={["email"]}
					>
						<Field>
							<FieldLabel>
								<Checkbox parent />
								All channels
							</FieldLabel>
						</Field>
						<Field>
							<FieldLabel>
								<Checkbox name="notifications" value="email" />
								Email
							</FieldLabel>
						</Field>
						<Field>
							<FieldLabel>
								<Checkbox name="notifications" value="push" />
								Push
							</FieldLabel>
						</Field>
					</CheckboxGroup>
				</Stack>
			</SpecimenSection>
			<SpecimenSection title="Digest schedule">
				<Stack gap="3">
					<CheckboxGroup aria-label="Digest options" defaultValue={["daily"]}>
						<CheckboxCard
							description="A concise summary each morning."
							label="Daily digest"
							name="digest"
							value="daily"
						/>
						<CheckboxCard
							description="Managed by your workspace."
							disabled
							label="Security digest"
							name="digest"
							value="security"
						/>
					</CheckboxGroup>
				</Stack>
			</SpecimenSection>
		</div>
	);
}
