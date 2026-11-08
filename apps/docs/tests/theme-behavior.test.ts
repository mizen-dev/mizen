// @vitest-environment happy-dom

import { props } from "@stylexjs/stylex";
import { act, createElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { darkTheme } from "../../../packages/ui/src/styles/themes";
import {
	initializeTheme,
	type ThemePreference,
	ThemeProvider,
	type ThemeProviderProps,
	type ThemeStorage,
	useTheme,
} from "../../../packages/ui/src/theme/index";

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

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const WHITESPACE_REGEX = /\s+/u;

function getDarkTokens(): readonly string[] {
	return (props(darkTheme).className ?? "")
		.split(WHITESPACE_REGEX)
		.filter(Boolean);
}

function createMockStorage(initial: Record<string, string> = {}): ThemeStorage {
	const map = new Map<string, string>(Object.entries(initial));
	return {
		getItem: (key) => map.get(key) ?? null,
		setItem: (key, value) => {
			map.set(key, value);
		},
	};
}

describe("Theme provider and hook runtime behavior", () => {
	let container: HTMLDivElement;
	let matchMediaMatches = false;
	const matchMediaListeners = new Set<() => void>();
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
		matchMediaMatches = false;
		matchMediaListeners.clear();

		window.matchMedia = vi.fn().mockImplementation((query: string) => ({
			addEventListener: (_e: string, l: () => void) =>
				matchMediaListeners.add(l),
			addListener: () => undefined,
			dispatchEvent: () => true,
			matches: matchMediaMatches,
			media: query,
			onchange: null,
			removeEventListener: (_e: string, l: () => void) =>
				matchMediaListeners.delete(l),
			removeListener: () => undefined,
		}));
	});

	afterEach(() => {
		for (const root of roots) {
			act(() => root.unmount());
		}
		roots.clear();
		container.remove();
		document.documentElement.className = "";
		document.documentElement.removeAttribute("data-theme");
		document.documentElement.style.colorScheme = "";
	});

	it("initializes the saved theme synchronously before React mounting", () => {
		const storage = createMockStorage({ "mizen-theme": "dark" });
		expect(initializeTheme({ storage })).toBe("dark");
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(document.documentElement.style.colorScheme).toBe("dark");
		for (const token of getDarkTokens()) {
			expect(document.documentElement.classList.contains(token)).toBe(true);
		}
		const root = mountConsumer({ storage }, () => undefined);
		act(() => root.unmount());
		roots.delete(root);
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	it("initialization shares custom storage options and system fallback", () => {
		matchMediaMatches = true;
		const storage = createMockStorage({ custom: "invalid" });
		expect(initializeTheme({ storage, storageKey: "custom" })).toBe("dark");
		storage.setItem("custom", "light");
		expect(initializeTheme({ storage, storageKey: "custom" })).toBe("light");
		for (const token of getDarkTokens()) {
			expect(document.documentElement.classList.contains(token)).toBe(false);
		}
	});

	it("initializes a fallback when browser storage is denied", () => {
		const storage: ThemeStorage = {
			getItem: () => {
				throw new DOMException("Denied", "SecurityError");
			},
			setItem: () => undefined,
		};
		expect(initializeTheme({ defaultTheme: "dark", storage })).toBe("dark");
	});

	it("throws an error when useTheme is called outside ThemeProvider", () => {
		expect(() => {
			mount(
				createElement(() => {
					useTheme();
					return null;
				})
			);
		}).toThrow("useTheme must be used within a ThemeProvider");
	});

	it("defaults to system theme and mizen-theme storage key", () => {
		let captured: ReturnType<typeof useTheme> | undefined;
		const storage = createMockStorage();
		mountConsumer({ storage }, (val) => {
			captured = val;
		});

		expect(captured?.theme).toBe("system");
		expect(captured?.resolvedTheme).toBe("light");
		expect(captured?.systemTheme).toBe("light");
		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
		expect(document.documentElement.style.colorScheme).toBe("light");
	});

	it("updates theme to dark, writes to storage, and synchronizes documentElement", () => {
		let captured: ReturnType<typeof useTheme> | undefined;
		const storage = createMockStorage();
		mountConsumer({ storage }, (val) => {
			captured = val;
		});

		act(() => {
			captured?.setTheme("dark");
		});

		expect(captured?.theme).toBe("dark");
		expect(captured?.resolvedTheme).toBe("dark");
		expect(storage.getItem("mizen-theme")).toBe("dark");
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(document.documentElement.style.colorScheme).toBe("dark");

		const darkTokens = getDarkTokens();
		for (const token of darkTokens) {
			expect(document.documentElement.classList.contains(token)).toBe(true);
		}

		act(() => {
			captured?.setTheme("light");
		});

		expect(captured?.theme).toBe("light");
		expect(captured?.resolvedTheme).toBe("light");
		expect(storage.getItem("mizen-theme")).toBe("light");
		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
		expect(document.documentElement.style.colorScheme).toBe("light");
		for (const token of darkTokens) {
			expect(document.documentElement.classList.contains(token)).toBe(false);
		}
	});

	it("responds to matchMedia changes when theme is system", () => {
		let captured: ReturnType<typeof useTheme> | undefined;
		const storage = createMockStorage();
		mountConsumer({ storage }, (val) => {
			captured = val;
		});

		expect(captured?.resolvedTheme).toBe("light");

		act(() => {
			matchMediaMatches = true;
			for (const listener of matchMediaListeners) {
				listener();
			}
		});

		expect(captured?.systemTheme).toBe("dark");
		expect(captured?.resolvedTheme).toBe("dark");
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	it("allows portals in body to inherit documentElement theme attributes and classes", () => {
		const storage = createMockStorage({ "mizen-theme": "dark" });
		mount(createElement(ThemeProvider, { storage }, "App content"));

		const portalElement = document.createElement("div");
		portalElement.setAttribute("data-slot", "portal-popup");
		document.body.appendChild(portalElement);

		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

		const darkTokens = getDarkTokens();
		for (const token of darkTokens) {
			expect(document.documentElement.classList.contains(token)).toBe(true);
		}

		portalElement.remove();
	});

	it("shares in-memory dark selection across providers when storage throws DOMException", () => {
		const failingStorage: ThemeStorage = {
			getItem: () => {
				throw new DOMException("Access denied", "SecurityError");
			},
			setItem: () => {
				throw new DOMException("Access denied", "SecurityError");
			},
		};

		let capturedA: ReturnType<typeof useTheme> | undefined;
		let capturedB: typeof capturedA;

		mountConsumer(
			{ storage: failingStorage, storageKey: "denied-key" },
			(val) => {
				capturedA = val;
			}
		);

		act(() => {
			capturedA?.setTheme("dark");
		});

		expect(capturedA?.theme).toBe("dark");

		mountConsumer(
			{ storage: failingStorage, storageKey: "denied-key" },
			(val) => {
				capturedB = val;
			}
		);

		expect(capturedB?.theme).toBe("dark");
		expect(capturedB?.resolvedTheme).toBe("dark");
	});

	it("coordinates opposing providers under StrictMode, letting the latest win and restoring root upon unmount", () => {
		document.documentElement.className = "pre-existing";

		const storageA = createMockStorage({ "theme-a": "light" });
		const storageB = createMockStorage({ "theme-b": "dark" });

		const mountStrict = (
			defaultTheme: ThemePreference,
			storage: ThemeStorage,
			storageKey: string
		) =>
			mount(
				createElement(
					StrictMode,
					null,
					createElement(
						ThemeProvider,
						{ defaultTheme, storage, storageKey },
						"child"
					)
				)
			);

		const rootA = mountStrict("light", storageA, "theme-a");
		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
		expect(document.documentElement.style.colorScheme).toBe("light");

		const rootB = mountStrict("dark", storageB, "theme-b");
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(document.documentElement.style.colorScheme).toBe("dark");

		act(() => rootB.unmount());
		roots.delete(rootB);

		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
		expect(document.documentElement.style.colorScheme).toBe("light");

		act(() => rootA.unmount());
		roots.delete(rootA);

		expect(document.documentElement.getAttribute("data-theme")).toBeNull();
		expect(document.documentElement.style.colorScheme).toBe("");
		expect(document.documentElement.classList.contains("pre-existing")).toBe(
			true
		);
	});
});
