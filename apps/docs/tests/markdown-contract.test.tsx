import { type ComponentType, createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Markdown,
	type MarkdownProps,
	markdownComponents,
} from "../../../packages/ui/src/components/markdown/markdown";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const MARKDOWN_ROOT = /^<div [^>]*data-slot="markdown"/u;
const NOTES_ROOT = /^<div [^>]*id="notes"/u;

type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type HasRef<T> = "ref" extends keyof T ? true : false;
type MarkdownContract = [
	Rejects<
		MarkdownProps,
		"className" | "data-slot" | "dangerouslySetInnerHTML" | "role" | "style"
	>,
	"children" extends keyof MarkdownProps ? true : false,
	"id" extends keyof MarkdownProps ? true : false,
	HasRef<MarkdownProps>,
];
const contract: MarkdownContract = [true, true, true, true];
const UnsafeMarkdown = Markdown as ComponentType<Record<string, unknown>>;

// The documented consumer setup: any parser, Mizen's element map.
function MarkdownDocument({ id, source }: { id: string; source: string }) {
	return (
		<Markdown id={id}>
			<ReactMarkdown
				components={markdownComponents}
				remarkPlugins={[remarkGfm]}
				remarkRehypeOptions={{ clobberPrefix: `${id}-` }}
				skipHtml
			>
				{source}
			</ReactMarkdown>
		</Markdown>
	);
}

describe("Markdown contract", () => {
	it("renders semantic CommonMark and GFM elements", () => {
		const markup = renderToStaticMarkup(
			<MarkdownDocument
				id="notes"
				source={
					"# Notes\n\nA **clear** paragraph.\n\n- [x] Ready\n- [ ] Next\n\n| Name | Count |\n| --- | ---: |\n| Alpha | 3 |\n\n```\nconst value = 1;\n```"
				}
			/>
		);

		expect(markup).toMatch(MARKDOWN_ROOT);
		expect(markup).toMatch(NOTES_ROOT);
		expect(markup).toContain('<h1 data-slot="markdown-heading"');
		expect(markup).toContain('<p data-slot="markdown-paragraph"');
		expect(markup).toContain("<strong>clear</strong>");
		expect(markup).toContain('data-slot="markdown-task"');
		expect(markup).toContain('aria-label="Task completed"');
		expect(markup).toContain('aria-label="Task not completed"');
		expect(markup).toContain('aria-label="Markdown table"');
		expect(markup).toContain("<table");
		expect(markup).toContain("<th");
		expect(markup).toContain("<td");
		expect(markup).toContain(
			'<pre aria-label="Code block" data-slot="code-block-content" role="region" tabindex="0"><code>'
		);
		expect(markup).toContain("<code>const value = 1;\n</code>");
		expect(contract.every(Boolean)).toBe(true);
	});

	it("ignores raw HTML and blocks unsafe links with the documented setup", () => {
		const markup = renderToStaticMarkup(
			<MarkdownDocument
				id="unsafe-link"
				source={
					'<script>alert("unsafe")</script>\n\n[bad](javascript:alert%281%29) ![bad image](javascript:alert%281%29)'
				}
			/>
		);

		expect(markup).not.toContain("<script");
		expect(markup).not.toContain("alert");
		expect(markup).not.toContain("javascript:");
		expect(markup).not.toContain('src=""');
	});

	it("keeps root semantics and styles owned at runtime", () => {
		const hostileProps: Record<string, unknown> = {};
		Reflect.set(hostileProps, "dangerouslySetInnerHTML", {
			__html: "<script>unsafe()</script>",
		});
		const markup = renderToStaticMarkup(
			h(
				UnsafeMarkdown,
				Object.assign(hostileProps, {
					className: "unsafe",
					"data-slot": "wrong",
					id: "notes",
					role: "note",
					style: { color: "red" },
				}),
				"Safe text"
			)
		);

		expect(markup).toContain('data-slot="markdown"');
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain('data-slot="wrong"');
		expect(markup).not.toContain('role="note"');
		expect(markup).not.toContain("style=");
	});

	// remark-rehype never prefixes its footnote label ID, so two footnoted
	// documents on one page share it; references and items stay scoped.
	it("scopes GFM footnote references and items to each document", () => {
		const source = "A note[^1].\n\n[^1]: Footnote text.";
		const markup = renderToStaticMarkup(
			<>
				<MarkdownDocument id="first-article" source={source} />
				<MarkdownDocument id="second-article" source={source} />
			</>
		);

		expect(markup).toContain('id="first-article-fn-1"');
		expect(markup).toContain('id="second-article-fn-1"');
		expect(markup).toContain('href="#first-article-fn-1"');
		expect(markup).toContain('href="#second-article-fn-1"');
	});
});
