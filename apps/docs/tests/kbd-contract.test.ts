// @vitest-environment happy-dom

import type { ComponentPropsWithRef } from "react";
import { act, createRef, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	Kbd,
	KbdGroup,
	type KbdGroupProps,
	type KbdProps,
} from "../../../packages/ui/src/components/kbd/kbd";
import { kbdStyles } from "../../../packages/ui/src/components/kbd/kbd.styles";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const kbdSlotRegex = /^<kbd[^>]*data-slot="kbd"/u;
const kbdGroupSlotRegex = /^<kbd[^>]*data-slot="kbd-group"/u;
const kbdGroupHierarchyRegex =
	/<kbd[^>]*><kbd[^>]*><span>⌘<\/span><\/kbd><kbd[^>]*><span>K<\/span><\/kbd><\/kbd>/u;

const propsSpy = vi.fn((..._args: unknown[]) => ({}));

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: () => "keyframes",
	props: (...args: unknown[]) => propsSpy(...args),
	when: { ancestor: () => ":where(*)" },
}));

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type Closed<P> = Exact<
	Exclude<keyof ComponentPropsWithRef<"kbd">, keyof P>,
	"aria-label" | "aria-labelledby" | "className" | "role" | "style"
>;
type Invented =
	| "keys"
	| "orientation"
	| "render"
	| "separator"
	| "size"
	| "variant";
type Checked<P> = [
	Closed<P>,
	Rejects<
		P,
		| "aria-label"
		| "aria-labelledby"
		| "className"
		| "data-slot"
		| "role"
		| "style"
		| Invented
	>,
	Accepts<P, "ref">,
	Accepts<P, "children">,
];

type Valid = [true, true, true, true];

const contractChecks = [
	true satisfies Exact<Checked<KbdProps>, Valid>,
	true satisfies Exact<Checked<KbdGroupProps>, Valid>,
] as const;

describe("Kbd and KbdGroup contract and semantics", () => {
	beforeEach(() => {
		propsSpy.mockClear();
	});

	it("enforces closed prop contracts and rejects invented props", () => {
		expect(contractChecks.every((check) => check === true)).toBe(true);
	});

	it("renders exact native tags, hierarchy, slots, and attributes without implicit roles", () => {
		const groupProps = {
			"data-testid": "shortcut-group",
			id: "shortcut-group",
			title: "Shortcut",
		};
		const cmdKeyProps = {
			"data-key": "cmd",
			id: "cmd-key",
			title: "Command",
		};
		const kKeyProps = {
			id: "k-key",
		};
		const groupMarkup = renderToStaticMarkup(
			h(KbdGroup, groupProps, h(Kbd, cmdKeyProps, "⌘"), h(Kbd, kKeyProps, "K"))
		);
		expect(groupMarkup).toMatch(kbdGroupSlotRegex);
		expect(groupMarkup).toMatch(kbdGroupHierarchyRegex);
		expect(groupMarkup).not.toContain('role="');
		expect(groupMarkup).not.toContain("tabindex");
		expect(groupMarkup).toContain('data-slot="kbd-group"');
		expect(groupMarkup).toContain('data-slot="kbd"');
		expect(groupMarkup).toContain('data-testid="shortcut-group"');
		expect(groupMarkup).toContain('data-key="cmd"');
		expect(groupMarkup).toContain('id="shortcut-group"');
		expect(groupMarkup).toContain('id="cmd-key"');
		expect(groupMarkup).toContain('id="k-key"');
		expect(groupMarkup).toContain('title="Shortcut"');
		expect(groupMarkup).toContain('title="Command"');

		const standaloneProps = {
			"data-testid": "esc-key",
			id: "esc-key",
			title: "Escape",
		};
		const standaloneMarkup = renderToStaticMarkup(
			h(Kbd, standaloneProps, "Esc")
		);
		expect(standaloneMarkup).toMatch(kbdSlotRegex);
		expect(standaloneMarkup).toContain('data-slot="kbd"');
		expect(standaloneMarkup).toContain('data-testid="esc-key"');
		expect(standaloneMarkup).toContain('id="esc-key"');
		expect(standaloneMarkup).toContain('title="Escape"');
		expect(standaloneMarkup).toContain("Esc");
		expect(standaloneMarkup).not.toContain('role="');
		expect(standaloneMarkup).not.toContain("tabindex");
	});

	it("protects data-slot, style, and semantics against direct prop overrides across both components", () => {
		const components = [
			[Kbd, "kbd"],
			[KbdGroup, "kbd-group"],
		] as const;

		for (const [Comp, slot] of components) {
			const maliciousProps = {
				"aria-label": `malicious-label-${slot}`,
				"aria-labelledby": `malicious-labelledby-${slot}`,
				children: "Content",
				className: `malicious-class-${slot}`,
				"data-slot": `malicious-slot-${slot}`,
				role: "button",
				style: { color: "red" },
			};
			const m = renderToStaticMarkup(h(Comp, maliciousProps));
			expect(m).toContain(`data-slot="${slot}"`);
			expect(m).not.toContain(`malicious-slot-${slot}`);
			expect(m).not.toContain(`malicious-class-${slot}`);
			expect(m).not.toContain(`malicious-label-${slot}`);
			expect(m).not.toContain(`malicious-labelledby-${slot}`);
			expect(m).not.toContain('role="');
			expect(m).not.toContain('style="');
			expect(m).not.toContain("color:red");
			expect(m).not.toContain("color: red");
		}
	});

	it("forwards refs attached to host KBD elements", async () => {
		const root = createRoot(document.createElement("div"));
		const [groupRef, kbdRef] = [
			createRef<HTMLElement>(),
			createRef<HTMLElement>(),
		];

		await act(() =>
			root.render(h(KbdGroup, { ref: groupRef }, h(Kbd, { ref: kbdRef }, "⌘")))
		);

		const tagSlot = (el: HTMLElement | null) =>
			`${el?.tagName}:${el?.dataset.slot}`;
		expect(tagSlot(groupRef.current)).toBe("KBD:kbd-group");
		expect(tagSlot(kbdRef.current)).toBe("KBD:kbd");
		await act(() => root.unmount());
	});

	it("renders rich children without breakage", () => {
		const markup = renderToStaticMarkup(
			h(
				KbdGroup,
				null,
				h(Kbd, null, h("abbr", { title: "Command" }, "⌘")),
				h(Kbd, null, h("span", { "data-key": "k" }, "K"))
			)
		);
		expect(markup).toContain('<abbr title="Command">⌘</abbr>');
		expect(markup).toContain('data-key="k"');
		expect(markup).toContain("K");
	});

	it("validates exact StyleX calls for root and group styles", () => {
		renderToStaticMarkup(h(KbdGroup, null, h(Kbd, null, "⌘")));

		expect(propsSpy).toHaveBeenCalledWith(kbdStyles.group);
		expect(propsSpy).toHaveBeenCalledWith(kbdStyles.root);
	});
});
