// @vitest-environment happy-dom

import { act, type ComponentType, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	CodeBlock,
	CodeBlockContent,
	type CodeBlockContentProps,
	CodeBlockCopy,
	type CodeBlockCopyProps,
	CodeBlockHeader,
	type CodeBlockHeaderProps,
	type CodeBlockProps,
	CodeBlockTitle,
	type CodeBlockTitleProps,
} from "../../../packages/ui/src/components/code-block/code-block";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type HasRef<T> = "ref" extends keyof T ? true : false;
type Required<T, K extends keyof T> =
	Record<string, never> extends Pick<T, K> ? false : true;
type CodeBlockContract = [
	Rejects<CodeBlockProps, "className" | "data-slot" | "role" | "style">,
	Rejects<CodeBlockHeaderProps, "className" | "data-slot" | "role" | "style">,
	Rejects<CodeBlockTitleProps, "className" | "data-slot" | "role" | "style">,
	Rejects<
		CodeBlockContentProps,
		"className" | "data-slot" | "role" | "style" | "tabIndex"
	>,
	Rejects<CodeBlockCopyProps, "className" | "data-slot" | "role" | "style">,
	Required<CodeBlockProps, "children">,
	Required<CodeBlockHeaderProps, "children">,
	Required<CodeBlockTitleProps, "children">,
	Required<CodeBlockContentProps, "aria-label" | "children">,
	Required<CodeBlockCopyProps, "code">,
	HasRef<CodeBlockProps>,
	HasRef<CodeBlockHeaderProps>,
	HasRef<CodeBlockTitleProps>,
	HasRef<CodeBlockContentProps>,
	HasRef<CodeBlockCopyProps>,
];
const contract: CodeBlockContract = [
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
	true,
	true,
	true,
	true,
];

const UnsafeCodeBlock = CodeBlock as ComponentType<Record<string, unknown>>;
const UnsafeCodeBlockContent = CodeBlockContent as ComponentType<
	Record<string, unknown>
>;

describe("CodeBlock contract", () => {
	it("renders a figure caption and a named, focusable native code region", () => {
		const markup = renderToStaticMarkup(
			<CodeBlock>
				<CodeBlockHeader>
					<CodeBlockTitle>Install command</CodeBlockTitle>
					<CodeBlockCopy code="pnpm install" />
				</CodeBlockHeader>
				<CodeBlockContent aria-label="Install command">
					pnpm install
				</CodeBlockContent>
			</CodeBlock>
		);

		expect(markup).toContain('<figure data-slot="code-block"');
		expect(markup).toContain('<figcaption data-slot="code-block-header"');
		expect(markup).toContain(
			'<span data-slot="code-block-title">Install command</span>'
		);
		expect(markup).toContain(
			'<pre aria-label="Install command" data-slot="code-block-content" role="region" tabindex="0">'
		);
		expect(markup).toContain("<code>pnpm install</code>");
		expect(markup).toContain('data-slot="code-block-copy-status"');
		expect(contract.every(Boolean)).toBe(true);
	});

	it("rejects an empty scroll-region accessible name", () => {
		const renderWithName = (name: string) =>
			renderToStaticMarkup(
				h(UnsafeCodeBlockContent, { "aria-label": name }, "code")
			);
		expect(() => renderWithName("")).toThrow(TypeError);
		expect(() => renderWithName("   ")).toThrow(TypeError);
	});

	it("protects component-owned roles, slots, and styles from runtime overrides", () => {
		const markup = renderToStaticMarkup(
			<UnsafeCodeBlock
				className="unsafe"
				data-slot="wrong-block"
				role="note"
				style={{ color: "red" }}
			>
				<UnsafeCodeBlockContent
					aria-label="Source"
					className="unsafe"
					data-slot="wrong-content"
					role="article"
					style={{ color: "red" }}
					tabIndex={-1}
				>
					const ready = true;
				</UnsafeCodeBlockContent>
			</UnsafeCodeBlock>
		);

		expect(markup).toContain('data-slot="code-block"');
		expect(markup).toContain('data-slot="code-block-content"');
		expect(markup).toContain('role="region"');
		expect(markup).toContain('tabindex="0"');
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain("wrong-");
		expect(markup).not.toContain('role="note"');
		expect(markup).not.toContain('role="article"');
		expect(markup).not.toContain("style=");
	});

	it("keeps clipboard feedback tied to the current source", async () => {
		let rejectOldRequest: (reason?: unknown) => void = () => undefined;
		const writeText = vi.fn((code: string) => {
			if (code === "old source") {
				return new Promise<void>((_resolve, reject) => {
					rejectOldRequest = reject;
				});
			}
			return Promise.resolve();
		});
		const originalClipboard = Object.getOwnPropertyDescriptor(
			navigator,
			"clipboard"
		);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText },
		});
		const container = document.body.appendChild(document.createElement("div"));
		const root = createRoot(container);

		try {
			act(() => root.render(<CodeBlockCopy code="old source" />));
			const button = container.querySelector("button");
			if (!button) {
				throw new Error("Expected a code copy button");
			}
			await act(async () => button.click());
			act(() => root.render(<CodeBlockCopy code="new source" />));
			await act(async () => {
				button.click();
				await Promise.resolve();
			});
			expect(writeText).toHaveBeenNthCalledWith(1, "old source");
			expect(writeText).toHaveBeenNthCalledWith(2, "new source");
			const status = container.querySelector(
				'[data-slot="code-block-copy-status"]'
			);
			expect(status?.textContent).toBe("Copied");
			await act(async () => {
				rejectOldRequest(new Error("Clipboard denied"));
				await Promise.resolve();
			});
			expect(status?.textContent).toBe("Copied");
		} finally {
			act(() => root.unmount());
			container.remove();
			if (originalClipboard) {
				Object.defineProperty(navigator, "clipboard", originalClipboard);
			} else {
				Reflect.deleteProperty(navigator, "clipboard");
			}
		}
	});
});
