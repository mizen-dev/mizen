"use client";

import { props } from "@stylexjs/stylex";
import {
	type ComponentPropsWithRef,
	type RefCallback,
	useCallback,
	useState,
} from "react";
import type { Closed } from "../../closed";
import {
	IconAlertCircle,
	IconChevronDown,
	IconCircle,
	IconCircleCheck,
	IconListCheck,
	IconRefresh,
} from "../../icons";
import { MotionScope, Pop, Rise } from "../../motion";
import { typeRoles } from "../../styles/typography.styles";
import { formatShortSeconds, useElapsed } from "../../use-elapsed";
import { agentThinkingStyles } from "../agent-thinking/agent-thinking.styles";
import { Button } from "../button/button";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "../collapsible/collapsible";
import { Spinner } from "../spinner/spinner";
import { toolCallStyles } from "../tool-call/tool-call.styles";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";
import { taskListStyles as styles } from "./task-list.styles";

export type TaskListStepState = "complete" | "error" | "pending" | "running";

export interface TaskListStep {
	/** A second line, such as the data the step works on. */
	detail?: string;
	/** Seconds the step took, for a plan loaded from history. */
	duration?: number;
	/** Why the step failed, shown with Retry from here. */
	error?: string;
	id: string;
	status: TaskListStepState;
	title: string;
}

export type TaskListProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "role" | "title"
> & {
	/** Asks before the agent starts, with Approve and Revise. */
	approval?: boolean;
	/** Seconds the whole plan took, for a plan loaded from history. */
	duration?: number;
	onApprove?: () => void;
	/** Shows Retry from here under a failed step. */
	onRetry?: (stepId: string) => void;
	/** Asks the person what to change, such as by focusing the composer. */
	onRevise?: () => void;
	steps: readonly TaskListStep[];
	/** The plan's goal, such as "Prepare the Q3 board update". */
	title: string;
};

type Phase = "approval" | "complete" | "error" | "running";

const STATE_TEXT: Record<TaskListStepState, string> = {
	complete: "done",
	error: "failed",
	pending: "not started",
	running: "in progress",
};

function phaseOf(steps: readonly TaskListStep[], approval: boolean): Phase {
	if (approval) {
		return "approval";
	}
	if (steps.some((step) => step.status === "error")) {
		return "error";
	}
	if (steps.length > 0 && steps.every((step) => step.status === "complete")) {
		return "complete";
	}
	return "running";
}

function metaOf(phase: Phase, steps: readonly TaskListStep[]) {
	const total = steps.length;
	if (phase === "approval") {
		return `${total} ${total === 1 ? "step" : "steps"}`;
	}
	if (phase === "error") {
		const failed = steps.findIndex((step) => step.status === "error");
		return `Stopped at step ${failed + 1}`;
	}
	const done = steps.filter((step) => step.status === "complete").length;
	return `${done} of ${total}`;
}

function Summary({
	markEnd,
	markStart,
	phase,
	seconds,
	steps,
	title,
}: {
	markEnd: RefCallback<HTMLElement>;
	markStart: RefCallback<HTMLElement>;
	phase: Phase;
	seconds: number | undefined;
	steps: readonly TaskListStep[];
	title: string;
}) {
	if (phase !== "complete") {
		return (
			<span ref={phase === "running" ? markStart : undefined}>
				<span {...props(phase === "running" && agentThinkingStyles.stage)}>
					{title}
				</span>{" "}
				<span {...props(styles.meta, phase === "error" && styles.errorText)}>
					· {metaOf(phase, steps)}
				</span>
			</span>
		);
	}
	const total = steps.length;
	return (
		<span ref={markEnd}>
			{title}{" "}
			<span {...props(styles.meta)}>
				· {total} {total === 1 ? "step" : "steps"}
				{seconds === undefined ? null : ` · ${formatShortSeconds(seconds)}`}
			</span>
		</span>
	);
}

// A running step starts the clock; a completed one stops it.
function timingRef(
	status: TaskListStepState,
	markStart: RefCallback<HTMLElement>,
	markEnd: RefCallback<HTMLElement>
) {
	if (status === "running") {
		return markStart;
	}
	return status === "complete" ? markEnd : undefined;
}

// The step's mark. A change of status pops in; a step that loads or
// remounts shows its mark still.
function Marker({
	markEnd,
	markStart,
	status,
}: {
	markEnd: RefCallback<HTMLElement>;
	markStart: RefCallback<HTMLElement>;
	status: TaskListStepState;
}) {
	const failed = status === "error";
	const ended = status === "complete" || failed;
	const Icon = failed ? IconAlertCircle : IconCircleCheck;
	return (
		<Pop
			change={status}
			look={[
				styles.marker,
				status === "complete" && styles.markerComplete,
				failed && styles.markerError,
			]}
			ref={timingRef(status, markStart, markEnd)}
		>
			{status === "running" ? <Spinner aria-hidden="true" /> : null}
			{status === "pending" ? (
				<IconCircle aria-hidden="true" size={14} />
			) : null}
			{ended ? <Icon aria-hidden="true" size={16} /> : null}
		</Pop>
	);
}

function Duration({ seconds }: { seconds: number | undefined }) {
	if (seconds === undefined) {
		return null;
	}
	return (
		<span {...props(typeRoles.caption, styles.duration)}>
			{formatShortSeconds(seconds)}
		</span>
	);
}

function StepError({
	error,
	onRetry,
	stepId,
}: {
	error: string | undefined;
	onRetry: TaskListProps["onRetry"];
	stepId: string;
}) {
	const retry = useCallback(() => onRetry?.(stepId), [onRetry, stepId]);
	return (
		<div data-slot="task-list-error" {...props(styles.error)}>
			<p {...props(typeRoles.caption, styles.errorText)}>
				{error ?? "This step failed."}
			</p>
			{onRetry ? (
				<Button onClick={retry} size="xs" variant="outline">
					<IconRefresh aria-hidden="true" size="1em" />
					Retry from here
				</Button>
			) : null}
		</div>
	);
}

function Step({
	connected,
	onRetry,
	step,
}: {
	connected: boolean;
	onRetry: TaskListProps["onRetry"];
	step: TaskListStep;
}) {
	const elapsed = useElapsed();
	const seconds = step.duration ?? elapsed.seconds;
	const ended = step.status === "complete" || step.status === "error";
	return (
		<li
			aria-current={step.status === "running" ? "step" : undefined}
			data-slot="task-list-step"
			data-status={step.status}
			{...props(styles.step, connected && styles.stepConnected)}
		>
			<Marker
				markEnd={elapsed.markEnd}
				markStart={elapsed.markStart}
				status={step.status}
			/>
			<div {...props(styles.stepBody)}>
				<div {...props(typeRoles.ui, styles.stepHead)}>
					<span
						{...props(
							styles.stepTitle,
							step.status === "pending" && styles.titlePending
						)}
					>
						{step.title}
						<VisuallyHidden>, {STATE_TEXT[step.status]}</VisuallyHidden>
					</span>
					{ended ? <Duration seconds={seconds} /> : null}
				</div>
				{step.detail ? (
					<p {...props(typeRoles.caption, styles.detail)}>{step.detail}</p>
				) : null}
				{step.status === "error" ? (
					<StepError error={step.error} onRetry={onRetry} stepId={step.id} />
				) : null}
			</div>
		</li>
	);
}

function Review({
	onApprove,
	onRevise,
}: Pick<TaskListProps, "onApprove" | "onRevise">) {
	return (
		<div
			data-slot="task-list-approval"
			{...props(toolCallStyles.notice, toolCallStyles.noticeSlot)}
		>
			<p {...props(typeRoles.ui, toolCallStyles.noticeText)}>
				Approve this plan to start.
			</p>
			<div {...props(toolCallStyles.noticeActions)}>
				{onRevise ? (
					<Button onClick={onRevise} size="sm" variant="outline">
						Revise
					</Button>
				) : null}
				{onApprove ? (
					<Button onClick={onApprove} size="sm">
						Approve
					</Button>
				) : null}
			</div>
		</div>
	);
}

// One region, always present, announces each step as it starts and the end.
function Announcement({
	phase,
	steps,
	title,
}: {
	phase: Phase;
	steps: readonly TaskListStep[];
	title: string;
}) {
	const index = steps.findIndex(
		(candidate) =>
			candidate.status === "running" || candidate.status === "error"
	);
	const step = steps[index];
	let message = "";
	if (phase === "complete") {
		message = `Done: ${title}`;
	} else if (step && phase !== "approval") {
		const verb = step.status === "error" ? "Failed" : "Step";
		message = `${verb} ${index + 1} of ${steps.length}: ${step.title}`;
	}
	return (
		<span
			aria-live="polite"
			data-slot="task-list-status"
			role="status"
			{...props(visuallyHiddenStyles.root)}
		>
			{message}
		</span>
	);
}

/**
 * The steps an agent plans and how far it has got. It can ask before the
 * agent starts; while steps run it stays open with the current one marked,
 * and once every step is done it folds into a summary.
 */
export function TaskList({
	approval = false,
	duration,
	onApprove,
	onRetry,
	onRevise,
	ref: forwardedRef,
	steps,
	title,
	...rest
}: TaskListProps) {
	const elapsed = useElapsed();
	const phase = phaseOf(steps, approval);
	// null until the reader opens or closes it themselves.
	const [open, setOpen] = useState<boolean | null>(null);
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	const working = phase === "running";
	return (
		<div
			{...rest}
			data-slot="task-list"
			data-status={phase}
			ref={forwardedRef}
			{...props(toolCallStyles.root)}
		>
			<Announcement phase={phase} steps={steps} title={title} />
			<MotionScope>
				<Collapsible
					onOpenChange={setOpen}
					open={open === null ? phase !== "complete" : open}
					render={<div {...props(toolCallStyles.clip)} />}
				>
					<CollapsibleTrigger
						render={
							<button
								type="button"
								{...props(typeRoles.ui, toolCallStyles.row)}
							/>
						}
					>
						<Pop
							change={working ? "working" : "idle"}
							look={toolCallStyles.icon}
						>
							{working ? (
								<Spinner aria-hidden="true" />
							) : (
								<IconListCheck aria-hidden="true" size={16} />
							)}
						</Pop>
						<Rise
							change={phase === "complete" ? "complete" : "open"}
							look={toolCallStyles.title}
						>
							<Summary
								markEnd={elapsed.markEnd}
								markStart={elapsed.markStart}
								phase={phase}
								seconds={duration ?? elapsed.seconds}
								steps={steps}
								title={title}
							/>
						</Rise>
						<IconChevronDown
							aria-hidden="true"
							size={14}
							{...props(toolCallStyles.chevron)}
						/>
					</CollapsibleTrigger>
					<CollapsiblePanel>
						<div {...props(toolCallStyles.panel, toolCallStyles.details)}>
							<ol aria-label={title} {...props(styles.steps)}>
								{steps.map((step, index) => (
									<Step
										connected={index < steps.length - 1}
										key={step.id}
										onRetry={onRetry}
										step={step}
									/>
								))}
							</ol>
						</div>
					</CollapsiblePanel>
					{/* Outside the fold, so the question stays in view when folded. */}
					{phase === "approval" ? (
						<Review onApprove={onApprove} onRevise={onRevise} />
					) : null}
				</Collapsible>
			</MotionScope>
		</div>
	);
}
