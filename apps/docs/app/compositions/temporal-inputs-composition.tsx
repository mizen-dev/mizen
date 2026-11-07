"use client";

import {
	Button,
	DateTimeInput,
	Field,
	FieldDescription,
	FieldLabel,
	Grid,
	Group,
	Heading,
	Section,
	Stack,
	Text,
	TimeInput,
} from "@mizen-labs/ui";
import { type FormEvent, useCallback, useState } from "react";
import { SpecimenSection } from "../components/[slug]/specimens/specimen-section";
import { PreviewWorkspace } from "../components/preview-workspace";

export function TimeInputExamples() {
	return (
		<Stack gap="8">
			<PreviewWorkspace
				description="Local time for the Product team workspace."
				title="Review schedule"
			>
				<Field>
					<FieldLabel>Review time</FieldLabel>
					<TimeInput defaultValue="14:30" />
				</Field>
				<Text size="ui" tone="muted">
					Northstar launch · Product team
				</Text>
			</PreviewWorkspace>
			<SpecimenSection title="Control states">
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
			</SpecimenSection>
		</Stack>
	);
}

export function DateTimeInputExamples() {
	return (
		<Stack gap="8">
			<PreviewWorkspace
				description="Local time for the Product team workspace."
				title="Release schedule"
			>
				<Field>
					<FieldLabel>Release date and time</FieldLabel>
					<DateTimeInput defaultValue="2026-10-28T14:30" />
				</Field>
				<Text size="ui" tone="muted">
					Northstar launch · Product team
				</Text>
			</PreviewWorkspace>
			<SpecimenSection title="Control states">
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
			</SpecimenSection>
		</Stack>
	);
}

export function TemporalInputsComposition() {
	const [submitted, setSubmitted] = useState("");
	const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const values = new FormData(event.currentTarget);
		setSubmitted(
			`Saved: ${values.get("meetingTime")} · ${values.get("scheduledAt")}`
		);
	}, []);
	const handleReset = useCallback(() => setSubmitted(""), []);
	return (
		<Section aria-labelledby="temporal-inputs-heading">
			<Stack>
				<Heading id="temporal-inputs-heading" level={2} size="title">
					Time and scheduling
				</Heading>
				<Text size="ui" tone="muted">
					Local values, without an implicit time zone. Your browser controls the
					date and time format.
				</Text>
			</Stack>
			<form
				aria-label="Schedule a review"
				onReset={handleReset}
				onSubmit={handleSubmit}
			>
				<Stack>
					<Grid>
						<Field>
							<FieldLabel>Meeting time</FieldLabel>
							<TimeInput
								defaultValue="09:30"
								max="18:00"
								min="09:00"
								name="meetingTime"
								required
								step={900}
							/>
							<FieldDescription>
								Between 09:00 and 18:00, in 15-minute intervals.
							</FieldDescription>
						</Field>
						<Field>
							<FieldLabel>Scheduled at</FieldLabel>
							<DateTimeInput
								defaultValue="2026-10-07T10:00"
								max="2026-10-31T18:00"
								min="2026-10-01T09:00"
								name="scheduledAt"
								required
								step={900}
							/>
							<FieldDescription>
								A local date and time. Choose the time zone in your application.
							</FieldDescription>
						</Field>
					</Grid>
					<Group>
						<Button type="submit">Save schedule</Button>
						<Button type="reset" variant="outline">
							Reset schedule
						</Button>
					</Group>
					<Text
						aria-live="polite"
						data-testid="schedule-status"
						size="ui"
						tone="muted"
					>
						{submitted || "No schedule submitted."}
					</Text>
				</Stack>
			</form>
			<Heading level={3}>Time Input</Heading>
			<TimeInputExamples />
			<Heading level={3}>Date-Time Input</Heading>
			<DateTimeInputExamples />
		</Section>
	);
}
