// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	Command,
	CommandDialog,
	CommandDialogPopup,
	CommandDialogTrigger,
	CommandEmpty,
	CommandFooter,
	CommandGroup,
	CommandGroupLabel,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPanel,
	CommandSeparator,
	CommandShortcut,
} from "../../../packages/ui/src/components/command/command";

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

describe("Command protected slots and canonical data-slots", () => {
	it("renders standalone command composition with all canonical slots", () => {
		const items = ["Alpha", "Beta"];
		const { container, unmount } = mount(
			h(
				Command,
				{ items },
				h(CommandInput, { placeholder: "Search" }),
				h(
					CommandPanel,
					null,
					h(CommandEmpty, null, "No results"),
					h(
						CommandList,
						null,
						h(
							CommandGroup,
							null,
							h(CommandGroupLabel, null, "Group 1"),
							items.map((val) => h(CommandItem, { key: val, value: val }, val)),
							h(CommandSeparator, null),
							h(
								CommandItem,
								{ value: "shortcut-item" },
								"Item with shortcut",
								h(CommandShortcut, null, "⌘S")
							)
						)
					)
				),
				h(CommandFooter, null, "Footer text")
			)
		);

		const expectedSlots = [
			"command-input-wrapper",
			"command-input-group",
			"command-start-addon",
			"command-input",
			"command-panel",
			"command-empty",
			"command-list",
			"command-group",
			"command-group-label",
			"command-item",
			"command-separator",
			"command-shortcut",
			"command-footer",
		];

		for (const slot of expectedSlots) {
			const el = container.querySelector(`[data-slot="${slot}"]`);
			expect(el).not.toBeNull();
		}

		unmount();
	});

	it("renders dialog command composition with all dialog slots", () => {
		const { unmount } = mount(
			h(
				CommandDialog,
				{ defaultOpen: true },
				h(CommandDialogTrigger, null, "Open"),
				h(
					CommandDialogPopup,
					null,
					h(
						Command,
						{ items: ["Item 1"] },
						h(CommandInput, null),
						h(
							CommandPanel,
							null,
							h(CommandList, null, h(CommandItem, { value: "1" }, "Item 1"))
						)
					)
				)
			)
		);

		const dialogSlots = [
			"command-dialog-trigger",
			"command-dialog-backdrop",
			"command-dialog-viewport",
			"command-dialog-popup",
		];

		for (const slot of dialogSlots) {
			const el = document.querySelector(`[data-slot="${slot}"]`);
			expect(el).not.toBeNull();
		}

		unmount();
	});

	it("protects data-slot against direct prop and render overrides across wrappers", () => {
		const bad = {
			className: "malicious-class",
			"data-slot": "malicious-slot",
			style: { color: "red" },
		};

		const { container, unmount } = mount(
			h(
				Command,
				{ items: ["A"] },
				Reflect.apply(CommandInput, undefined, [
					{
						...bad,
						render: (props: object) =>
							h("input", { ...props, "data-slot": "render-override" }),
					},
				]),
				Reflect.apply(CommandPanel, undefined, [
					{
						...bad,
						children: [
							h(
								CommandEmpty,
								{
									...bad,
									key: "command-empty",
									render: (props: object) =>
										h("div", { ...props, "data-slot": "render-override" }),
								},
								"Empty"
							),
							h(
								CommandList,
								{
									...bad,
									key: "command-list",
									render: (props: object) =>
										h("div", { ...props, "data-slot": "render-override" }),
								},
								Reflect.apply(CommandItem, undefined, [
									{
										...bad,
										children: "A",
										render: (props: object) =>
											h("div", { ...props, "data-slot": "render-override" }),
										value: "A",
									},
								])
							),
						],
					},
				]),
				Reflect.apply(CommandFooter, undefined, [{ ...bad, children: "Foot" }])
			)
		);

		expect(container.querySelector('[data-slot="malicious-slot"]')).toBeNull();
		expect(container.querySelector('[data-slot="render-override"]')).toBeNull();
		expect(container.querySelector(".malicious-class")).toBeNull();

		expect(
			container.querySelector('[data-slot="command-input"]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="command-panel"]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="command-empty"]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="command-list"]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="command-item"]')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="command-footer"]')
		).not.toBeNull();

		unmount();
	});
});
