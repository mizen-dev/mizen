"use client";
import {
	Button,
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	Input,
	Stack,
	Text,
	useForm,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { useCallback, useState } from "react";
import { specimenStyles } from "../specimens/form-specimen.styles";

export function ContactForm() {
	// The live region starts empty and announces the result after submit.
	const [status, setStatus] = useState("");
	const form = useForm({
		defaultValues: { name: "" },
		onSubmit: ({ value }) => {
			setStatus(`Ready to review ${value.name}.`);
		},
	});
	const validateName = useCallback(
		({ value }: { value: string }) =>
			value.trim() ? undefined : "Enter your name.",
		[]
	);
	const handleSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			event.stopPropagation();
			await form.handleSubmit();
		},
		[form]
	);
	const selectIsSubmitting = useCallback(
		(state: { isSubmitting: boolean }) => state.isSubmitting,
		[]
	);

	return (
		<form {...props(specimenStyles.form)} noValidate onSubmit={handleSubmit}>
			<Stack gap="3">
				<form.Field name="name" validators={{ onSubmit: validateName }}>
					{(field) => (
						<Field field={field}>
							<FieldLabel>Name</FieldLabel>
							<Input autoComplete="name" placeholder="Maya Chen" />
							<FieldDescription>
								Shown to other workspace members.
							</FieldDescription>
							<FieldError />
						</Field>
					)}
				</form.Field>
				<div {...props(specimenStyles.submit)}>
					<form.Subscribe selector={selectIsSubmitting}>
						{(isSubmitting) => (
							<Button loading={isSubmitting} type="submit">
								Review details
							</Button>
						)}
					</form.Subscribe>
				</div>
				<Text aria-live="polite">{status}</Text>
			</Stack>
		</form>
	);
}
