"use client";
import {
	DateTimeInput,
	Field,
	FieldDescription,
	FieldLabel,
	Grid,
	Stack,
	Text,
} from "@mizen/ui";

export function DateTimeInputReleaseScheduleExample1() {
	return (
		<Stack gap="4">
			<Field>
				<FieldLabel>Release date and time</FieldLabel>
				<DateTimeInput defaultValue="2026-10-28T14:30" />
			</Field>
			<Text size="ui" tone="muted">
				Northstar launch · Product team
			</Text>
		</Stack>
	);
}
export function DateTimeInputControlStatesExample2() {
	return (
		<Stack gap="4">
			<Grid>
				<Field>
					<FieldLabel>Small date-time input</FieldLabel>
					<DateTimeInput defaultValue="2026-10-07T09:30" size="sm" />
				</Field>
				<Field>
					<FieldLabel>Large date-time input</FieldLabel>
					<DateTimeInput defaultValue="2026-10-07T14:45" size="lg" />
				</Field>
				<Field>
					<FieldLabel>Date-time with seconds</FieldLabel>
					<DateTimeInput defaultValue="2026-10-07T09:30:15" step={1} />
				</Field>
				<Field>
					<FieldLabel>Managed date-time</FieldLabel>
					<DateTimeInput defaultValue="2026-10-07T09:00" disabled />
					<FieldDescription>Managed by your workspace.</FieldDescription>
				</Field>
				<Field>
					<FieldLabel>Read-only date-time</FieldLabel>
					<DateTimeInput defaultValue="2026-10-07T17:00" readOnly />
				</Field>
			</Grid>
		</Stack>
	);
}
