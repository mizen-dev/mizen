// @vitest-environment happy-dom

import NextLink from "next/link";
import type { ComponentPropsWithRef, ComponentType } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	Link,
	type LinkProps,
} from "../../../packages/ui/src/components/link/link";

const propsSpy = vi.hoisted(() => vi.fn(() => ({})));

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: propsSpy,
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type RequiredProp<T, K extends keyof T> =
	Record<string, never> extends Pick<T, K> ? false : true;
type HasRef<T> = "ref" extends keyof T ? true : false;
type Contract = [
	Rejects<LinkProps, "className" | "data-slot" | "role" | "style">,
	RequiredProp<LinkProps, "href">,
	RequiredProp<LinkProps, "children">,
	HasRef<LinkProps>,
	"target" extends keyof LinkProps ? true : false,
	"href" extends keyof ComponentPropsWithRef<"a"> ? true : false,
];
const contract: Contract = [true, false, true, true, true, true];
const UnsafeLink = Link as ComponentType<Record<string, unknown>>;
function renderCallback(attributes: ComponentPropsWithRef<"a">) {
	return <a {...attributes} href="/callback" />;
}

describe("Link contract", () => {
	it("renders a native anchor with ordinary link semantics", () => {
		const markup = renderToStaticMarkup(
			<Link href="/projects" rel="noreferrer" target="_blank">
				View projects
			</Link>
		);

		expect(markup).toContain('href="/projects"');
		expect(markup).toContain('data-slot="link"');
		expect(markup).toContain('rel="noreferrer"');
		expect(markup).toContain('target="_blank"');
		expect(markup).toContain(">View projects</a>");
		expect(propsSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				textDecorationLine: "underline",
				textDecorationThickness: expect.objectContaining({
					":active": "0.16em",
				}),
				textUnderlineOffset: "0.25em",
			})
		);
		expect(contract).toEqual([true, false, true, true, true, true]);
	});

	it("protects the anchor role, slot, and styles from runtime overrides", () => {
		const markup = renderToStaticMarkup(
			h(
				UnsafeLink,
				{
					className: "unsafe",
					"data-slot": "unsafe",
					href: "/projects",
					role: "button",
					style: { color: "red" },
				},
				"Open project"
			)
		);

		expect(markup).toContain('data-slot="link"');
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain("role=");
		expect(markup).not.toContain("style=");
	});

	it("rejects a missing href at runtime", () => {
		expect(() =>
			renderToStaticMarkup(h(UnsafeLink, {}, "No destination"))
		).toThrow(TypeError);
	});
	it("composes a Next.js link without requiring a duplicate href", () => {
		const markup = renderToStaticMarkup(
			<Link render={<NextLink href="/projects" prefetch={false} />}>
				Projects
			</Link>
		);
		expect(markup).toContain('href="/projects"');
		expect(markup.match(/<a /g)).toHaveLength(1);
		expect(markup).not.toContain("render=");
	});

	it("forwards refs and merges custom link handlers while preserving the slot", () => {
		Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
		const container = document.body.appendChild(document.createElement("div"));
		const root = createRoot(container);
		const ref = createRef<HTMLAnchorElement>();
		const parentClick = vi.fn();
		const childClick = vi.fn();
		act(() =>
			root.render(
				<Link
					onClick={parentClick}
					ref={ref}
					render={<a data-slot="wrong" href="/projects" onClick={childClick} />}
				>
					Projects
				</Link>
			)
		);
		const anchor = container.querySelector("a");
		expect(ref.current).toBe(anchor);
		expect(anchor?.getAttribute("href")).toBe("/projects");
		expect(anchor?.getAttribute("data-slot")).toBe("link");
		act(() =>
			anchor?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
		);
		expect(parentClick).toHaveBeenCalledOnce();
		expect(childClick).toHaveBeenCalledOnce();
		act(() => root.unmount());
		container.remove();
	});

	it("accepts render callbacks", () => {
		const markup = renderToStaticMarkup(
			<Link render={renderCallback}>Callback destination</Link>
		);
		expect(markup).toContain('href="/callback"');
		expect(markup).toContain('data-slot="link"');
	});
});
