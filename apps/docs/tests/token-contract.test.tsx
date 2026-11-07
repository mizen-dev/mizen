// @vitest-environment happy-dom
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	Token,
	type TokenProps,
} from "../../../packages/ui/src/components/token/token";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	defineConsts: <T extends object>(s: T): T => s,
	defineMarker: () => ({}),
	defineVars: <T extends object>(s: T): T => s,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

describe("Token contract", () => {
	it("preserves native refs and separates activation from removal", () => {
		const activate = vi.fn();
		const remove = vi.fn();
		const ref = createRef<HTMLSpanElement>();
		const container = document.body.appendChild(document.createElement("div"));
		const root = createRoot(container);
		act(() =>
			root.render(
				h(Token, { label: "Maya", onClick: activate, onRemove: remove, ref })
			)
		);
		expect(ref.current?.dataset.slot).toBe("token");
		const buttons = container.querySelectorAll("button");
		expect(buttons.length).toBe(2);
		expect(container.querySelector("button button")).toBeNull();
		act(() => buttons[1]?.click());
		expect(remove).toHaveBeenCalledOnce();
		expect(activate).not.toHaveBeenCalled();
		act(() => buttons[0]?.click());
		expect(activate).toHaveBeenCalledOnce();
		act(() =>
			root.render(
				h(Token, {
					disabled: true,
					label: "Maya",
					onClick: activate,
					onRemove: remove,
				})
			)
		);
		expect(
			[...container.querySelectorAll("button")].every(
				(button) => button.disabled
			)
		).toBe(true);
		act(() => root.unmount());
		container.remove();
	});
	it("keeps links native, disabled links inert, and actions named", () => {
		const enabled = renderToStaticMarkup(
			h(Token, { href: "/review", label: "Review", onRemove: vi.fn() })
		);
		const disabled = renderToStaticMarkup(
			h(Token, { disabled: true, href: "/review", label: "Review" })
		);
		const action = renderToStaticMarkup(
			h(Token, {
				"aria-description": "Opens the profile",
				label: "Maya",
				onClick: vi.fn(),
			})
		);
		expect(enabled).toContain('href="/review"');
		expect(enabled).not.toContain("<button><a");
		expect(disabled).not.toContain('href="/review"');
		expect(disabled).toContain('aria-disabled="true"');
		expect(action).toContain('aria-label="Maya"');
		expect(action).toContain('aria-description="Opens the profile"');
	});
	it("requires labels and protects closed styling", () => {
		expect(() => renderToStaticMarkup(h(Token, { label: " " }))).toThrow(
			TypeError
		);
		const markup = renderToStaticMarkup(
			h(Token, {
				className: "bad",
				color: "purple",
				"data-slot": "bad",
				label: "Review",
				style: { display: "none" },
			} as unknown as TokenProps)
		);
		expect(markup).toContain('data-slot="token"');
		expect(markup).not.toContain("bad");
		expect(markup).not.toContain("display:none");
	});
});
