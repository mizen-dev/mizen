"use client";

import { props } from "@stylexjs/stylex";
import {
	type ComponentPropsWithRef,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";
import type { Closed } from "../../closed";
import { controlLabel } from "../../control-label";
import { IconCheck } from "../../icons";
import { typographyStyles } from "../../styles/typography.styles";
import { stepperStyles } from "./stepper.styles";

const StepperContext = createContext<{
	activeStep?: number;
	onStepClick?: (step: number) => void;
	forward?: boolean;
}>({});
const StepContext = createContext<{
	step?: number;
	disabled?: boolean;
	optional?: boolean;
}>({});

export type StepperState = "complete" | "current" | "upcoming";

type StepperAccessibleName =
	| { "aria-label": string; "aria-labelledby"?: string }
	| { "aria-label"?: string; "aria-labelledby": string };

export type StepperProps = Omit<
	Closed<ComponentPropsWithRef<"ol">>,
	"aria-label" | "aria-labelledby" | "data-slot" | "role"
> &
	StepperAccessibleName & {
		orientation?: "horizontal" | "vertical";
		layout?: "separated" | "on-track";
		density?: "compact" | "balanced" | "spacious";
		activeStep?: number;
		onStepClick?: (step: number) => void;
	};

export type StepperItemProps = Omit<
	Closed<ComponentPropsWithRef<"li">>,
	"aria-current" | "data-slot" | "role"
> &
	(
		| { status: StepperState; step?: number }
		| { step: number; status?: never }
	) & {
		disabled?: boolean;
		optional?: boolean;
	};

export type StepperIndicatorProps = Omit<
	Closed<ComponentPropsWithRef<"span">>,
	"data-slot"
> & { mode?: "auto" | "number" | "custom" | "none" };

export type StepperTitleProps = Omit<
	Closed<ComponentPropsWithRef<"span">>,
	"data-slot"
>;

export type StepperDescriptionProps = Omit<
	Closed<ComponentPropsWithRef<"p">>,
	"data-slot"
>;

const statusStyles = {
	complete: stepperStyles.complete,
	current: stepperStyles.current,
	upcoming: stepperStyles.upcoming,
} satisfies Record<StepperState, typeof stepperStyles.complete>;

function getProgress(step: number, activeStep: number): StepperState {
	if (step < activeStep) {
		return "complete";
	}
	return step === activeStep ? "current" : "upcoming";
}

function isStepperState(status: unknown): status is StepperState {
	return typeof status === "string" && Object.hasOwn(statusStyles, status);
}

const frameByOrientation = {
	horizontal: null,
	vertical: stepperStyles.frameVertical,
} as const;

export function Stepper({
	children,
	activeStep,
	onStepClick,
	orientation = "horizontal",
	layout = "separated",
	density = "balanced",
	ref: forwardedRef,
	...rest
}: StepperProps) {
	const [progress, setProgress] = useState({
		activeStep,
		forward: false,
		layout,
		orientation,
	});
	const sameLayout =
		progress.layout === layout && progress.orientation === orientation;
	if (!(Object.is(progress.activeStep, activeStep) && sameLayout)) {
		setProgress({
			activeStep,
			forward:
				sameLayout &&
				activeStep !== undefined &&
				progress.activeStep !== undefined &&
				activeStep === progress.activeStep + 1,
			layout,
			orientation,
		});
	}
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "role");
	Reflect.deleteProperty(rest, "style");

	return (
		<StepperContext
			value={{ activeStep, forward: progress.forward, onStepClick }}
		>
			<div {...props(stepperStyles.frame, frameByOrientation[orientation])}>
				<ol
					{...rest}
					data-density={density}
					data-layout={layout}
					data-orientation={orientation}
					data-slot="stepper"
					ref={forwardedRef}
					// biome-ignore lint/a11y/noRedundantRoles: Safari needs an explicit list role when list-style is none outside nav.
					role="list"
					{...props(stepperStyles.root)}
				>
					{children}
				</ol>
			</div>
		</StepperContext>
	);
}

export function StepperItem({
	children,
	ref: forwardedRef,
	status,
	step,
	disabled = false,
	optional = false,
	...rest
}: StepperItemProps) {
	const { activeStep, forward } = useContext(StepperContext);
	const resolvedStatus =
		step !== undefined && activeStep !== undefined
			? getProgress(step, activeStep)
			: status;
	const safeStatus = isStepperState(resolvedStatus)
		? resolvedStatus
		: "upcoming";
	Reflect.deleteProperty(rest, "aria-current");
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "role");
	Reflect.deleteProperty(rest, "style");

	return (
		<StepContext value={{ disabled, optional, step }}>
			<li
				{...rest}
				aria-current={safeStatus === "current" ? "step" : undefined}
				data-disabled={disabled || undefined}
				data-motion={forward ? "forward" : "none"}
				data-slot="stepper-item"
				data-status={safeStatus}
				ref={forwardedRef}
				{...props(stepperStyles.item, statusStyles[safeStatus])}
			>
				{safeStatus === "complete" && (
					<span
						data-slot="stepper-status"
						{...props(stepperStyles.visuallyHidden)}
					>
						Completed:{" "}
					</span>
				)}
				{children}
			</li>
		</StepContext>
	);
}

export function StepperIndicator({
	children,
	mode = "auto",
	ref: forwardedRef,
	...rest
}: StepperIndicatorProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<span
			{...rest}
			aria-hidden="true"
			data-mode={mode}
			data-slot="stepper-indicator"
			ref={forwardedRef}
			{...props(stepperStyles.indicator)}
		>
			<span
				{...props(
					stepperStyles.markerContent,
					mode === "auto" && stepperStyles.autoNumber
				)}
			>
				{controlLabel(children)}
			</span>
			{mode === "auto" && (
				<>
					<IconCheck {...props(stepperStyles.check)} size={12} />
					<span {...props(stepperStyles.currentDot)} />
				</>
			)}
		</span>
	);
}

export function StepperTitle({
	children,
	ref: forwardedRef,
	...rest
}: StepperTitleProps) {
	const { optional } = useContext(StepContext);
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<span
			{...rest}
			data-slot="stepper-title"
			ref={forwardedRef}
			{...props(stepperStyles.title)}
		>
			<span {...props(stepperStyles.titleLabel, typographyStyles.controlLabel)}>
				{children}
			</span>
			{!!optional && <span {...props(stepperStyles.optional)}>Optional</span>}
		</span>
	);
}

export function StepperDescription({
	children,
	ref: forwardedRef,
	...rest
}: StepperDescriptionProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "style");

	return (
		<p
			{...rest}
			data-slot="stepper-description"
			ref={forwardedRef}
			{...props(stepperStyles.description)}
		>
			{children}
		</p>
	);
}

export type StepperTriggerProps = Omit<
	Closed<ComponentPropsWithRef<"button">>,
	"data-slot" | "role"
>;
export type StepperContentProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"data-slot"
>;

export function StepperTrigger({
	children,
	onClick,
	ref,
	type = "button",
	...rest
}: StepperTriggerProps) {
	const { step, disabled } = useContext(StepContext);
	const { onStepClick } = useContext(StepperContext);
	const handleClick = useCallback<NonNullable<StepperTriggerProps["onClick"]>>(
		(event) => {
			onClick?.(event);
			if (!event.defaultPrevented && step !== undefined) {
				onStepClick?.(step);
			}
		},
		[onClick, onStepClick, step]
	);
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "style");
	Reflect.deleteProperty(rest, "data-slot");
	Reflect.deleteProperty(rest, "role");
	return (
		<button
			{...rest}
			data-slot="stepper-trigger"
			disabled={disabled || rest.disabled}
			onClick={handleClick}
			ref={ref}
			type={type}
			{...props(stepperStyles.trigger)}
		>
			{children}
		</button>
	);
}

export function StepperContent({
	children,
	ref,
	...rest
}: StepperContentProps) {
	Reflect.deleteProperty(rest, "className");
	Reflect.deleteProperty(rest, "style");
	Reflect.deleteProperty(rest, "data-slot");
	return (
		<div
			{...rest}
			data-slot="stepper-content"
			ref={ref}
			{...props(stepperStyles.content)}
		>
			{children}
		</div>
	);
}
