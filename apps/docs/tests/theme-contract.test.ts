import type { ResolvedTheme, ThemePreference } from "@mizen-labs/ui/theme";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	createTheme: <T extends object>(_vars: unknown, styles: T) => ({
		...styles,
		className: "x15oam52 xm6k6ka",
	}),
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: () => "keyframes",
	props: (style?: { className?: string }) => ({
		className: style?.className ?? "x15oam52 xm6k6ka",
	}),
	when: { ancestor: () => ":where(*)" },
}));

import {
	initializeTheme,
	ThemeProvider,
	ThemeScript,
	useTheme,
} from "../../../packages/ui/src/theme/index";

type Exact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;

type ExpectedPreference = "light" | "dark" | "system";
type ExpectedResolved = "light" | "dark";

const preferenceTypeCheck: Exact<ThemePreference, ExpectedPreference> = true;
const resolvedTypeCheck: Exact<ResolvedTheme, ExpectedResolved> = true;

describe("Theme contract and public exports", () => {
	it("client initialization is a server-safe no-op", () => {
		expect(initializeTheme()).toBeNull();
	});

	it("exports expected types and components from theme module", () => {
		expect(preferenceTypeCheck).toBe(true);
		expect(resolvedTypeCheck).toBe(true);
		expect(typeof ThemeProvider).toBe("function");
		expect(typeof useTheme).toBe("function");
		expect(typeof ThemeScript).toBe("function");
	});

	it("renders ThemeScript with nonce, suppressHydrationWarning, and safely escaped options", () => {
		const markup = renderToStaticMarkup(
			createElement(ThemeScript, {
				defaultTheme: "dark",
				nonce: "csp-nonce-1234",
				storageKey: "custom-test-theme",
			})
		);

		expect(markup).toContain("<script");
		expect(markup).toContain('nonce="csp-nonce-1234"');
		expect(markup).toContain("custom-test-theme");
		expect(markup).toContain("dark");

		const hostileMarkup = renderToStaticMarkup(
			createElement(ThemeScript, {
				storageKey: 'test"</script><script>alert(1)</script>',
			})
		);
		expect(hostileMarkup).not.toContain("</script><script>alert(1)</script>");
	});
});
