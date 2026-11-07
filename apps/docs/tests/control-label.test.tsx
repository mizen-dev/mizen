import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { controlLabel } from "../../../packages/ui/src/control-label";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

it("trims text inside fragments while preserving icons, rich markup, and zero", () => {
	const children = createElement(
		Fragment,
		null,
		createElement("svg", { "aria-hidden": true }),
		"Save",
		0,
		createElement("strong", null, "draft")
	);
	expect(
		renderToStaticMarkup(
			createElement("button", { type: "button" }, controlLabel(children))
		)
	).toBe(
		'<button type="button"><svg aria-hidden="true"></svg><span>Save0</span><strong>draft</strong></button>'
	);
});
