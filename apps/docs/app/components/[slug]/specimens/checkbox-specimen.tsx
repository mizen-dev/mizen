import {
	Checkbox,
	CheckboxCard,
	Field,
	FieldError,
	FieldLabel,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../../../page.styles";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function CheckboxSpecimen() {
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Choose which updates you want to receive."
				primary
				title="Notification preferences"
			>
				<div {...props(pageStyles.fieldGrid)}>
					<Field>
						<FieldLabel>
							<Checkbox defaultChecked name="product-updates" value="yes" />
							Product updates
						</FieldLabel>
					</Field>
				</div>
			</SpecimenSection>
			<SpecimenSection
				description="Compare mixed, unavailable, invalid, and alternate sizes."
				title="Control states"
			>
				<div {...props(pageStyles.fieldGrid)}>
					<Field>
						<FieldLabel>
							<Checkbox indeterminate name="team-settings" />
							Team settings
						</FieldLabel>
					</Field>
					<Field disabled>
						<FieldLabel>
							<Checkbox defaultChecked name="disabled-option" readOnly />
							Disabled option
						</FieldLabel>
					</Field>
					<Field invalid>
						<FieldLabel>
							<Checkbox invalid name="invalid-option" required />
							Invalid option
						</FieldLabel>
						<FieldError match>Choose an option.</FieldError>
					</Field>
					<Field>
						<FieldLabel>
							<Checkbox name="small-option" size="sm" />
							<span>Small option</span>
						</FieldLabel>
					</Field>
					<Field>
						<FieldLabel>
							<Checkbox defaultChecked name="read-only-option" readOnly />
							Read-only option
						</FieldLabel>
					</Field>
					<Field>
						<FieldLabel>
							<Checkbox name="large-option" size="lg" />
							Large option
						</FieldLabel>
					</Field>
				</div>
			</SpecimenSection>
			<SpecimenSection
				description="Show additional context beside an option."
				title="Settings cards"
			>
				<div {...props(pageStyles.fieldGrid as never)}>
					<CheckboxCard
						defaultChecked
						description="You can enable or disable notifications at any time."
						label="Enable notifications"
						name="notifications-card"
						value="yes"
					/>
					<CheckboxCard
						description="This setting is managed by your administrator."
						disabled
						label="Managed setting"
						name="managed-card"
					/>
				</div>
			</SpecimenSection>
		</div>
	);
}
