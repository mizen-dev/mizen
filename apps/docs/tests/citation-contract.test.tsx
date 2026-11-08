// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Citation,
	type CitationProps,
} from "../../../packages/ui/src/components/citation/citation";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<T, K extends PropertyKey> = K extends keyof T ? false : true;
type HasRef<T> = "ref" extends keyof T ? true : false;
type CitationContract = [
	Rejects<CitationProps, "className">,
	Rejects<CitationProps, "style">,
	Rejects<CitationProps, "role">,
	Rejects<CitationProps, "data-slot">,
	HasRef<CitationProps>,
	Record<string, never> extends Pick<CitationProps, "children"> ? false : true,
];
const citationContract: CitationContract = [true, true, true, true, true, true];

describe("Citation contract", () => {
	it("renders native citation semantics and allows ordinary inline content", () => {
		const markup = renderToStaticMarkup(
			<p>
				Source: <Citation>Research paper</Citation>
			</p>
		);

		expect(markup).toContain(
			'<cite data-slot="citation">Research paper</cite>'
		);
		expect(citationContract.every(Boolean)).toBe(true);
	});

	it("strips runtime overrides", () => {
		const markup = renderToStaticMarkup(
			Reflect.apply(Citation, undefined, [
				{
					children: "Work title",
					className: "unsafe",
					"data-slot": "unsafe",
					role: "link",
					style: { color: "red" },
				},
			])
		);

		expect(markup).toContain('<cite data-slot="citation">Work title</cite>');
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain('role="link"');
		expect(markup).not.toContain("style=");
	});
});
