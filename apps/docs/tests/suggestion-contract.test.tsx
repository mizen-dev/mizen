// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	Suggestion,
	Suggestions,
} from "../../../packages/ui/src/components/suggestion/suggestion";

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

describe("Suggestion", () => {
	it("renders a named group of buttons labeled by their prompts", () => {
		const root = render(
			renderToStaticMarkup(
				<Suggestions>
					<Suggestion suggestion="Fix the failing build" />
					<Suggestion
						icon={<svg aria-label="Bug" />}
						suggestion="Write tests for the form"
					/>
				</Suggestions>
			)
		);
		const group = root.querySelector('[role="group"]');
		expect(group?.getAttribute("aria-label")).toBe("Suggestions");
		const buttons = [...root.querySelectorAll("button")];
		expect(buttons.map((button) => button.textContent)).toEqual([
			"Fix the failing build",
			"Write tests for the form",
		]);
		expect(buttons.every((button) => button.type === "button")).toBe(true);
		// The icon is decoration; the prompt alone names the button.
		expect(
			buttons[1]?.querySelector("[aria-hidden='true'] svg")
		).not.toBeNull();
	});

	it("disables a suggestion natively", () => {
		const root = render(
			renderToStaticMarkup(<Suggestion disabled suggestion="Fix it" />)
		);
		expect(root.querySelector("button")?.disabled).toBe(true);
	});
});
