import {
	Field,
	FieldDescription,
	FieldLabel,
	OTPField,
	OTPFieldInput,
} from "@mizen/ui";
export function VerificationCode() {
	return (
		<Field>
			<FieldLabel>Verification code</FieldLabel>
			<OTPField
				aria-label="Six-digit verification code"
				length={6}
				name="verificationCode"
				size="sm"
			>
				<OTPFieldInput />
				<OTPFieldInput />
				<OTPFieldInput />
				<OTPFieldInput />
				<OTPFieldInput />
				<OTPFieldInput />
			</OTPField>
			<FieldDescription>Enter the six digits from your email.</FieldDescription>
		</Field>
	);
}
