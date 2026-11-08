import { Checkbox, Field, FieldError, FieldLabel, Stack } from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../page.styles";

export function CheckboxNotificationPreferencesExample1() {
	return (
		<Stack gap="4">
			<div {...props(pageStyles.fieldGrid)}>
				<Field>
					<FieldLabel>
						<Checkbox defaultChecked name="product-updates" value="yes" />
						Product updates
					</FieldLabel>
				</Field>
			</div>
		</Stack>
	);
}
export function CheckboxControlStatesExample2() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
