// @vitest-environment happy-dom
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Diagram,
	type DiagramProps,
} from "../../../packages/ui/src/components/diagram/diagram";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));
const source = "flowchart LR\n A[Draft] --> B[Review]";
const render = (props: Partial<DiagramProps> = {}) =>
	renderToStaticMarkup(
		h(Diagram, { "aria-label": "Approval workflow", source, ...props })
	);

describe("Diagram contract", () => {
	it("requires an accessible name, string source, and a known status", () => {
		expect(() => render({ "aria-label": " " })).toThrow(TypeError);
		expect(() => render({ source: 1 as unknown as string })).toThrow(TypeError);
		expect(() =>
			render({ status: "unknown" as DiagramProps["status"] })
		).toThrow(TypeError);
	});
	it("server-renders a named, deterministic placeholder and an escaped caption", () => {
		const markup = render({
			"aria-description": "Draft moves to review",
			caption: "<script>alert(1)</script>",
		});
		expect(markup).toContain('aria-label="Approval workflow"');
		expect(markup).toContain('aria-description="Draft moves to review"');
		expect(markup).toContain("Rendering diagram");
		expect(markup).toContain("&lt;script&gt;");
		expect(markup).not.toContain('<svg class="pele');
	});
	it("keeps loading, empty, and caller errors distinct", () => {
		expect(render({ status: "loading" })).toContain('aria-busy="true"');
		expect(render({ status: "loading" })).toContain("Loading diagram");
		expect(render({ source: "  " })).toContain("No diagram to show");
		expect(render({ status: "error" })).toContain("load this diagram");
	});
	it("protects the frame, markup, and styling contract at runtime", () => {
		const markup = render({
			className: "injected",
			dangerouslySetInnerHTML: { __html: "<script>injected</script>" },
			"data-slot": "other",
			role: "button",
			style: { color: "red" },
		} as unknown as Partial<DiagramProps>);
		expect(markup).toContain('data-slot="diagram"');
		expect(markup).not.toContain("injected");
		expect(markup).not.toContain('role="button"');
	});
});
