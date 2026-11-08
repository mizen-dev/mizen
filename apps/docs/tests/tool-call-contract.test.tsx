// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { ToolCall } from "../../../packages/ui/src/components/tool-call/tool-call";
import { ToolCallGroup } from "../../../packages/ui/src/components/tool-call/tool-call-group";
import { formatShortSeconds } from "../../../packages/ui/src/use-elapsed";

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

describe("ToolCall contract", () => {
	it("shows a running call as a closed line with a hidden status", () => {
		const root = render(
			renderToStaticMarkup(
				<ToolCall
					input={{ query: "x" }}
					name="search_docs"
					status="running"
					title="Searching the docs"
				/>
			)
		);
		const call = root.querySelector('[data-slot="tool-call"]');
		expect(call?.getAttribute("data-status")).toBe("running");
		const row = root.querySelector("button");
		expect(row?.getAttribute("aria-expanded")).toBe("false");
		expect(row?.textContent).toBe("Searching the docssearch_docsRunning");
		expect(
			row?.querySelector('[data-slot="spinner"]')?.getAttribute("aria-hidden")
		).toBe("true");
	});

	it("opens on its own for an approval, with each button only when handled", () => {
		const root = render(
			renderToStaticMarkup(
				<ToolCall name="create_issue" onApprove={noop} status="approval" />
			)
		);
		expect(root.querySelector("button")?.getAttribute("aria-expanded")).toBe(
			"true"
		);
		const approval = root.querySelector('[data-slot="tool-call-approval"]');
		expect(
			[...(approval?.querySelectorAll("button") ?? [])].map(
				(button) => button.textContent
			)
		).toEqual(["Approve"]);
	});

	it("opens on its own for an error, with its message and Retry", () => {
		const root = render(
			renderToStaticMarkup(
				<ToolCall
					duration={8}
					error="Timed out."
					name="fetch_page"
					onRetry={noop}
					status="error"
				/>
			)
		);
		expect(root.querySelector("button")?.textContent).toBe(
			"fetch_pageFailed8s"
		);
		const error = root.querySelector('[data-slot="tool-call-error"]');
		expect(error?.textContent).toBe("Timed out.Retry");
	});

	it("shows a finished call's time and a hidden Done", () => {
		const root = render(
			renderToStaticMarkup(
				<ToolCall duration={1.24} name="fetch_page" status="complete" />
			)
		);
		expect(root.querySelector("button")?.textContent).toBe(
			"fetch_page1.2sDone"
		);
	});

	it("shows arguments as JSON and a text result as is", () => {
		const root = render(
			renderToStaticMarkup(
				<ToolCall
					input={{ url: "https://web.dev" }}
					name="fetch_page"
					output="Plain text"
					status="error"
				/>
			)
		);
		expect(root.querySelector('[aria-label="Arguments"]')?.textContent).toBe(
			'{\n  "url": "https://web.dev"\n}'
		);
		expect(root.querySelector('[aria-label="Result"]')?.textContent).toBe(
			"Plain text"
		);
	});

	it("rounds short times to tenths and longer ones to whole seconds", () => {
		expect(formatShortSeconds(0.01)).toBe("0.1s");
		expect(formatShortSeconds(2.66)).toBe("2.7s");
		expect(formatShortSeconds(12.4)).toBe("12s");
	});
});

describe("ToolCallGroup contract", () => {
	it("says Using tools while any call works or waits", () => {
		const root = render(
			renderToStaticMarkup(
				<ToolCallGroup
					calls={[
						{ id: "1", name: "a", status: "complete" },
						{ id: "2", name: "b", status: "approval" },
					]}
				/>
			)
		);
		const group = root.querySelector('[data-slot="tool-call-group"]');
		expect(group?.getAttribute("data-status")).toBe("running");
		expect(root.querySelector("button")?.textContent).toBe("Using tools…");
		expect(root.querySelector("button")?.getAttribute("aria-expanded")).toBe(
			"true"
		);
		expect(root.querySelectorAll('[data-slot="tool-call"]')).toHaveLength(2);
	});

	it("sums up the calls, failures, and time once they settle", () => {
		const root = render(
			renderToStaticMarkup(
				<ToolCallGroup
					calls={[
						{ id: "1", name: "a", status: "complete" },
						{ id: "2", name: "b", status: "error" },
						{ id: "3", name: "c", status: "denied" },
					]}
					duration={2.7}
				/>
			)
		);
		expect(root.querySelector("button")?.textContent).toBe(
			"Used 3 tools · 1 failed · 2.7s"
		);
		// Once every call settles, the group folds into its summary.
		expect(root.querySelector("button")?.getAttribute("aria-expanded")).toBe(
			"false"
		);
	});
});
