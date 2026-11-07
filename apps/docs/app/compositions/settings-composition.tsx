"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Checkbox,
	CheckboxGroup,
	Dialog,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	Fieldset,
	focusFirstInvalidControl,
	Grid,
	Heading,
	Input,
	Section,
	Select,
	SelectItem,
	SelectLabel,
	SelectPopup,
	SelectTrigger,
	SelectValue,
	Stack,
	Switch,
	Text,
	Textarea,
	useForm,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { type FormEvent, useCallback, useRef, useState } from "react";
import { compositionStyles } from "./composition.styles";
import { DemoDisclosure } from "./demo-disclosure";

const initialSettings = {
	contact: "hello@mizen.dev",
	description: "A shared workspace for product design and delivery.",
	name: "Mizen Studio",
	notifications: ["weeklyDigest", "securityAlerts"],
	timezone: "Europe/Moscow",
};
const notificationLabels = {
	productUpdates: "Product updates",
	securityAlerts: "Security alerts",
	weeklyDigest: "Weekly activity digest",
} as const;
const notificationDescriptions = {
	productUpdates: "New features and improvements to Mizen.",
	securityAlerts: "Important changes to workspace access and security.",
	weeklyDigest: "A summary of your team's activity, every Monday.",
} as const;
const contactEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const timezones = [
	{ label: "Moscow", value: "Europe/Moscow" },
	{ label: "London", value: "Europe/London" },
	{ label: "New York", value: "America/New_York" },
];

function validateWorkspaceName({ value }: { value: string }) {
	return value.trim() ? undefined : "Workspace name is required";
}

function validateContactEmail({ value }: { value: string }) {
	return contactEmail.test(value) ? undefined : "Enter a valid contact email";
}

function TimezoneSelect({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	const handleChange = useCallback(
		(next: string | null) => {
			if (next !== null) {
				onChange(next);
			}
		},
		[onChange]
	);
	return (
		<Select items={timezones} onValueChange={handleChange} value={value}>
			<SelectLabel>Time zone</SelectLabel>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>
			<SelectPopup>
				<SelectItem value="Europe/Moscow">Moscow</SelectItem>
				<SelectItem value="Europe/London">London</SelectItem>
				<SelectItem value="America/New_York">New York</SelectItem>
			</SelectPopup>
		</Select>
	);
}

const settingsSelector = (state: { isDirty: boolean; isSubmitting: boolean }) =>
	[state.isDirty, state.isSubmitting] as const;

function SettingsSurfaceFields({ testId }: { testId: string }) {
	return (
		<Stack data-testid={testId} gap="3">
			<Field>
				<FieldLabel>Workspace name</FieldLabel>
				<Input defaultValue="Mizen Studio" />
			</Field>
			<Field>
				<FieldLabel>Workspace summary</FieldLabel>
				<Textarea
					defaultValue="A shared workspace for product design and delivery."
					rows={2}
				/>
			</Field>
			<Field>
				<Select
					defaultValue="team"
					items={[
						{ label: "Team", value: "team" },
						{ label: "Private", value: "private" },
					]}
				>
					<SelectLabel>Default visibility</SelectLabel>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectPopup>
						<SelectItem value="team">Team</SelectItem>
						<SelectItem value="private">Private</SelectItem>
					</SelectPopup>
				</Select>
			</Field>
			<Field>
				<FieldLabel>
					<Switch />
					Weekly summary
				</FieldLabel>
			</Field>
			<Field disabled>
				<FieldLabel>Workspace ID</FieldLabel>
				<Input defaultValue="ws_8f29c1" disabled />
			</Field>
			<Field invalid>
				<FieldLabel>Email error preview</FieldLabel>
				<Input defaultValue="team@@mizen.dev" invalid readOnly />
				<FieldError match>Enter a valid contact email.</FieldError>
			</Field>
			<Button type="button" variant="brand">
				Brand action
			</Button>
		</Stack>
	);
}

export function SettingsComposition({
	showExamples = false,
}: {
	showExamples?: boolean;
} = {}) {
	const attempts = useRef(0);
	const formRef = useRef<HTMLFormElement>(null);
	const [saved, setSaved] = useState(initialSettings);
	const [notice, setNotice] = useState("");
	const [saveError, setSaveError] = useState("");
	const [discardOpen, setDiscardOpen] = useState(false);
	const saveButtonRef = useRef<HTMLButtonElement>(null);
	const focusInvalid = useCallback(() => {
		requestAnimationFrame(() => focusFirstInvalidControl(formRef.current));
	}, []);
	const form = useForm({
		defaultValues: saved,
		onSubmit: async ({ value }) => {
			setNotice("Saving workspace settings…");
			setSaveError("");
			await new Promise((resolve) => setTimeout(resolve, 350));
			attempts.current += 1;
			if (showExamples && attempts.current === 1) {
				setNotice("");
				setSaveError("Your draft is still here. Try saving again.");
				return;
			}
			setSaved(value);
			setNotice("Workspace settings saved.");
			form.reset(value);
		},
		onSubmitInvalid: focusInvalid,
	});
	const handleSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			setNotice("");
			setSaveError("");
			form
				.handleSubmit()
				.catch((error: unknown) => setSaveError(String(error)));
		},
		[form]
	);
	const openDiscardDialog = useCallback(() => setDiscardOpen(true), []);
	const discardChanges = useCallback(() => {
		form.reset(saved);
		setSaveError("");
		setNotice("Draft discarded.");
		setDiscardOpen(false);
	}, [form, saved]);

	return (
		<div {...props(compositionStyles.workspace)}>
			<Section aria-labelledby="settings-heading">
				<div {...props(compositionStyles.intro)}>
					<Heading id="settings-heading" level={2} size="title">
						Workspace settings
					</Heading>
					<p {...props(compositionStyles.sectionDescription)}>
						Manage your workspace profile, preferences, and notifications.
					</p>
				</div>
				<form.Subscribe selector={settingsSelector}>
					{([isDirty, isSubmitting]) => (
						<form noValidate onSubmit={handleSubmit} ref={formRef}>
							<Stack gap="0">
								<div {...props(compositionStyles.section)}>
									<div>
										<Heading id="settings-profile" level={3} size="subheading">
											Workspace profile
										</Heading>
										<p {...props(compositionStyles.sectionDescription)}>
											How your workspace appears to teammates and guests.
										</p>
									</div>
									<Fieldset
										aria-labelledby="settings-profile"
										disabled={isSubmitting}
									>
										<Stack gap="6">
											<Grid>
												<form.Field
													name="name"
													validators={{ onSubmit: validateWorkspaceName }}
												>
													{(field) => (
														<Field field={field}>
															<FieldLabel>Workspace name</FieldLabel>
															<Input autoComplete="organization" />
															<FieldDescription>
																Shown to everyone invited to this workspace.
															</FieldDescription>
															<FieldError />
														</Field>
													)}
												</form.Field>
												<form.Field
													name="contact"
													validators={{ onSubmit: validateContactEmail }}
												>
													{(field) => (
														<Field field={field}>
															<FieldLabel>Contact email</FieldLabel>
															<Input autoComplete="email" type="email" />
															<FieldDescription>
																Used for workspace notices and billing
																questions.
															</FieldDescription>
															<FieldError />
														</Field>
													)}
												</form.Field>
											</Grid>
											<form.Field name="description">
												{(field) => (
													<Field field={field}>
														<FieldLabel>Description</FieldLabel>
														<Textarea rows={2} />
														<FieldDescription>
															A short summary for teammates and invited guests.
														</FieldDescription>
													</Field>
												)}
											</form.Field>
											<Field>
												<FieldLabel>Workspace ID</FieldLabel>
												<Input defaultValue="ws_8f29c1" readOnly />
												<FieldDescription>
													This ID is managed by Mizen and is used in
													integrations.
												</FieldDescription>
											</Field>
										</Stack>
									</Fieldset>
								</div>

								<div {...props(compositionStyles.section)}>
									<div>
										<Heading
											id="settings-preferences"
											level={3}
											size="subheading"
										>
											Preferences
										</Heading>
										<p {...props(compositionStyles.sectionDescription)}>
											Set your team's time zone and default project access.
										</p>
									</div>
									<Fieldset
										aria-labelledby="settings-preferences"
										disabled={isSubmitting}
									>
										<Stack gap="6">
											<form.Field name="timezone">
												{(field) => (
													<Field>
														<TimezoneSelect
															onChange={field.handleChange}
															value={field.state.value}
														/>
														<FieldDescription>
															Dates and scheduled reports use this time zone.
														</FieldDescription>
													</Field>
												)}
											</form.Field>
											<Field>
												<div {...props(compositionStyles.preference)}>
													<FieldLabel>Default project visibility</FieldLabel>
													<Switch checked readOnly />
												</div>
												<FieldDescription>
													Private by default. Workspace admins can change this
													setting.
												</FieldDescription>
											</Field>
										</Stack>
									</Fieldset>
								</div>

								<div {...props(compositionStyles.section)}>
									<div>
										<Heading
											id="settings-notifications"
											level={3}
											size="subheading"
										>
											Notifications
										</Heading>
										<p {...props(compositionStyles.sectionDescription)}>
											Choose which updates arrive in your workspace inbox.
										</p>
									</div>
									<Fieldset
										aria-labelledby="settings-notifications"
										disabled={isSubmitting}
									>
										<Stack gap="3">
											<form.Field name="notifications">
												{(field) => (
													<Field>
														<CheckboxGroup
															aria-label="Notification preferences"
															onValueChange={field.handleChange}
															value={field.state.value}
														>
															{(
																Object.keys(notificationLabels) as Array<
																	keyof typeof notificationLabels
																>
															).map((name) => (
																<Field key={name}>
																	<div {...props(compositionStyles.preference)}>
																		<div>
																			<FieldLabel htmlFor={`settings-${name}`}>
																				{notificationLabels[name]}
																			</FieldLabel>
																			<FieldDescription>
																				{notificationDescriptions[name]}
																			</FieldDescription>
																		</div>
																		<Checkbox
																			id={`settings-${name}`}
																			name="notifications"
																			value={name}
																		/>
																	</div>
																</Field>
															))}
														</CheckboxGroup>
													</Field>
												)}
											</form.Field>
										</Stack>
									</Fieldset>
								</div>

								<div {...props(compositionStyles.actions)}>
									<Stack gap="3">
										<div {...props(compositionStyles.buttons)}>
											<Button
												disabled={isSubmitting}
												loading={isSubmitting}
												ref={saveButtonRef}
												type="submit"
												variant="brand"
											>
												Save changes
											</Button>
											<Button
												disabled={!isDirty || isSubmitting}
												onClick={openDiscardDialog}
												type="button"
												variant="outline"
											>
												Discard changes
											</Button>
										</div>
										<div {...props(compositionStyles.status)}>
											{isDirty ? (
												<Text size="ui" tone="muted">
													Unsaved changes
												</Text>
											) : null}
											{saveError ? (
												<Alert variant="error">
													<AlertTitle>Could not save changes</AlertTitle>
													<AlertDescription>{saveError}</AlertDescription>
												</Alert>
											) : null}
											{notice ? <p aria-live="polite">{notice}</p> : null}
										</div>
									</Stack>
								</div>
							</Stack>
						</form>
					)}
				</form.Subscribe>
				{showExamples ? (
					<>
						<DemoDisclosure title="About this example">
							<Text size="ui" tone="muted">
								Changes stay in this page. The first save previews a recoverable
								failure.
							</Text>
						</DemoDisclosure>
						<DemoDisclosure
							data-testid="settings-surface-comparison"
							id="settings-surface-comparison"
							title="Compare fields on the canvas and in a Card"
						>
							<Stack gap="3">
								<Grid>
									<Stack gap="3">
										<Heading level={3}>Canvas</Heading>
										<SettingsSurfaceFields testId="settings-surface-canvas" />
									</Stack>
									<Card data-testid="settings-surface-card">
										<CardHeader>
											{/* biome-ignore lint/a11y/useHeadingContent: CardTitle supplies accessible text to the rendered heading */}
											<CardTitle render={<h3 />}>Card</CardTitle>
										</CardHeader>
										<CardContent>
											<SettingsSurfaceFields testId="settings-surface-card-fields" />
										</CardContent>
									</Card>
								</Grid>
							</Stack>
						</DemoDisclosure>
					</>
				) : null}
				<Dialog onOpenChange={setDiscardOpen} open={discardOpen}>
					<DialogPopup finalFocus={saveButtonRef} size="sm">
						<DialogHeader>
							<DialogTitle>Discard unsaved changes?</DialogTitle>
							<DialogDescription>
								Your workspace settings will return to the last saved values.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose
								render={<Button variant="outline">Keep editing</Button>}
							/>
							<Button onClick={discardChanges} variant="destructive">
								Discard changes
							</Button>
						</DialogFooter>
					</DialogPopup>
				</Dialog>
			</Section>
		</div>
	);
}
