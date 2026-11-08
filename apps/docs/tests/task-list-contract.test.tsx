// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	TaskList,
	type TaskListStep,
} from "../../../packages/ui/src/components/task-list/task-list";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

function noop() {
	// Only whether a handler exists matters here.
}

function render(markup: string) {
	const container = document.createElement("div");
	container.innerHTML = markup;
	return container;
}

const steps = (...states: TaskListStep["status"][]): TaskListStep[] =>
	states.map((status, index) => ({
		id: `s${index}`,
		status,
		title: `Step ${index + 1}`,
	}));

describe("TaskList contract", () => {
	it("asks before the agent starts, with each button only when handled", () => {
		const root = render(
			renderToStaticMarkup(
				<TaskList
					approval
					onApprove={noop}
					steps={steps("pending", "pending")}
					title="Plan"
				/>
			)
		);
		expect(
			root.querySelector('[data-slot="task-list"]')?.getAttribute("data-status")
		).toBe("approval");
		expect(root.querySelector("button")?.textContent).toBe("Plan · 2 steps");
		const approval = root.querySelector('[data-slot="task-list-approval"]');
		expect(
			[...(approval?.querySelectorAll("button") ?? [])].map(
				(button) => button.textContent
			)
		).toEqual(["Approve"]);
		// Nothing runs yet, so nothing is announced.
		expect(
			root.querySelector('[data-slot="task-list-status"]')?.textContent
		).toBe("");
	});

	it("marks the running step and announces it while the plan runs", () => {
		const root = render(
			renderToStaticMarkup(
				<TaskList
					steps={steps("complete", "running", "pending")}
					title="Plan"
				/>
			)
		);
		const list = root.querySelector("ol");
		expect(list?.getAttribute("aria-label")).toBe("Plan");
		const items = [...(list?.querySelectorAll("li") ?? [])];
		expect(items.map((item) => item.getAttribute("aria-current"))).toEqual([
			null,
			"step",
			null,
		]);
		expect(items.map((item) => item.textContent)).toEqual([
			"Step 1, done",
			"Step 2, in progress",
			"Step 3, not started",
		]);
		expect(root.querySelector("button")?.textContent).toBe("Plan · 1 of 3");
		expect(
			root.querySelector('[data-slot="task-list-status"]')?.textContent
		).toBe("Step 2 of 3: Step 2");
	});

	it("folds into a summary with the time once every step is done", () => {
		const root = render(
			renderToStaticMarkup(
				<TaskList
					duration={72}
					steps={steps("complete", "complete")}
					title="Plan"
				/>
			)
		);
		const trigger = root.querySelector("button");
		expect(trigger?.textContent).toBe("Plan · 2 steps · 1m 12s");
		expect(trigger?.getAttribute("aria-expanded")).toBe("false");
	});

	it("stops at a failed step and shows why, with Retry from here", () => {
		const failed = steps("complete", "error", "pending");
		const root = render(
			renderToStaticMarkup(
				<TaskList
					onRetry={noop}
					steps={failed.map((step) =>
						step.status === "error"
							? { ...step, duration: 3, error: "Timed out." }
							: step
					)}
					title="Plan"
				/>
			)
		);
		expect(root.querySelector("button")?.textContent).toBe(
			"Plan · Stopped at step 2"
		);
		expect(
			root.querySelector('[data-slot="task-list-error"]')?.textContent
		).toBe("Timed out.Retry from here");
		expect(
			root.querySelector('[data-slot="task-list-status"]')?.textContent
		).toBe("Failed 2 of 3: Step 2");
	});
});
