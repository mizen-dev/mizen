"use client";
import {
	Button,
	Field,
	FieldError,
	FieldLabel,
	Group,
	Input,
	Stack,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { type FormEvent, useCallback, useState } from "react";
import { pageStyles } from "../page.styles";

export function ControlledInput() {
	const [name, setName] = useState("Northstar");
	return (
		<Stack gap="2">
			<Field name="projectName">
				<FieldLabel>Project name</FieldLabel>
				<Input onValueChange={setName} value={name} />
			</Field>
			<Text size="ui" tone="muted">
				Current value: {name || "Empty"}
			</Text>
		</Stack>
	);
}
export function ReadOnlyInput() {
	return (
		<Field name="projectKey">
			<FieldLabel>Project key</FieldLabel>
			<Input defaultValue="NSL" readOnly />
		</Field>
	);
}
export function DisabledInput() {
	return (
		<Field disabled name="managedOwner">
			<FieldLabel>Managed owner</FieldLabel>
			<Input defaultValue="Mara Chen" disabled />
		</Field>
	);
}
export function InputForm() {
	const [saved, setSaved] = useState("");
	const reset = useCallback(() => setSaved(""), []);
	const save = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		setSaved(`Saved ${data.get("project") || "the project"} in this preview.`);
	}, []);
	return (
		<Stack gap="4">
			<form onReset={reset} onSubmit={save}>
				<Stack gap="4">
					<Field>
						<FieldLabel>Project name</FieldLabel>
						<Input name="project" placeholder="e.g. Northstar launch" />
					</Field>
					<div {...props(pageStyles.row)}>
						<Field>
							<FieldLabel>Project key</FieldLabel>
							<Input defaultValue="NSL" name="key" />
						</Field>
						<Field>
							<FieldLabel>Owner</FieldLabel>
							<Input defaultValue="Maya Chen" name="owner" />
						</Field>
					</div>
					<Group>
						<Button type="submit" variant="brand">
							Save project
						</Button>
						<Button type="reset" variant="outline">
							Reset
						</Button>
					</Group>
					<Text aria-live="polite" size="ui" tone="muted">
						{saved || "Changes stay in this preview."}
					</Text>
				</Stack>
			</form>
		</Stack>
	);
}
export function InputSmall() {
	return (
		<Field>
			<FieldLabel>Small</FieldLabel>
			<Input placeholder="Small" size="sm" />
		</Field>
	);
}
export function InputDefaultSize() {
	return (
		<Field>
			<FieldLabel>Default size</FieldLabel>
			<Input placeholder="Default" size="default" />
		</Field>
	);
}
export function InputLarge() {
	return (
		<Field>
			<FieldLabel>Large</FieldLabel>
			<Input placeholder="Large" size="lg" />
		</Field>
	);
}

export function InputInvalid() {
	return (
		<Field invalid>
			<FieldLabel>Invalid</FieldLabel>
			<Input defaultValue="" invalid />
			<FieldError match>This field is required.</FieldError>
		</Field>
	);
}
