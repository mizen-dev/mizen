import { Field, FieldDescription, FieldLabel, TimeInput } from "@mizen-labs/ui";
export function AppointmentTime() {
	return (
		<Field>
			<FieldLabel>Appointment time</FieldLabel>
			<TimeInput defaultValue="09:30" name="appointmentTime" required />
			<FieldDescription>Uses your local time zone.</FieldDescription>
		</Field>
	);
}
