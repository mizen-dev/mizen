"use client";
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	focusFirstInvalidControl,
	Heading,
	Input,
	Stack,
	Text,
	useForm,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { useCallback, useRef, useState } from "react";
import { specimenStyles } from "../components/[slug]/specimens/form-specimen.styles";

function validateUsername(value: string) {
	if (!value) {
		return "Username is required";
	}
	if (value.length < 3) {
		return "Username must be at least 3 characters";
	}
}
function validateEmail(value: string) {
	if (!value) {
		return "Email is required";
	}
	if (!value.includes("@")) {
		return "Enter a valid email address";
	}
}
function formatErrorMessage(error: unknown): string {
	if (typeof error === "string") {
		return error;
	}
	if (typeof error === "object" && error !== null && "message" in error) {
		return String(error.message);
	}
	return String(error);
}
export function FormCreateYourProfileExample1() {
	const formRef = useRef<HTMLFormElement>(null);
	const [isSuccess, setIsSuccess] = useState(false);
	const focusInvalid = useCallback(() => {
		if (!focusFirstInvalidControl(formRef.current)) {
			requestAnimationFrame(() => {
				focusFirstInvalidControl(formRef.current);
			});
		}
	}, []);
	const form = useForm({
		defaultValues: {
			email: "",
			username: "",
		},
		onSubmit: async () => {
			setIsSuccess(false);
			await new Promise((resolve) => setTimeout(resolve, 300));
			setIsSuccess(true);
		},
		onSubmitInvalid: () => {
			focusInvalid();
		},
		validators: {
			onSubmit: ({ value }) => {
				if (value.username === "admin") {
					return "Username 'admin' is reserved";
				}
			},
		},
	});
	const handleSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			event.stopPropagation();
			setIsSuccess(false);
			await form.handleSubmit();
			focusInvalid();
		},
		[focusInvalid, form]
	);
	const selectIsSubmitting = useCallback(
		(state: { isSubmitting: boolean }) => state.isSubmitting,
		[]
	);
	const selectErrors = useCallback(
		(state: { errors: readonly unknown[] }) => state.errors,
		[]
	);
	return (
		<form
			{...props(specimenStyles.form)}
			noValidate
			onSubmit={handleSubmit}
			ref={formRef}
		>
			<Stack gap="6">
				<Stack gap="1">
					<Heading level={3}>Create your profile</Heading>
					<Text size="ui" tone="muted">
						Choose how your team will recognize you.
					</Text>
				</Stack>
				<form.Subscribe selector={selectErrors}>
					{(errors) =>
						errors.length > 0 ? (
							<Alert variant="error">
								<AlertTitle>Submission error</AlertTitle>
								<AlertDescription>
									{errors.map(formatErrorMessage).join(", ")}
								</AlertDescription>
							</Alert>
						) : null
					}
				</form.Subscribe>

				{isSuccess ? (
					<Alert variant="success">
						<AlertTitle>Success</AlertTitle>
						<AlertDescription>Form submitted successfully</AlertDescription>
					</Alert>
				) : null}

				<form.Field
					name="username"
					validators={{
						onChange: ({ value }) =>
							value.length > 0 && value.length < 3
								? "Username must be at least 3 characters"
								: undefined,
						onSubmit: ({ value }) => validateUsername(value),
					}}
				>
					{(field) => (
						<Field field={field}>
							<FieldLabel>Username</FieldLabel>
							<Input placeholder="e.g. alex" />
							<FieldDescription>
								Choose a unique username for your profile.
							</FieldDescription>
							<FieldError />
						</Field>
					)}
				</form.Field>

				<form.Field
					name="email"
					validators={{
						onChange: ({ value }) =>
							value.length > 0 && !value.includes("@")
								? "Enter a valid email address"
								: undefined,
						onSubmit: ({ value }) => validateEmail(value),
					}}
				>
					{(field) => (
						<Field field={field}>
							<FieldLabel>Email</FieldLabel>
							<Input placeholder="you@example.com" type="email" />
							<FieldDescription>
								We will use this address for account verification.
							</FieldDescription>
							<FieldError />
						</Field>
					)}
				</form.Field>

				<div {...props(specimenStyles.submit)}>
					<form.Subscribe selector={selectIsSubmitting}>
						{(isSubmitting) => (
							<Button loading={isSubmitting} type="submit">
								Submit
							</Button>
						)}
					</form.Subscribe>
				</div>
			</Stack>
		</form>
	);
}
