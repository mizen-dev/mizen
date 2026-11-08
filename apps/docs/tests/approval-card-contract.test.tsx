// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { ApprovalCard } from "../../../packages/ui/src/components/approval-card/approval-card";

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

describe("ApprovalCard contract", () => {
	it("asks as a named group with details and each button only when handled", () => {
		const root = render(
			renderToStaticMarkup(
				<ApprovalCard
					description="It can't be unsent."
					details={[{ label: "To", value: "42 people" }]}
					onApprove={noop}
					status="pending"
					title="Send the newsletter"
				/>
			)
		);
		const group = root.querySelector("fieldset");
		const title = root.querySelector(
			`#${CSS.escape(group?.getAttribute("aria-labelledby") ?? "")}`
		);
		expect(title?.textContent).toBe("Send the newsletter");
		expect(root.querySelector("dt")?.textContent).toBe("To");
		expect(root.querySelector("dd")?.textContent).toBe("42 people");
		expect(
			[...root.querySelectorAll("button")].map((button) => button.textContent)
		).toEqual(["Approve"]);
		// Nothing decided yet, so nothing is announced.
		expect(
			root.querySelector('[data-slot="approval-card-status"]')?.textContent
		).toBe("");
	});

	it("offers Always allow only when asked", () => {
		const root = render(
			renderToStaticMarkup(
				<ApprovalCard
					allowAlways
					onApprove={noop}
					status="pending"
					title="Run tests"
				/>
			)
		);
		expect(root.textContent).toContain("Always allow this action");
	});

	it("folds a decision into one line and announces it", () => {
		const root = render(
			renderToStaticMarkup(
				<ApprovalCard automatic status="approved" title="Read your calendar" />
			)
		);
		expect(root.querySelector("fieldset")).toBeNull();
		const line = root.querySelector("button");
		expect(line?.textContent).toBe(
			"Approved automatically · Read your calendar"
		);
		expect(line?.getAttribute("aria-expanded")).toBe("false");
		expect(
			root.querySelector('[data-slot="approval-card-status"]')?.textContent
		).toBe("Approved automatically: Read your calendar");
	});
});
