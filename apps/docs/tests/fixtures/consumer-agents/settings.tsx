"use client";

import {
	Button,
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	Input,
	Stack,
} from "@mizen/ui";
import { type FormEvent, useCallback, useState } from "react";

export function ConsumerSettings() {
	const [error, setError] = useState<string | null>(null);
	const [savedName, setSavedName] = useState<string | null>(null);

	const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const value = new FormData(event.currentTarget).get("projectName");
		const trimmedName = typeof value === "string" ? value.trim() : "";

		if (trimmedName.length < 3) {
			setError("Enter at least 3 characters for the project name.");
			setSavedName(null);
			return;
		}

		setError(null);
		setSavedName(trimmedName);
	}, []);

	return (
		<form onSubmit={handleSubmit}>
			<Stack gap="2">
				<Field invalid={Boolean(error)} name="projectName">
					<FieldLabel>Project name</FieldLabel>
					<Input
						autoComplete="off"
						defaultValue="Northstar"
						name="projectName"
					/>
					<FieldDescription>
						Choose a name that is easy for your team to recognize.
					</FieldDescription>
					{error === null ? null : <FieldError match>{error}</FieldError>}
				</Field>
				<Button type="submit" variant="brand">
					Save changes
				</Button>
				{savedName === null ? null : (
					<p role="status">“{savedName}” saved locally for this demo.</p>
				)}
			</Stack>
		</form>
	);
}
