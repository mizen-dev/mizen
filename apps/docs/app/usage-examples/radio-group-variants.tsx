import {
	Field,
	FieldLabel,
	Radio,
	RadioCard,
	RadioGroup,
	Stack,
} from "@mizen/ui";

export function RadioGroupReadingPreferencesExample1() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
export function RadioGroupSubscriptionPlanExample2() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
