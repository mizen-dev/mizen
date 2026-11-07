"use client";
import {
	Button,
	Field,
	FieldLabel,
	Group,
	Input,
	Stack,
	Stepper,
	StepperContent,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperTitle,
	StepperTrigger,
	Text,
} from "@mizen-labs/ui";
import { typographyStyles } from "@mizen-labs/ui/typography.styles";
import { create, props } from "@stylexjs/stylex";
import { type ChangeEvent, useCallback, useState } from "react";

const projectSteps = [
	{ description: "Choose a name and workspace.", title: "Details" },
	{ description: "Invite the people you work with.", title: "Members" },
	{ description: "Check the project before publishing.", title: "Review" },
] as const;
export function StepperCreateAProjectExample1() {
	const [step, setStep] = useState(0);
	const [details, setDetails] = useState({
		email: "",
		name: "Northstar launch",
		workspace: "Product team",
	});
	const changeDetails = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.currentTarget;
		setDetails((current) => ({ ...current, [name]: value }));
	}, []);
	const goBack = useCallback(() => setStep((current) => current - 1), []);
	const goForward = useCallback(() => setStep((current) => current + 1), []);
	return (
		<Stack gap="4">
			<Stepper activeStep={step} aria-label="Project setup">
				{projectSteps.map(({ description, title }, index) => (
					<StepperItem key={title} step={index}>
						<StepperIndicator>{index + 1}</StepperIndicator>
						<StepperTitle>{title}</StepperTitle>
						<StepperDescription>{description}</StepperDescription>
					</StepperItem>
				))}
			</Stepper>
			{step === 0 ? (
				<Stack gap="6">
					<Field>
						<FieldLabel>Project name</FieldLabel>
						<Input name="name" onChange={changeDetails} value={details.name} />
					</Field>
					<Field>
						<FieldLabel>Workspace</FieldLabel>
						<Input
							name="workspace"
							onChange={changeDetails}
							value={details.workspace}
						/>
					</Field>
				</Stack>
			) : null}
			{step === 1 ? (
				<Field>
					<FieldLabel>Invite by email</FieldLabel>
					<Input
						name="email"
						onChange={changeDetails}
						placeholder="teammate@example.com"
						type="email"
						value={details.email}
					/>
				</Field>
			) : null}
			{step === 2 ? (
				<Stack gap="2">
					<Text>
						{details.name || "Your project"} will be created in the{" "}
						{details.workspace || "selected"} workspace.
					</Text>
					<Text size="ui" tone="muted">
						{details.email
							? `Invite ${details.email} to this project.`
							: "No invitations added."}
					</Text>
				</Stack>
			) : null}
			<Text
				aria-live="polite"
				data-testid="stepper-status"
				size="ui"
				tone="muted"
			>
				<span {...props(typographyStyles.tabularNums)}>
					Step {step + 1} of 3: {projectSteps[step]?.title}
				</span>
			</Text>
			<Group>
				<Button disabled={step === 0} onClick={goBack} variant="secondary">
					Back
				</Button>
				<Button disabled={step === 2} onClick={goForward}>
					Continue
				</Button>
			</Group>
		</Stack>
	);
}

export function EditableSetupStepper() {
	const [step, setStep] = useState(1);
	const [name, setName] = useState("Northstar launch");
	const changeName = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			setName(event.currentTarget.value),
		[]
	);

	return (
		<Stepper
			activeStep={step}
			aria-label="Editable setup"
			density="compact"
			onStepClick={setStep}
			orientation="vertical"
		>
			{projectSteps.map(({ title, description }, index) => (
				<StepperItem
					disabled={index === 2}
					key={title}
					optional={index === 1}
					step={index}
				>
					<StepperTrigger aria-label={`Go to ${title}`}>
						<StepperIndicator>{index + 1}</StepperIndicator>
						<StepperTitle>{title}</StepperTitle>
						<StepperDescription>{description}</StepperDescription>
					</StepperTrigger>
					{index === step && (
						<StepperContent>
							<Field>
								<FieldLabel>Project name</FieldLabel>
								<Input onChange={changeName} value={name} />
							</Field>
						</StepperContent>
					)}
				</StepperItem>
			))}
		</Stepper>
	);
}

const styles = create({ progressExample: { minInlineSize: 0, width: "100%" } });

const releaseSteps = ["Prepare", "Build", "Deploy", "Verify"] as const;

export function AnimatedReleaseStepper() {
	const [step, setStep] = useState(0);
	const goBack = useCallback(() => setStep((current) => current - 1), []);
	const goForward = useCallback(() => setStep((current) => current + 1), []);
	return (
		<div {...props(styles.progressExample)}>
			<Stack gap="4">
				<Stepper
					activeStep={step}
					aria-label="Release checklist"
					layout="on-track"
					onStepClick={setStep}
				>
					{releaseSteps.map((title, index) => (
						<StepperItem key={title} step={index}>
							<StepperTrigger aria-label={`Go to ${title}`}>
								<StepperIndicator>{index + 1}</StepperIndicator>
								<StepperTitle>{title}</StepperTitle>
							</StepperTrigger>
						</StepperItem>
					))}
				</Stepper>
				<Text aria-live="polite" size="ui" tone="muted">
					<span {...props(typographyStyles.tabularNums)}>
						Step {step + 1} of {releaseSteps.length}: {releaseSteps[step]}
					</span>
				</Text>
				<Group>
					<Button disabled={step === 0} onClick={goBack} variant="secondary">
						Previous step
					</Button>
					<Button
						disabled={step === releaseSteps.length - 1}
						onClick={goForward}
					>
						Next step
					</Button>
				</Group>
			</Stack>
		</div>
	);
}
