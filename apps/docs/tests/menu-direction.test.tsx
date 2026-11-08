// @vitest-environment happy-dom

import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { DirectionProvider } from "../../../packages/ui/node_modules/@base-ui/react/direction-provider/index.mjs";
import { MenuSubTrigger } from "../../../packages/ui/src/components/menu/menu";

vi.mock(
	"../../../packages/ui/node_modules/@base-ui/react/menu/index.mjs",
	async (importOriginal) => {
		const React = await import("react");
		const actual =
			await importOriginal<
				typeof import("../../../packages/ui/node_modules/@base-ui/react/menu/index.mjs")
			>();
		return {
			...actual,
			Menu: {
				...actual.Menu,
				SubmenuTrigger: ({ children }: { children?: ReactNode }) =>
					React.createElement("button", null, children),
			},
		};
	}
);
vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(vars: T): T => vars,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const renderTrigger = (direction: "ltr" | "rtl") =>
	renderToStaticMarkup(
		createElement(
			DirectionProvider,
			{ direction },
			createElement(MenuSubTrigger, null, "Move to")
		)
	);

describe("Menu submenu direction", () => {
	it("points the chevron toward inline-end in both directions", () => {
		expect(renderTrigger("ltr")).toContain('d="M9 6l6 6l-6 6"');
		expect(renderTrigger("rtl")).toContain('d="M15 6l-6 6l6 6"');
	});
});
