import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	OTPField,
	OTPFieldInput,
	OTPFieldSeparator,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function OtpFieldSpecimen() {
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Enter the code sent to your registered device."
				primary
				title="Verify your account"
			>
				<Field>
					<FieldLabel>Verification code</FieldLabel>
					<OTPField data-testid="otp-field-default" length={6} />
					<FieldDescription>
						Enter the 6-digit code sent to your registered device.
					</FieldDescription>
				</Field>
			</SpecimenSection>
			<SpecimenSection title="Control sizes">
				<Field>
					<FieldLabel>Small size</FieldLabel>
					<OTPField data-testid="otp-field-size-sm" length={6} size="sm" />
					<FieldDescription>Compact slots for dense forms.</FieldDescription>
				</Field>

				<Field>
					<FieldLabel>Default size</FieldLabel>
					<OTPField
						data-testid="otp-field-size-default"
						length={6}
						size="default"
					/>
					<FieldDescription>
						Standard input dimensions for general use.
					</FieldDescription>
				</Field>

				<Field>
					<FieldLabel>Large size</FieldLabel>
					<OTPField data-testid="otp-field-size-lg" length={6} size="lg" />
					<FieldDescription>
						Prominent slots for primary verification flows.
					</FieldDescription>
				</Field>
			</SpecimenSection>
			<SpecimenSection title="Privacy and validation">
				<Field>
					<FieldLabel>Masked code</FieldLabel>
					<OTPField data-testid="otp-field-masked" length={6} mask />
					<FieldDescription>
						Obscures characters for sensitive passcode entry.
					</FieldDescription>
				</Field>

				<Field disabled>
					<FieldLabel>Disabled code</FieldLabel>
					<OTPField
						data-testid="otp-field-disabled"
						defaultValue="123456"
						disabled
						length={6}
					/>
					<FieldDescription>
						Temporarily unavailable while awaiting a new code.
					</FieldDescription>
				</Field>

				<Field>
					<FieldLabel>Read-only code</FieldLabel>
					<OTPField
						data-testid="otp-field-read-only"
						defaultValue="849201"
						length={6}
						readOnly
					/>
					<FieldDescription>
						Pre-filled reference code that cannot be altered.
					</FieldDescription>
				</Field>

				<Field invalid>
					<FieldLabel>Invalid code</FieldLabel>
					<OTPField
						data-testid="otp-field-invalid"
						defaultValue="000000"
						length={6}
					/>
					<FieldDescription>
						Enter the 6-digit confirmation code.
					</FieldDescription>
					<FieldError match>
						That code is incorrect. Check it and try again.
					</FieldError>
				</Field>

				<Field>
					<FieldLabel>Grouped code</FieldLabel>
					<OTPField length={6}>
						<OTPFieldInput />
						<OTPFieldInput aria-label="Digit 2" />
						<OTPFieldInput aria-label="Digit 3" />
						<OTPFieldSeparator>-</OTPFieldSeparator>
						<OTPFieldInput aria-label="Digit 4" />
						<OTPFieldInput aria-label="Digit 5" />
						<OTPFieldInput aria-label="Digit 6" />
					</OTPField>
					<FieldDescription>
						Custom 123-456 composition with an explicit separator.
					</FieldDescription>
				</Field>
			</SpecimenSection>
		</div>
	);
}
