// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../../packages/ui/src/components/button/button";
import { Input } from "../../../packages/ui/src/components/input/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
} from "../../../packages/ui/src/components/input-group/input-group";
import { Textarea } from "../../../packages/ui/src/components/textarea/textarea";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_v: T, overrides: object): object =>
		overrides,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	return {
		container,
		unmount: () => {
			act(() => root.unmount());
			container.remove();
		},
	};
}

describe("InputGroup anatomy and slot protection", () => {
	it("renders canonical slots, roles, and default alignment", () => {
		const { container, unmount } = mount(
			h(
				InputGroup,
				null,
				h(InputGroupInput, { placeholder: "Search..." }),
				h(
					InputGroupAddon,
					{ align: "inline-start" },
					h(InputGroupText, null, "https://")
				),
				h(
					InputGroupAddon,
					{ align: "inline-end" },
					h(Button, { size: "sm" }, "Go")
				)
			)
		);

		const group = container.querySelector('[data-slot="input-group"]');
		expect(group).not.toBeNull();
		expect(group?.getAttribute("role")).toBe("group");

		const input = container.querySelector('[data-slot="input-group-input"]');
		expect(input).not.toBeNull();
		expect(input?.tagName.toLowerCase()).toBe("input");

		const addons = container.querySelectorAll(
			'[data-slot="input-group-addon"]'
		);
		expect(addons).toHaveLength(2);
		expect(addons[0]?.getAttribute("data-align")).toBe("inline-start");
		expect(addons[1]?.getAttribute("data-align")).toBe("inline-end");

		const text = container.querySelector('[data-slot="input-group-text"]');
		expect(text).not.toBeNull();
		expect(text?.tagName.toLowerCase()).toBe("span");
		expect(text?.textContent).toBe("https://");

		unmount();
	});

	it("renders InputGroupTextarea with protected slot", () => {
		const { container, unmount } = mount(
			h(
				InputGroup,
				null,
				h(InputGroupTextarea, { placeholder: "Note..." }),
				h(
					InputGroupAddon,
					{ align: "block-end" },
					h(InputGroupText, null, "0/100")
				)
			)
		);

		const textarea = container.querySelector(
			'[data-slot="input-group-textarea"]'
		);
		expect(textarea).not.toBeNull();
		expect(textarea?.tagName.toLowerCase()).toBe("textarea");

		const addon = container.querySelector('[data-slot="input-group-addon"]');
		expect(addon?.getAttribute("data-align")).toBe("block-end");

		unmount();
	});

	it("protects data-slot from malicious prop overrides across all components", () => {
		const malicious = {
			className: "malicious-class",
			"data-slot": "malicious-slot",
			style: { color: "red" },
		};

		function MaliciousGroup() {
			return Reflect.apply(InputGroup, undefined, [malicious]);
		}

		function MaliciousInput() {
			return Reflect.apply(InputGroupInput, undefined, [malicious]);
		}

		function MaliciousTextarea() {
			return Reflect.apply(InputGroupTextarea, undefined, [malicious]);
		}

		function MaliciousAddon() {
			return Reflect.apply(InputGroupAddon, undefined, [malicious]);
		}

		function MaliciousText() {
			return Reflect.apply(InputGroupText, undefined, [malicious]);
		}

		const { container, unmount } = mount(
			h(
				"div",
				null,
				h(MaliciousGroup),
				h(MaliciousInput),
				h(MaliciousTextarea),
				h(MaliciousAddon),
				h(MaliciousText)
			)
		);

		expect(container.querySelector('[data-slot="malicious-slot"]')).toBeNull();
		expect(container.querySelectorAll(".malicious-class")).toHaveLength(5);
		for (const element of container.querySelectorAll<HTMLElement>(
			".malicious-class"
		)) {
			expect(element.style.color).toBe("red");
		}
		expect(container.querySelector('[data-slot="input-group"]')).not.toBeNull();
		expect(
			container.querySelector('[data-slot="input-group-input"]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="input-group-textarea"]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="input-group-addon"]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="input-group-text"]')
		).not.toBeNull();

		unmount();
	});

	it("protects InputGroupInput data-slot against polymorphic render overrides", () => {
		const { container, unmount } = mount(
			h(InputGroupInput, {
				render: (renderProps: object) =>
					h("input", {
						...renderProps,
						className: "render-input",
						"data-slot": "override-slot",
						style: { color: "blue" },
					}),
			})
		);
		expect(container.querySelector('[data-slot="override-slot"]')).toBeNull();
		expect(
			container.querySelector('[data-slot="input-group-input"]')
		).not.toBeNull();
		const input = container.querySelector<HTMLInputElement>(".render-input");
		expect(input?.style.color).toBe("blue");
		unmount();
	});

	it("retains native textarea ref contract and defaults the group role", () => {
		const textareaRef = { current: null as HTMLTextAreaElement | null };
		const { container, unmount } = mount(
			h(InputGroup, null, h(InputGroupTextarea, { ref: textareaRef }))
		);
		expect(textareaRef.current).toBe(
			container.querySelector('[data-slot="input-group-textarea"]')
		);
		const group = container.querySelector('[data-slot="input-group"]');
		expect(group?.getAttribute("role")).toBe("group");
		unmount();
	});
});

describe("Unstyled seam on Input and Textarea", () => {
	it("renders Input with unstyled seam", () => {
		const { container, unmount } = mount(
			h(Input, { placeholder: "Unstyled", unstyled: true })
		);
		const input = container.querySelector("input");
		expect(input).not.toBeNull();
		expect(input?.placeholder).toBe("Unstyled");
		unmount();
	});

	it("renders Textarea with unstyled seam", () => {
		const { container, unmount } = mount(
			h(Textarea, { placeholder: "Unstyled textarea", unstyled: true })
		);
		const textarea = container.querySelector("textarea");
		expect(textarea).not.toBeNull();
		expect(textarea?.placeholder).toBe("Unstyled textarea");
		unmount();
	});
});
