"use client";
import { Field, FieldDescription, FieldLabel, Input } from "@mizen-labs/ui";

export function FieldSpecimen() {
	return (
		<Field>
			<FieldLabel>Email</FieldLabel>
			<Input placeholder="you@example.com" />
			<FieldDescription>We only use this for account updates.</FieldDescription>
		</Field>
	);
}
