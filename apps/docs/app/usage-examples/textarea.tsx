"use client";
import {
	Button,
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	Stack,
	Text,
	Textarea,
} from "@mizen/ui";
import { type FormEvent, useCallback, useState } from "react";

export function ProjectSummaryTextarea() {
	return (
		<Field>
			<FieldLabel>Project summary</FieldLabel>
			<Textarea
				maxLength={280}
				name="summary"
				placeholder="Describe the project…"
				rows={4}
			/>
			<FieldDescription>
				Keep the summary under 280 characters.
			</FieldDescription>
		</Field>
	);
}
export function TextareaForm() {
	const [status, setStatus] = useState("Visible to the project team.");
	const send = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus("Handoff note shared in this preview.");
	}, []);
	return (
		<Stack gap="4">
			<form onSubmit={send}>
				<Stack gap="4">
					<Field>
						<FieldLabel>Message</FieldLabel>
						<Textarea
							name="message"
							placeholder="Write a short message"
							required
						/>
						<FieldDescription>
							Vertical resizing keeps longer notes comfortable.
						</FieldDescription>
					</Field>
					<Button type="submit" variant="brand">
						Share note
					</Button>
					<Text aria-live="polite" size="ui" tone="muted">
						{status}
					</Text>
				</Stack>
			</form>
		</Stack>
	);
}
export function TextareaReadonlyNote() {
	return (
		<Field>
			<FieldLabel>Read-only note</FieldLabel>
			<Textarea defaultValue="This note cannot be edited." readOnly size="sm" />
		</Field>
	);
}
export function TextareaDisabledNote() {
	return (
		<Field disabled>
			<FieldLabel>Disabled note</FieldLabel>
			<Textarea disabled placeholder="Unavailable" readOnly />
		</Field>
	);
}
export function TextareaMessageDetails() {
	return (
		<Field invalid>
			<FieldLabel>Message details</FieldLabel>
			<Textarea defaultValue="" invalid rows={4} size="lg" />
			<FieldError match>Message details are required.</FieldError>
		</Field>
	);
}
