import {
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperTitle,
} from "@mizen-labs/ui";
import { IconRocket } from "@tabler/icons-react";

const setupSteps = [
	["Workspace", "complete"],
	["Team", "complete"],
	["Integrations", "current"],
	["Review", "upcoming"],
	["Launch", "upcoming"],
] as const;

export function WorkspaceSetupStepper() {
	return (
		<Stepper aria-label="Workspace setup">
			{setupSteps.map(([title, status], index) => (
				<StepperItem key={title} status={status}>
					<StepperIndicator>{index + 1}</StepperIndicator>
					<StepperTitle>{title}</StepperTitle>
				</StepperItem>
			))}
		</Stepper>
	);
}
export function OnTrackSetupStepper() {
	return (
		<Stepper aria-label="On-track setup" layout="on-track">
			{setupSteps.map(([title, status], index) => (
				<StepperItem key={title} status={status}>
					<StepperIndicator>{index + 1}</StepperIndicator>
					<StepperTitle>{title}</StepperTitle>
				</StepperItem>
			))}
		</Stepper>
	);
}
export function VerticalSetupStepper() {
	return (
		<Stepper aria-label="Deployment progress" orientation="vertical">
			<StepperItem status="complete">
				<StepperIndicator>1</StepperIndicator>
				<StepperTitle>Prepare the build</StepperTitle>
				<StepperDescription>Dependencies and checks passed.</StepperDescription>
			</StepperItem>
			<StepperItem status="current">
				<StepperIndicator>2</StepperIndicator>
				<StepperTitle>Deploy to production</StepperTitle>
				<StepperDescription>
					Publish the reviewed build to your workspace.
				</StepperDescription>
			</StepperItem>
			<StepperItem status="upcoming">
				<StepperIndicator>3</StepperIndicator>
				<StepperTitle>Verify the release</StepperTitle>
				<StepperDescription>
					Check the live application before sharing it.
				</StepperDescription>
			</StepperItem>
		</Stepper>
	);
}
export function NumberedSetupStepper() {
	return (
		<Stepper aria-label="Numbered setup">
			{(["complete", "current", "upcoming"] as const).map((status, index) => (
				<StepperItem key={status} status={status}>
					<StepperIndicator mode="number">{index + 1}</StepperIndicator>
					<StepperTitle>{["Workspace", "Team", "Launch"][index]}</StepperTitle>
				</StepperItem>
			))}
		</Stepper>
	);
}

export function StepperIndicatorModes() {
	return (
		<Stepper aria-label="Indicator modes" orientation="vertical">
			{(["auto", "number", "custom", "none"] as const).map((mode, index) => (
				<StepperItem key={mode} status="complete">
					<StepperIndicator mode={mode}>
						{mode === "custom" ? <IconRocket size={12} /> : index + 1}
					</StepperIndicator>
					<StepperTitle>{mode}</StepperTitle>
				</StepperItem>
			))}
		</Stepper>
	);
}
