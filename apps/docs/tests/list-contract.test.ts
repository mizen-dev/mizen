// @vitest-environment happy-dom

import type { ComponentPropsWithRef } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	List,
	ListActions,
	type ListActionsProps,
	ListContent,
	type ListContentProps,
	ListItem,
	type ListItemProps,
	type ListProps,
} from "../../../packages/ui/src/components/list/list";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Closed<P, E extends "ul" | "li" | "div"> = Exact<
	Exclude<keyof ComponentPropsWithRef<E>, keyof P>,
	"className" | "role" | "style"
>;
type Valid = [true, true, true, true];

const contractChecks = [
	true satisfies Exact<Closed<ListProps, "ul">, true>,
	true satisfies Exact<Closed<ListItemProps, "li">, true>,
	true satisfies Exact<Closed<ListContentProps, "div">, true>,
	true satisfies Exact<Closed<ListActionsProps, "div">, true>,
] as const satisfies Valid;

function requiredElement(root: ParentNode, selector: string): Element {
	const element = root.querySelector(selector);
	if (!element) {
		throw new Error(`Expected ${selector} in rendered List`);
	}
	return element;
}

describe("List contract and semantics", () => {
	it("keeps closed native prop contracts", () => {
		expect(contractChecks.every(Boolean)).toBe(true);
	});

	it("renders native list structure with stable slots and an accessible list role", () => {
		const markup = renderToStaticMarkup(
			h(
				List,
				{
					"aria-label": "Recent files",
					className: "injected-class",
					"data-slot": "injected-list",
					id: "recent-files",
					role: "menu",
					style: { color: "red" },
				} as unknown as ListProps,
				h(
					ListItem,
					{
						className: "injected-item",
						"data-slot": "injected-item",
						id: "file-row",
						role: "presentation",
						style: { color: "red" },
					} as unknown as ListItemProps,
					h(
						ListContent,
						{
							className: "injected-content",
							"data-slot": "injected-content",
							id: "file-content",
							role: "presentation",
							style: { color: "red" },
						} as unknown as ListContentProps,
						"Quarterly report"
					),
					h(
						ListActions,
						{
							className: "injected-actions",
							"data-slot": "injected-actions",
							role: "presentation",
							style: { color: "red" },
						} as unknown as ListActionsProps,
						h("button", { type: "button" }, "Open")
					)
				)
			)
		);
		const container = document.createElement("div");
		container.innerHTML = markup;
		const list = requiredElement(container, "ul[data-slot='list']");
		const item = requiredElement(container, "li[data-slot='list-item']");
		const content = requiredElement(container, "[data-slot='list-content']");
		const actions = requiredElement(container, "[data-slot='list-actions']");

		expect(list.getAttribute("role")).toBe("list");
		expect(list.getAttribute("data-slot")).toBe("list");
		expect(list.className).toBe("");
		expect(list.hasAttribute("style")).toBe(false);
		expect(list.getAttribute("aria-label")).toBe("Recent files");
		expect(list.id).toBe("recent-files");
		expect(item.id).toBe("file-row");
		expect(item.hasAttribute("role")).toBe(false);
		expect(item.getAttribute("data-slot")).toBe("list-item");
		expect(item.className).toBe("");
		expect(item.hasAttribute("style")).toBe(false);
		expect(content.textContent).toBe("Quarterly report");
		expect(content.hasAttribute("role")).toBe(false);
		expect(content.getAttribute("data-slot")).toBe("list-content");
		expect(content.className).toBe("");
		expect(content.hasAttribute("style")).toBe(false);
		expect(actions.hasAttribute("role")).toBe(false);
		expect(actions.getAttribute("data-slot")).toBe("list-actions");
		expect(actions.className).toBe("");
		expect(actions.hasAttribute("style")).toBe(false);
		expect(requiredElement(actions, "button").textContent).toBe("Open");
		expect(container.querySelector("li[role]")).toBeNull();
		expect(container.querySelector("[tabindex]")).toBeNull();
	});
});
