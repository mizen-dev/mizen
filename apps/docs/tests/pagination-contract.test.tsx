// @vitest-environment happy-dom

import type { ComponentProps, HTMLAttributes } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Pagination,
	PaginationContent,
	type PaginationContentProps,
	PaginationEllipsis,
	type PaginationEllipsisProps,
	PaginationItem,
	type PaginationItemProps,
	PaginationLink,
	type PaginationLinkProps,
	PaginationNext,
	PaginationPrevious,
	type PaginationProps,
} from "../../../packages/ui/src/components/pagination/pagination";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type Omitted = "className" | "data-slot" | "role" | "style";
type ClosedContract = [
	RejectsAll<PaginationProps, Omitted>,
	Accepts<PaginationProps, "aria-label">,
	RejectsAll<PaginationContentProps, Omitted>,
	RejectsAll<PaginationItemProps, Omitted>,
	RejectsAll<PaginationLinkProps, Omitted>,
	Accepts<PaginationLinkProps, "disabled" | "active" | "render" | "size">,
	RejectsAll<PaginationEllipsisProps, Omitted>,
];
const contractChecks: ClosedContract = [
	true,
	true,
	true,
	true,
	true,
	true,
	true,
];

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		container,
		unmount: () => act(() => root.unmount()),
	};
}

function LocalLink({ href, children, ...rest }: ComponentProps<"a">) {
	return h("a", { ...rest, href }, children);
}

describe("Pagination contract and navigation semantics", () => {
	it("exposes the compositional API and renders native navigation semantics", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/pagination/pagination"
		);
		expect(Object.keys(mod).sort()).toEqual([
			"Pagination",
			"PaginationContent",
			"PaginationEllipsis",
			"PaginationItem",
			"PaginationLink",
			"PaginationNext",
			"PaginationPrevious",
		]);
		expect(contractChecks.every(Boolean)).toBe(true);

		const markup = renderToStaticMarkup(
			h(
				Pagination,
				null,
				h(
					PaginationContent,
					null,
					h(
						PaginationItem,
						null,
						h(PaginationPrevious, { disabled: true, href: "/page/1" })
					),
					h(PaginationItem, null, h(PaginationLink, { href: "/page/2" }, "2")),
					h(
						PaginationItem,
						null,
						h(PaginationLink, { active: true, href: "/page/3" }, "3")
					),
					h(PaginationItem, null, h(PaginationEllipsis)),
					h(PaginationItem, null, h(PaginationNext, { href: "/page/4" }))
				)
			)
		);
		expect(markup).toContain(
			'<nav aria-label="Pagination" data-slot="pagination"'
		);
		expect(markup).toContain("<ul");
		expect(markup).toContain('data-slot="pagination-item"');
		expect(markup).toContain('aria-current="page"');
		expect(markup).toContain('aria-label="Go to previous page"');
		expect(markup).toContain('aria-label="Go to next page"');
		expect(markup).toContain('aria-disabled="true"');
		expect(markup).toContain('tabindex="-1"');
		expect(markup).not.toContain('href="/page/1"');
		expect(markup).toContain("More pages");
	});

	it("supports framework links and protects runtime host props", () => {
		const markup = renderToStaticMarkup(
			h(
				Pagination,
				{
					"aria-label": "Results pages",
					className: "bad",
					"data-slot": "bad",
					role: "main",
					style: { color: "red" },
				} as HTMLAttributes<HTMLElement>,
				h(
					PaginationContent,
					null,
					h(
						PaginationItem,
						null,
						h(
							PaginationLink,
							{
								href: "/right",
								render: h(LocalLink, {
									href: "/wrong",
								}),
							},
							"Go"
						)
					),
					h(
						PaginationItem,
						null,
						h(PaginationLink, {
							className: "bad",
							"data-slot": "bad",
							href: "/safe",
							role: "button",
							style: { color: "red" },
						} as PaginationLinkProps)
					),
					h(
						PaginationItem,
						null,
						h(PaginationNext, {
							disabled: true,
							href: "/must-not-leak",
							render: h(LocalLink, { href: "/must-not-leak" }),
						})
					)
				)
			)
		);
		expect(markup).toContain('aria-label="Results pages"');
		expect(markup).toContain('href="/wrong"');
		expect(markup).toContain('data-slot="pagination-link"');
		expect(markup).not.toContain("bad");
		expect(markup).not.toContain('role="main"');
		expect(markup).not.toContain('role="button"');
		expect(markup).not.toContain("must-not-leak");
		expect(markup).not.toContain("style=");
	});

	it("blocks click and keyboard handlers on disabled links", () => {
		const onClick = vi.fn();
		const onKeyDown = vi.fn();
		const { container, unmount } = mount(
			h(PaginationLink, {
				disabled: true,
				href: "/must-not-navigate",
				onClick,
				onKeyDown,
			})
		);
		const link = container.querySelector("a");
		expect(link).not.toBeNull();
		const click = new MouseEvent("click", { bubbles: true, cancelable: true });
		const auxClick = new MouseEvent("auxclick", {
			bubbles: true,
			button: 1,
			cancelable: true,
		});
		const key = new KeyboardEvent("keydown", {
			bubbles: true,
			cancelable: true,
			key: "Enter",
		});
		link?.dispatchEvent(click);
		link?.dispatchEvent(key);
		link?.dispatchEvent(auxClick);
		const tab = new KeyboardEvent("keydown", {
			bubbles: true,
			cancelable: true,
			key: "Tab",
		});
		link?.dispatchEvent(tab);
		expect(tab.defaultPrevented).toBe(false);
		expect(click.defaultPrevented).toBe(true);
		expect(key.defaultPrevented).toBe(true);
		expect(auxClick.defaultPrevented).toBe(true);
		expect(onClick).not.toHaveBeenCalled();
		expect(onKeyDown).not.toHaveBeenCalled();
		unmount();
	});

	it("preserves render-only hrefs and invokes enabled handlers once", () => {
		const onClick = vi.fn();
		const ref = createRef<HTMLAnchorElement>();
		const renderRef = createRef<HTMLAnchorElement>();
		const { container, unmount } = mount(
			h(
				PaginationLink,
				{
					active: true,
					onClick,
					ref,
					render: h(LocalLink, {
						"aria-current": "step",
						"aria-disabled": true,
						href: "/page/2",
						ref: renderRef,
					}),
				},
				"2"
			)
		);
		const link = container.querySelector("a");
		expect(link?.getAttribute("href")).toBe("/page/2");
		expect(link?.getAttribute("aria-current")).toBe("page");
		expect(link?.hasAttribute("aria-disabled")).toBe(false);
		expect(ref.current).toBe(link);
		expect(renderRef.current).toBe(link);
		link?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onClick).toHaveBeenCalledTimes(1);
		unmount();
	});
});
