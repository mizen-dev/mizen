// @vitest-environment happy-dom
import { act, createElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@stylexjs/stylex", () => ({
	createTheme: <T extends object>(_vars: unknown, styles: T) => ({
		...styles,
		className: "x15oam52 xm6k6ka",
	}),
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: () => "keyframes",
	props: (style?: { className?: string }) => ({
		className: style?.className ?? "x15oam52 xm6k6ka",
	}),
	when: { ancestor: () => ":where(*)" },
}));

import {
	ThemeProvider,
	type ThemeProviderProps,
	type ThemeStorage,
	useTheme,
} from "../../../packages/ui/src/theme/index";
import {
	applyThemeTransitionGuard,
	cleanThemeTransitionGuard,
	finishThemeTransitionGuard,
	THEME_GUARD_CSS,
	THEME_GUARD_STYLE_ID,
} from "../../../packages/ui/src/theme/theme-transition-guard";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

function createMockStorage(initial: Record<string, string> = {}): ThemeStorage {
	const map = new Map<string, string>(Object.entries(initial));
	return {
		getItem: (key) => map.get(key) ?? null,
		setItem: (key, value) => {
			map.set(key, value);
		},
	};
}

describe("Theme transition style guard lifecycle", () => {
	let container: HTMLDivElement;
	const roots = new Set<ReturnType<typeof createRoot>>();

	function mount(
		element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
	) {
		const root = createRoot(
			container.appendChild(document.createElement("div"))
		);
		roots.add(root);
		act(() => root.render(element));
		return root;
	}

	function mountConsumer(
		providerProps: ThemeProviderProps,
		onTheme: (val: ReturnType<typeof useTheme>) => void
	) {
		return mount(
			createElement(
				ThemeProvider,
				providerProps,
				createElement(() => {
					onTheme(useTheme());
					return null;
				})
			)
		);
	}

	beforeEach(() => {
		container = document.body.appendChild(document.createElement("div"));
		document.documentElement.className = "";
		document.documentElement.removeAttribute("data-theme");
		document.documentElement.style.colorScheme = "";
		cleanThemeTransitionGuard();
	});

	afterEach(() => {
		for (const root of roots) {
			act(() => root.unmount());
		}
		roots.clear();
		container.remove();
		cleanThemeTransitionGuard();
		document.documentElement.className = "";
		document.documentElement.removeAttribute("data-theme");
		document.documentElement.style.colorScheme = "";
		const script = document.querySelector("script[nonce]");
		script?.remove();
	});

	it("inserts style guard on actual light/dark change with correct CSS override", () => {
		let captured: ReturnType<typeof useTheme> | undefined;
		const storage = createMockStorage({ "mizen-theme": "light" });
		mountConsumer({ defaultTheme: "light", storage }, (val) => {
			captured = val;
		});

		// Initial load should not have an active transition guard
		expect(document.getElementById(THEME_GUARD_STYLE_ID)).toBeNull();

		act(() => {
			captured?.setTheme("dark");
		});

		const guard = document.getElementById(THEME_GUARD_STYLE_ID);
		expect(guard).not.toBeNull();
		expect(guard?.tagName).toBe("STYLE");
		expect(guard?.textContent).toBe(THEME_GUARD_CSS);
		expect(guard?.textContent).toContain("transition-property");
		expect(guard?.textContent).toContain(
			"opacity, transform, translate, scale, rotate !important"
		);
	});

	it("copies nonce from existing script[nonce] onto the guard element", () => {
		const nonceScript = document.createElement("script");
		nonceScript.setAttribute("nonce", "csp-test-nonce-1234");
		document.head.appendChild(nonceScript);

		applyThemeTransitionGuard();

		const guard = document.getElementById(THEME_GUARD_STYLE_ID);
		expect(guard).not.toBeNull();
		expect(guard?.getAttribute("nonce")).toBe("csp-test-nonce-1234");
	});

	it("produces exactly one style guard during rapid repeated theme changes", () => {
		let captured: ReturnType<typeof useTheme> | undefined;
		const storage = createMockStorage({ "mizen-theme": "light" });
		mountConsumer({ defaultTheme: "light", storage }, (val) => {
			captured = val;
		});

		act(() => {
			captured?.setTheme("dark");
			captured?.setTheme("light");
			captured?.setTheme("dark");
		});

		const guards = document.querySelectorAll(`#${THEME_GUARD_STYLE_ID}`);
		expect(guards.length).toBe(1);
	});

	it("removes style guard after double animation frames finish", () => {
		let frameCallbacks: FrameRequestCallback[] = [];
		let nextFrameId = 1;

		const originalRaf = window.requestAnimationFrame;
		const originalCaf = window.cancelAnimationFrame;

		window.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
			frameCallbacks.push(cb);
			const currentId = nextFrameId;
			nextFrameId += 1;
			return currentId;
		});
		window.cancelAnimationFrame = vi.fn();

		try {
			applyThemeTransitionGuard();
			expect(document.getElementById(THEME_GUARD_STYLE_ID)).not.toBeNull();

			finishThemeTransitionGuard();
			expect(document.getElementById(THEME_GUARD_STYLE_ID)).not.toBeNull();

			// First rAF
			const firstCallbacks = [...frameCallbacks];
			frameCallbacks = [];
			for (const cb of firstCallbacks) {
				cb(performance.now());
			}
			expect(document.getElementById(THEME_GUARD_STYLE_ID)).not.toBeNull();

			// Second rAF
			const secondCallbacks = [...frameCallbacks];
			frameCallbacks = [];
			for (const cb of secondCallbacks) {
				cb(performance.now());
			}
			expect(document.getElementById(THEME_GUARD_STYLE_ID)).toBeNull();
		} finally {
			window.requestAnimationFrame = originalRaf;
			window.cancelAnimationFrame = originalCaf;
		}
	});

	it("leaves no orphaned style guard in StrictMode", () => {
		const storage = createMockStorage({ "mizen-theme": "light" });
		let captured: ReturnType<typeof useTheme> | undefined;

		const root = mount(
			createElement(
				StrictMode,
				null,
				createElement(
					ThemeProvider,
					{ defaultTheme: "light", storage },
					createElement(() => {
						captured = useTheme();
						return null;
					})
				)
			)
		);

		act(() => {
			captured?.setTheme("dark");
		});

		act(() => {
			root.unmount();
		});
		roots.delete(root);

		expect(document.getElementById(THEME_GUARD_STYLE_ID)).toBeNull();
	});
});
