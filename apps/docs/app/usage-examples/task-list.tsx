"use client";

import { Button, TaskList, type TaskListStep } from "@mizen/ui";
import { create, props } from "@stylexjs/stylex";
import { useCallback, useRef, useState } from "react";

const styles = create({
	frame: {
		display: "flex",
		flexDirection: "column",
		gap: "1rem",
		maxInlineSize: "34rem",
		minBlockSize: "18rem",
		minInlineSize: 0,
		width: "100%",
	},
	replay: { alignSelf: "flex-start" },
});

const TITLE = "Move Card to container queries";

const plan = [
	{
		detail: "packages/ui/src/components/card",
		id: "find",
		title: "Find the media queries in Card",
	},
	{ id: "contain", title: "Add container-type to the card wrapper" },
	{ id: "rewrite", title: "Rewrite the breakpoints as @container rules" },
	{
		detail: "Light, dark, and 390px",
		id: "test",
		title: "Run the visual tests",
	},
] as const;

const STEP_MS = 900;

// Steps before `current` are done, `current` runs, and the rest wait.
function stepsAt(current: number): TaskListStep[] {
	return plan.map((step, index) => {
		if (index < current) {
			return { ...step, status: "complete" };
		}
		return { ...step, status: index === current ? "running" : "pending" };
	});
}

// The agent asks first, then works through the plan; it folds when done.
export function AgentPlan() {
	const [current, setCurrent] = useState<number | null>(null);
	const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
	const approve = useCallback(() => {
		clearInterval(timer.current);
		let step = 0;
		setCurrent(step);
		timer.current = setInterval(() => {
			step += 1;
			setCurrent(step);
			if (step >= plan.length) {
				clearInterval(timer.current);
			}
		}, STEP_MS);
	}, []);
	const replay = useCallback(() => {
		clearInterval(timer.current);
		setCurrent(null);
	}, []);
	return (
		<div {...props(styles.frame)}>
			<TaskList
				approval={current === null}
				onApprove={approve}
				steps={stepsAt(current ?? -1)}
				title={TITLE}
			/>
			<span {...props(styles.replay)}>
				<Button onClick={replay} size="sm" variant="outline">
					Replay
				</Button>
			</span>
		</div>
	);
}

// A failed step stops the plan; Retry from here runs it and the rest again.
export function FailedPlan() {
	const [retried, setRetried] = useState(false);
	const retry = useCallback(() => setRetried(true), []);
	const steps: TaskListStep[] = plan.map((step, index) => {
		if (index < 3) {
			return { ...step, duration: [0.8, 0.4, 2.1][index], status: "complete" };
		}
		if (retried) {
			return { ...step, status: "running" };
		}
		return {
			...step,
			duration: 12,
			error:
				"3 screenshots changed: Card in the settings sidebar is 32px wider.",
			status: "error",
		};
	});
	return (
		<div {...props(styles.frame)}>
			<TaskList onRetry={retry} steps={steps} title={TITLE} />
		</div>
	);
}
