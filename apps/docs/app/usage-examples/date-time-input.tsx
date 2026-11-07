import { DateTimeInput, Field, FieldDescription, FieldLabel } from "@mizen/ui";
export function LaunchDateTime() {
	return (
		<Field>
			<FieldLabel>Launch date and time</FieldLabel>
			<DateTimeInput defaultValue="2026-10-15T09:30" name="launchAt" required />
			<FieldDescription>Uses your local time zone.</FieldDescription>
		</Field>
	);
}
