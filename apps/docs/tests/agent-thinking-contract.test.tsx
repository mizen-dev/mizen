// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { AgentThinking } from "../../../packages/ui/src/components/agent-thinking/agent-thinking";
import { formatSeconds } from "../../../packages/ui/src/use-elapsed";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

function render(markup: string) {
	const container = document.createElement("div");
	container.innerHTML = markup;
	return container;
}

describe("AgentThinking contract", () => {
	it("announces the current step while the reasoning streams", () => {
		const root = render(
			renderToStaticMarkup(
				<AgentThinking
					content="Start with MDN."
					sources={[{ href: "https://docs.vendor.dev/a", title: "Guide" }]}
					stage="Reading the sources"
					status="streaming"
				/>
			)
		);
		const stage = root.querySelector('[data-slot="agent-thinking-stage"]');
		expect(stage?.textContent).toBe("Reading the sources");
		// One status region, always present, announces each step.
		const status = root.querySelector('[data-slot="agent-thinking-status"]');
		expect(status?.getAttribute("role")).toBe("status");
		expect(status?.textContent).toBe("Reading the sources");
		// The thinking indicator is decorative; the step names the work.
		expect(
			stage?.querySelector('[data-slot="spinner"]')?.getAttribute("aria-hidden")
		).toBe("true");
		expect(root.querySelector("button")).toBeNull();
		expect(
			root.querySelector('[data-slot="agent-thinking-reasoning"]')?.textContent
		).toBe("Start with ");
		expect(root.querySelectorAll('[data-slot="inline-citation"]')).toHaveLength(
			1
		);
	});

	it("defaults the step to Thinking before any reasoning arrives", () => {
		const root = render(
			renderToStaticMarkup(<AgentThinking status="streaming" />)
		);
		expect(
			root.querySelector('[data-slot="agent-thinking-stage"]')?.textContent
		).toBe("Thinking");
	});

	it("folds into a toggle with the time spent once complete", () => {
		const timed = render(
			renderToStaticMarkup(
				<AgentThinking content="Done." duration={7} status="complete" />
			)
		);
		const toggle = timed.querySelector("button");
		expect(toggle?.textContent).toBe("Thoughtfor 7s");
		expect(toggle?.getAttribute("aria-expanded")).toBe("false");
		expect(
			timed.querySelector('[data-slot="agent-thinking-status"]')?.textContent
		).toBe("Thought for 7s");
		// Without a duration, a reply from history just says it thought.
		const untimed = render(
			renderToStaticMarkup(<AgentThinking content="Done." status="complete" />)
		);
		expect(untimed.querySelector("button")?.textContent).toBe("Thought");
	});

	it("shows a plain line when there is nothing to open", () => {
		const root = render(
			renderToStaticMarkup(<AgentThinking duration={3} status="complete" />)
		);
		expect(root.querySelector("button")).toBeNull();
		expect(root.textContent).toContain("Thoughtfor 3s");
	});

	it("rounds the time and splits minutes", () => {
		expect(formatSeconds(0.4)).toBe("1s");
		expect(formatSeconds(7)).toBe("7s");
		expect(formatSeconds(95)).toBe("1m 35s");
		expect(formatSeconds(120)).toBe("2m");
	});

	it("protects its slot, role, and styling", () => {
		const markup = renderToStaticMarkup(
			<AgentThinking
				{...({
					className: "custom",
					"data-slot": "custom",
					role: "log",
					style: { color: "red" },
				} as object)}
				status="complete"
			/>
		);
		expect(markup).toContain('data-slot="agent-thinking"');
		expect(markup).toContain('data-status="complete"');
		expect(markup).not.toContain("custom");
		expect(markup).not.toContain('role="log"');
		expect(markup).not.toContain("color:red");
	});
});
