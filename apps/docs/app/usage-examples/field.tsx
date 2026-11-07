"use client";
import {
	Field,
	FieldControl,
	FieldDescription,
	FieldError,
	FieldLabel,
	Input,
} from "@mizen-labs/ui";

export function LabeledField() {
	return (
		<Field name="contactEmail">
			<FieldLabel>Contact email</FieldLabel>
			<Input autoComplete="email" placeholder="you@example.com" type="email" />
			<FieldDescription>Used for project updates.</FieldDescription>
		</Field>
	);
}
export function InvalidField() {
	return (
		<Field invalid name="projectName">
			<FieldLabel>Project name</FieldLabel>
			<Input defaultValue="" invalid />
			<FieldError match>Enter a project name.</FieldError>
		</Field>
	);
}
export function FieldCompactControl() {
	return (
		<Field>
			<FieldLabel>Compact control</FieldLabel>
			<FieldControl placeholder="Field control" readOnly size="sm" />
		</Field>
	);
}

export function FieldWorkspace() {
	return (
		<Field disabled>
			<FieldLabel>Workspace</FieldLabel>
			<Input defaultValue="Personal" disabled />
		</Field>
	);
}
export function FieldReference() {
	return (
		<Field>
			<FieldLabel>Reference</FieldLabel>
			<Input defaultValue="MIZ-001" readOnly />
		</Field>
	);
}
export function FieldSmall() {
	return (
		<Field>
			<FieldLabel>Small</FieldLabel>
			<Input placeholder="Small" size="sm" />
		</Field>
	);
}

export function FieldLarge() {
	return (
		<Field>
			<FieldLabel>Large</FieldLabel>
			<Input placeholder="Large" size="lg" />
		</Field>
	);
}
