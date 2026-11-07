// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuPopup,
	NavigationMenuTrigger,
} from "../../../packages/ui/src/components/navigation-menu/navigation-menu";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: () => "keyframes",
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

describe("NavigationMenu composition contract", () => {
	it("renders landmark, direct link, trigger icon, and popup viewport slots", () => {
		const portalContainer = document.body.appendChild(
			document.createElement("div")
		);
		const { container, unmount } = mount(
			<NavigationMenu defaultValue="resources">
				<NavigationMenuList>
					<NavigationMenuItem value="resources">
						<NavigationMenuTrigger>Resources</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink href="/guides">Guides</NavigationMenuLink>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							active
							href="/about"
							render={
								<a aria-current="step" data-slot="caller-slot" href="/about">
									About
								</a>
							}
						/>
					</NavigationMenuItem>
				</NavigationMenuList>
				<NavigationMenuPopup portalProps={{ container: portalContainer }} />
			</NavigationMenu>
		);

		expect(container.querySelector("nav")?.getAttribute("aria-label")).toBe(
			"Navigation"
		);
		expect(
			container.querySelector('[data-slot="navigation-menu-list"]')?.tagName
		).toBe("UL");
		expect(
			container.querySelector('[data-slot="navigation-menu-icon"] svg')
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="navigation-menu-link"]')?.tagName
		).toBe("A");
		expect(
			container.querySelector('[data-slot="navigation-menu-link"][data-active]')
		).not.toBeNull();
		expect(
			portalContainer.querySelector('[data-slot="navigation-menu-viewport"]')
		).not.toBeNull();
		expect(
			container.querySelector(
				'[data-slot="navigation-menu-link"][aria-current="page"]'
			)
		).not.toBeNull();
		expect(container.querySelector('[data-slot="caller-slot"]')).toBeNull();
		unmount();
		portalContainer.remove();
	});

	it("keeps Base UI control and callback props while protecting component slots", () => {
		const onValueChange = vi.fn();
		const { container, unmount } = mount(
			<NavigationMenu data-slot="caller-slot" onValueChange={onValueChange}>
				<NavigationMenuList>
					<NavigationMenuItem value="resources">
						<NavigationMenuTrigger>Resources</NavigationMenuTrigger>
						<NavigationMenuContent>
							<NavigationMenuLink href="/guides">Guides</NavigationMenuLink>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
				<NavigationMenuPopup />
			</NavigationMenu>
		);

		expect(container.querySelector('[data-slot="caller-slot"]')).toBeNull();
		expect(
			container.querySelector('[data-slot="navigation-menu"]')
		).not.toBeNull();
		const trigger = container.querySelector<HTMLButtonElement>(
			'[data-slot="navigation-menu-trigger"]'
		);
		expect(trigger).not.toBeNull();
		act(() => trigger?.click());
		expect(onValueChange.mock.calls[0]?.[0]).toBe("resources");
		unmount();
	});
});
