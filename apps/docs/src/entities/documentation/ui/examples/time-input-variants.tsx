"use client";
import {
	Field,
	FieldDescription,
	FieldLabel,
	Grid,
	Stack,
	Text,
	TimeInput,
} from "@mizen-labs/ui";

export function TimeInputReviewScheduleExample1() {
	return (
		<Stack gap="4">
			<Field>
				<FieldLabel>Review time</FieldLabel>
				<TimeInput defaultValue="14:30" />
			</Field>
			<Text size="ui" tone="muted">
				Northstar launch · Product team
			</Text>
		</Stack>
	);
}
export function TimeInputControlStatesExample2() {
	return (
		<Grid>
			<Field>
				<FieldLabel>Small time input</FieldLabel>
				<TimeInput defaultValue="09:30" size="sm" />
			</Field>
			<Field>
				<FieldLabel>Large time input</FieldLabel>
				<TimeInput defaultValue="14:45" size="lg" />
			</Field>
			<Field>
				<FieldLabel>Time with seconds</FieldLabel>
				<TimeInput defaultValue="09:30:15" step={1} />
				<FieldDescription>
					Use a seconds-based step for finer precision.
				</FieldDescription>
			</Field>
			<Field>
				<FieldLabel>Managed time</FieldLabel>
				<TimeInput defaultValue="09:00" disabled />
				<FieldDescription>Managed by your workspace.</FieldDescription>
			</Field>
			<Field>
				<FieldLabel>Read-only time</FieldLabel>
				<TimeInput defaultValue="17:00" readOnly />
			</Field>
		</Grid>
	);
}
