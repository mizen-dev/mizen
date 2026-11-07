// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	QuestionCard,
	type QuestionCardQuestion,
} from "../../../packages/ui/src/components/question-card/question-card";

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

const questions: QuestionCardQuestion[] = [
	{
		id: "store",
		options: [{ label: "Postgres" }, { description: "Fast.", label: "Redis" }],
		title: "Which store?",
	},
	{
		id: "places",
		multiple: true,
		options: [{ label: "Sidebar" }, { label: "Grid" }],
		other: false,
		title: "Where first?",
	},
];

describe("QuestionCard contract", () => {
	it("asks the first question as a named group with numbered options", () => {
		const root = render(
			renderToStaticMarkup(
				<QuestionCard questions={questions} status="pending" />
			)
		);
		const group = root.querySelector("fieldset");
		const title = root.querySelector(
			`#${CSS.escape(group?.getAttribute("aria-labelledby") ?? "")}`
		);
		expect(title?.textContent).toBe("Which store?");
		expect(root.textContent).toContain("1 of 2");
		const options = root.querySelectorAll('[data-slot="question-card-option"]');
		expect([...options].map((option) => option.textContent)).toEqual([
			"Postgres1",
			"RedisFast.2",
		]);
		expect(
			[...root.querySelectorAll("[aria-keyshortcuts]")].map((control) =>
				control.getAttribute("aria-keyshortcuts")
			)
		).toEqual(["1", "2"]);
		// Something else is on by default.
		expect(
			root
				.querySelector(
					'[data-slot="question-card-other"] input:not([type="radio"])'
				)
				?.getAttribute("aria-label")
		).toBe("Your own answer");
		expect(
			[...root.querySelectorAll("button")]
				.map((button) => button.textContent)
				.slice(-2)
		).toEqual(["Skip", "Next"]);
	});

	it("folds one answered question into the question and its answer", () => {
		const root = render(
			renderToStaticMarkup(
				<QuestionCard
					answers={{ store: ["Redis"] }}
					questions={questions.slice(0, 1)}
					status="answered"
				/>
			)
		);
		expect(root.querySelector("fieldset")).toBeNull();
		expect(root.querySelector("button")?.textContent).toBe(
			"Which store? · Redis"
		);
		expect(
			root.querySelector('[data-slot="question-card-status"]')?.textContent
		).toBe("Answered");
	});

	it("counts answered questions when there are several", () => {
		const root = render(
			renderToStaticMarkup(
				<QuestionCard
					answers={{ places: [], store: ["Redis"] }}
					questions={questions}
					status="answered"
				/>
			)
		);
		expect(root.querySelector("button")?.textContent).toBe(
			"Answered 1 of 2 questions"
		);
	});
});
