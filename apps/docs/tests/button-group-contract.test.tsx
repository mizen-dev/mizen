// @vitest-environment happy-dom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vite-plus/test";
import { Button } from "../../../packages/ui/src/components/button/button";
import { ButtonGroup } from "../../../packages/ui/src/components/button-group/button-group";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_vars: T, overrides: object): object =>
		overrides,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(vars: T): T => vars,
	keyframes: <T extends object>(frames: T): T => frames,
	props: () => ({}),
	when: {
		ancestor: () => ":where(*)",
	},
}));
Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
function MaliciousGroup({ malicious }: { malicious: Record<string, unknown> }) {
	return Reflect.apply(ButtonGroup, undefined, [malicious]);
}
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
describe("ButtonGroup contract", () => {
	it("wraps existing buttons in a labeled semantic group with orientation", () => {
		const ref = {
			current: null as HTMLDivElement | null,
		};
		const { container, unmount } = mount(
			h(
				ButtonGroup,
				{
					"aria-label": "Playback controls",
					orientation: "vertical",
					ref,
				},
				h(Button, null, "Play"),
				h(Button, null, "Pause")
			)
		);
		const group = container.querySelector('[data-slot="button-group"]');
		expect(group?.getAttribute("role")).toBe("group");
		expect(group?.getAttribute("data-orientation")).toBe("vertical");
		expect(group?.getAttribute("aria-label")).toBe("Playback controls");
		expect(group?.querySelectorAll('[data-slot="button"]')).toHaveLength(2);
		expect(ref.current).toBe(group);
		unmount();
	});
	it("protects its structural attributes and styles at runtime", () => {
		const malicious = {
			className: "malicious-class",
			"data-orientation": "diagonal",
			"data-slot": "malicious-slot",
			role: "presentation",
			style: {
				display: "none",
			},
		};
		const { container, unmount } = mount(
			h(MaliciousGroup, {
				malicious,
			})
		);
		expect(
			container.querySelector('[data-slot="button-group"]')
		).not.toBeNull();
		expect(container.querySelector('[data-slot="malicious-slot"]')).toBeNull();
		expect(container.querySelector(".malicious-class")).toBeNull();
		expect(container.querySelector('[role="presentation"]')).toBeNull();
		expect(container.querySelector("[style]")).toBeNull();
		unmount();
	});
});
