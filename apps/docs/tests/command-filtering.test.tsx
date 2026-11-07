// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	Command,
	CommandCollection,
	CommandEmpty,
	CommandGroup,
	CommandGroupLabel,
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

describe("Command filtering and grouped data", () => {
	it("filters items based on user input and reveals empty state when no match", () => {
		const items = ["Apple", "Banana", "Cherry"];
		const { container, unmount } = mount(
			<Command items={items}>
				<CommandInput placeholder="Search" />
				<CommandPanel>
					<CommandEmpty>No fruits found</CommandEmpty>
					<CommandList>
						<CommandCollection>
							{(item: string) => (
								<CommandItem key={item} value={item}>
									{item}
								</CommandItem>
							)}
						</CommandCollection>
					</CommandList>
				</CommandPanel>
			</Command>
		);

		const input = container.querySelector("input");
		expect(input).not.toBeNull();

		act(() => {
			if (input) {
				input.focus();
				const nativeSetter = Object.getOwnPropertyDescriptor(
					HTMLInputElement.prototype,
					"value"
				)?.set;
				nativeSetter?.call(input, "Ban");
				input.dispatchEvent(new Event("input", { bubbles: true }));
				input.dispatchEvent(new Event("change", { bubbles: true }));
			}
		});

		const filteredItems = container.querySelectorAll(
			'[data-slot="command-item"]'
		);
		const filteredTexts = Array.from(filteredItems).map((el) => el.textContent);
		expect(filteredTexts).toEqual(["Banana"]);

		act(() => {
			if (input) {
				const nativeSetter = Object.getOwnPropertyDescriptor(
					HTMLInputElement.prototype,
					"value"
				)?.set;
				nativeSetter?.call(input, "Zzz");
				input.dispatchEvent(new Event("input", { bubbles: true }));
				input.dispatchEvent(new Event("change", { bubbles: true }));
			}
		});

		const empty = container.querySelector('[data-slot="command-empty"]');
		expect(empty).not.toBeNull();
		expect(empty?.textContent).toBe("No fruits found");

		unmount();
	});

	it("renders grouped data with CommandGroup, CommandGroupLabel, and CommandCollection", () => {
		const groups = [
			{
				items: [
					{ label: "Inbox", value: "inbox" },
					{ label: "Sent", value: "sent" },
				],
				value: "Mail",
			},
			{
				items: [{ label: "Profile", value: "profile" }],
				value: "Account",
			},
		];

		const { container, unmount } = mount(
			<Command items={groups}>
				<CommandInput placeholder="Search" />
				<CommandPanel>
					<CommandList>
						{groups.map((group) => (
							<CommandGroup items={group.items} key={group.value}>
								<CommandGroupLabel>{group.value}</CommandGroupLabel>
								<CommandCollection>
									{(item: { label: string; value: string }) => (
										<CommandItem key={item.value} value={item.value}>
											{item.label}
										</CommandItem>
									)}
								</CommandCollection>
							</CommandGroup>
						))}
					</CommandList>
				</CommandPanel>
			</Command>
		);

		const groupLabels = container.querySelectorAll(
			'[data-slot="command-group-label"]'
		);
		expect(groupLabels).toHaveLength(2);
		expect(groupLabels[0]?.textContent).toBe("Mail");
		expect(groupLabels[1]?.textContent).toBe("Account");

		const items = container.querySelectorAll('[data-slot="command-item"]');
		expect(items).toHaveLength(3);

		unmount();
	});
});
