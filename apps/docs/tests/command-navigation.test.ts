// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Command,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPanel,
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

describe("Command navigation and item activation", () => {
	it("automatically highlights the first item with autoHighlight='always' default", () => {
		const items = ["First", "Second", "Third"];
		const { container, unmount } = mount(
			h(
				Command,
				{ items },
				h(CommandInput, { placeholder: "Search" }),
				h(
					CommandPanel,
					null,
					h(
						CommandList,
						null,
						items.map((item) =>
							h(CommandItem, { key: item, value: item }, item)
						)
					)
				)
			)
		);

		const renderedItems = container.querySelectorAll(
			'[data-slot="command-item"]'
		);
		expect(renderedItems).toHaveLength(3);
		expect(renderedItems[0]?.textContent).toBe("First");
		expect(renderedItems[0]?.hasAttribute("data-highlighted")).toBe(true);
		expect(renderedItems[1]?.hasAttribute("data-highlighted")).toBe(false);

		unmount();
	});

	it("navigates items with ArrowDown and ArrowUp keyboard movement", () => {
		const items = ["One", "Two", "Three"];
		const { container, unmount } = mount(
			h(
				Command,
				{ items },
				h(CommandInput, { placeholder: "Search" }),
				h(
					CommandPanel,
					null,
					h(
						CommandList,
						null,
						items.map((item) =>
							h(CommandItem, { key: item, value: item }, item)
						)
					)
				)
			)
		);

		const input = container.querySelector("input");
		expect(input).not.toBeNull();

		const renderedItems = container.querySelectorAll(
			'[data-slot="command-item"]'
		);
		expect(renderedItems[0]?.hasAttribute("data-highlighted")).toBe(true);

		act(() => {
			input?.dispatchEvent(
				new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" })
			);
		});

		expect(renderedItems[1]?.hasAttribute("data-highlighted")).toBe(true);
		expect(renderedItems[0]?.hasAttribute("data-highlighted")).toBe(false);

		act(() => {
			input?.dispatchEvent(
				new KeyboardEvent("keydown", { bubbles: true, key: "ArrowUp" })
			);
		});

		expect(renderedItems[0]?.hasAttribute("data-highlighted")).toBe(true);
		expect(renderedItems[1]?.hasAttribute("data-highlighted")).toBe(false);

		unmount();
	});

	it("skips and prevents activation on disabled items", () => {
		const handleActive = vi.fn();
		const handleDisabled = vi.fn();

		const items = [
			{
				disabled: false,
				label: "Enabled 1",
				onClick: handleActive,
				value: "e1",
			},
			{
				disabled: true,
				label: "Disabled",
				onClick: handleDisabled,
				value: "d",
			},
			{
				disabled: false,
				label: "Enabled 2",
				onClick: handleActive,
				value: "e2",
			},
		];

		const { container, unmount } = mount(
			h(
				Command,
				{ items },
				h(CommandInput, { placeholder: "Search" }),
				h(
					CommandPanel,
					null,
					h(
						CommandList,
						null,
						items.map((item) =>
							h(
								CommandItem,
								{
									disabled: item.disabled,
									key: item.value,
									onClick: item.onClick,
									value: item.value,
								},
								item.label
							)
						)
					)
				)
			)
		);

		const renderedItems = container.querySelectorAll(
			'[data-slot="command-item"]'
		);

		expect(renderedItems[1]?.hasAttribute("data-disabled")).toBe(true);

		act(() => {
			renderedItems[1]?.dispatchEvent(
				new MouseEvent("click", { bubbles: true })
			);
		});

		expect(handleDisabled).not.toHaveBeenCalled();

		unmount();
	});

	it("handles item activation via click and Enter key", () => {
		const handleClick = vi.fn();
		const items = ["Action 1", "Action 2"];

		const { container, unmount } = mount(
			h(
				Command,
				{ items },
				h(CommandInput, { placeholder: "Search" }),
				h(
					CommandPanel,
					null,
					h(
						CommandList,
						null,
						items.map((item) =>
							h(
								CommandItem,
								{ key: item, onClick: handleClick, value: item },
								item
							)
						)
					)
				)
			)
		);

		const renderedItems = container.querySelectorAll(
			'[data-slot="command-item"]'
		);
		expect(renderedItems[1]).toBeDefined();

		act(() => {
			renderedItems[1]?.dispatchEvent(
				new MouseEvent("click", { bubbles: true })
			);
		});

		expect(handleClick).toHaveBeenCalledTimes(1);

		const input = container.querySelector("input");
		act(() => {
			input?.dispatchEvent(
				new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
			);
		});

		expect(handleClick).toHaveBeenCalledTimes(2);

		unmount();
	});
});
