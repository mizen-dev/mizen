// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	Blockquote,
	BlockquoteAttribution,
	type BlockquoteAttributionProps,
	BlockquoteContent,
	type BlockquoteContentProps,
	type BlockquoteProps,
} from "../../../packages/ui/src/components/blockquote/blockquote";
import { Citation } from "../../../packages/ui/src/components/citation/citation";

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
type RequiredChildren<T extends { children?: ReactNode }> =
	Record<string, never> extends Pick<T, "children"> ? false : true;
type BlockquoteContract = [
	Rejects<BlockquoteProps, "className">,
	Rejects<BlockquoteProps, "style">,
	Rejects<BlockquoteProps, "role">,
	Rejects<BlockquoteContentProps, "data-slot">,
	Rejects<BlockquoteAttributionProps, "className">,
	HasRef<BlockquoteProps>,
	HasRef<BlockquoteContentProps>,
	HasRef<BlockquoteAttributionProps>,
	RequiredChildren<BlockquoteProps>,
	RequiredChildren<BlockquoteContentProps>,
	RequiredChildren<BlockquoteAttributionProps>,
];
const blockquoteContract: BlockquoteContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];

describe("Blockquote contract", () => {
	it("keeps the quotation and attribution in their native semantic elements", () => {
		const markup = renderToStaticMarkup(
			<Blockquote>
				<BlockquoteContent cite="https://example.com/source">
					The quote belongs here.
				</BlockquoteContent>
				<BlockquoteAttribution>
					— Author, <Citation>Book title</Citation>
				</BlockquoteAttribution>
			</Blockquote>
		);

		expect(markup).toContain("<figure");
		expect(markup).toContain('<blockquote cite="https://example.com/source"');
		expect(markup).toContain("<figcaption");
		expect(markup).toContain("<cite");
		expect(markup.indexOf("</blockquote>")).toBeLessThan(
			markup.indexOf("<figcaption")
		);
		expect(blockquoteContract.every(Boolean)).toBe(true);
	});

	it("keeps fixed slots and removes runtime style and role overrides", () => {
		const element = Reflect.apply(Blockquote, undefined, [
			{
				children: "Quote",
				className: "unsafe",
				"data-slot": "unsafe",
				role: "note",
				style: { color: "red" },
			},
		]);
		const markup = renderToStaticMarkup(element);

		expect(markup).toContain('data-slot="blockquote"');
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain('role="note"');
		expect(markup).not.toContain("style=");
	});
});
