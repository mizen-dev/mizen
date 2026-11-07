// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
	ThemeProvider,
	type ThemeStorage,
	useTheme,
} from "../../../packages/ui/src/theme/index";
import {
	createPreferenceStore,
	defaultBrowserStorage,
} from "../../../packages/ui/src/theme/theme-storage";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

function createMockStorage(
	initial: Record<string, string> = {}
): ThemeStorage & {
	readonly map: Map<string, string>;
} {
	const map = new Map<string, string>(Object.entries(initial));
	return {
		getItem: (key: string) => map.get(key) ?? null,
		map,
		setItem: (key: string, value: string) => {
			map.set(key, value);
		},
	};
}

describe("Theme storage adapter and resilience", () => {
	let container: HTMLDivElement;
	const roots = new Set<ReturnType<typeof createRoot>>();

	function mount(
		element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
	) {
		const node = container.appendChild(document.createElement("div"));
		const root = createRoot(node);
		roots.add(root);
		act(() => root.render(element));
		return root;
	}

	beforeEach(() => {
		container = document.body.appendChild(document.createElement("div"));
		window.localStorage.clear();
		document.documentElement.className = "";
		document.documentElement.removeAttribute("data-theme");
	});

	afterEach(() => {
		for (const root of roots) {
			act(() => root.unmount());
		}
		roots.clear();
		container.remove();
		window.localStorage.clear();
		document.documentElement.className = "";
		document.documentElement.removeAttribute("data-theme");
	});

	it("reads persisted dark preference from storage and applies to context", () => {
		let captured: ReturnType<typeof useTheme> | undefined;
		function Consumer() {
			captured = useTheme();
			return null;
		}

		const storage = createMockStorage({ "mizen-theme": "dark" });
		mount(createElement(ThemeProvider, { storage }, createElement(Consumer)));

		expect(captured?.theme).toBe("dark");
		expect(captured?.resolvedTheme).toBe("dark");
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	it("handles cross-tab storage event updates", () => {
		let captured: ReturnType<typeof useTheme> | undefined;
		function Consumer() {
			captured = useTheme();
			return null;
		}

		window.localStorage.setItem("mizen-theme", "light");
		mount(createElement(ThemeProvider, null, createElement(Consumer)));

		expect(captured?.theme).toBe("light");

		act(() => {
			window.localStorage.setItem("mizen-theme", "dark");
			window.dispatchEvent(
				new StorageEvent("storage", {
					key: "mizen-theme",
					newValue: "dark",
					storageArea: window.localStorage,
				})
			);
		});

		expect(captured?.theme).toBe("dark");
		expect(captured?.resolvedTheme).toBe("dark");
	});

	it("synchronizes separate provider instances using the same storage key in the same tab", () => {
		let firstCaptured: ReturnType<typeof useTheme> | undefined;
		let secondCaptured: ReturnType<typeof useTheme> | undefined;

		function FirstConsumer() {
			firstCaptured = useTheme();
			return null;
		}

		function SecondConsumer() {
			secondCaptured = useTheme();
			return null;
		}

		const storage = createMockStorage({ "sync-theme": "light" });

		mount(
			createElement(
				ThemeProvider,
				{ storage, storageKey: "sync-theme" },
				createElement(FirstConsumer)
			)
		);

		mount(
			createElement(
				ThemeProvider,
				{ storage, storageKey: "sync-theme" },
				createElement(SecondConsumer)
			)
		);

		expect(firstCaptured?.theme).toBe("light");
		expect(secondCaptured?.theme).toBe("light");

		act(() => {
			firstCaptured?.setTheme("dark");
		});

		expect(firstCaptured?.theme).toBe("dark");
		expect(secondCaptured?.theme).toBe("dark");
		expect(storage.getItem("sync-theme")).toBe("dark");
	});

	it("gracefully tolerates DOMException on storage access", () => {
		let captured: ReturnType<typeof useTheme> | undefined;
		function Consumer() {
			captured = useTheme();
			return null;
		}

		const failingStorage: ThemeStorage = {
			getItem: () => {
				throw new DOMException("Access denied", "SecurityError");
			},
			setItem: () => {
				throw new DOMException("Quota exceeded", "QuotaExceededError");
			},
		};

		expect(() => {
			mount(
				createElement(
					ThemeProvider,
					{ storage: failingStorage },
					createElement(Consumer)
				)
			);
		}).not.toThrow();

		expect(captured?.theme).toBe("system");

		expect(() => {
			act(() => {
				captured?.setTheme("dark");
			});
		}).not.toThrow();

		expect(captured?.theme).toBe("dark");
		expect(captured?.resolvedTheme).toBe("dark");
		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
	});

	it("retains dark root state when one of two active dark providers unmounts, and restores prior state on final unmount", () => {
		document.documentElement.setAttribute("data-theme", "light");
		document.documentElement.style.colorScheme = "light";
		document.documentElement.className = "pre-existing";

		const storage = createMockStorage({ "shared-key": "dark" });

		const root1 = mount(
			createElement(
				ThemeProvider,
				{ storage, storageKey: "shared-key" },
				createElement("div", null, "Provider 1")
			)
		);
		const root2 = mount(
			createElement(
				ThemeProvider,
				{ storage, storageKey: "shared-key" },
				createElement("div", null, "Provider 2")
			)
		);

		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(document.documentElement.style.colorScheme).toBe("dark");
		expect(document.documentElement.classList.contains("x15oam52")).toBe(true);
		expect(document.documentElement.classList.contains("pre-existing")).toBe(
			true
		);

		act(() => {
			root1.unmount();
		});
		roots.delete(root1);

		expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
		expect(document.documentElement.style.colorScheme).toBe("dark");
		expect(document.documentElement.classList.contains("x15oam52")).toBe(true);

		act(() => {
			root2.unmount();
		});
		roots.delete(root2);

		expect(document.documentElement.getAttribute("data-theme")).toBe("light");
		expect(document.documentElement.style.colorScheme).toBe("light");
		expect(document.documentElement.classList.contains("x15oam52")).toBe(false);
		expect(document.documentElement.classList.contains("pre-existing")).toBe(
			true
		);
	});

	it("invokes subscriber exactly once per setPreference call without duplicate notification from same-tab CustomEvent", () => {
		const storage = createMockStorage({ "dedup-theme": "light" });
		const store = createPreferenceStore(storage, "dedup-theme", "light");
		const subscriber = vi.fn();
		const unsubscribe = store.subscribe(subscriber);

		store.setPreference("dark");

		expect(subscriber).toHaveBeenCalledTimes(1);
		expect(store.getSnapshot()).toBe("dark");

		unsubscribe();
	});

	it("reconciles store B to dark when store A updates before B subscribes and notifies B exactly once", () => {
		const storage = createMockStorage({ "shared-sync": "light" });
		const storeA = createPreferenceStore(storage, "shared-sync", "light");
		const storeB = createPreferenceStore(storage, "shared-sync", "light");

		storeA.setPreference("dark");

		const subscriberB = vi.fn();
		const unsubscribeB = storeB.subscribe(subscriberB);

		expect(storeB.getSnapshot()).toBe("dark");
		expect(subscriberB).toHaveBeenCalledTimes(1);

		unsubscribeB();
	});

	it("does not synchronize stores backed by different adapters that share a key", () => {
		const firstStorage = createMockStorage({ shared: "light" });
		const secondStorage = createMockStorage({ shared: "light" });
		const firstStore = createPreferenceStore(firstStorage, "shared", "light");
		const secondStore = createPreferenceStore(secondStorage, "shared", "light");
		const secondSubscriber = vi.fn();
		const unsubscribeSecond = secondStore.subscribe(secondSubscriber);

		firstStore.setPreference("dark");

		expect(secondStore.getSnapshot()).toBe("light");
		expect(secondSubscriber).not.toHaveBeenCalled();

		unsubscribeSecond();
	});

	it("ignores native storage events for a custom adapter", () => {
		const storage = createMockStorage({ shared: "light" });
		const store = createPreferenceStore(storage, "shared", "light");
		const subscriber = vi.fn();
		const unsubscribe = store.subscribe(subscriber);

		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "shared",
				newValue: "dark",
				storageArea: window.localStorage,
			})
		);

		expect(store.getSnapshot()).toBe("light");
		expect(subscriber).not.toHaveBeenCalled();

		unsubscribe();
	});

	it("resets browser storage preference when another tab clears storage", () => {
		window.localStorage.setItem("clear-theme", "dark");
		const store = createPreferenceStore(
			defaultBrowserStorage,
			"clear-theme",
			"system"
		);
		const subscriber = vi.fn();
		const unsubscribe = store.subscribe(subscriber);

		window.localStorage.clear();
		window.dispatchEvent(
			new StorageEvent("storage", {
				key: null,
				newValue: null,
				storageArea: window.localStorage,
			})
		);

		expect(store.getSnapshot()).toBe("system");
		expect(subscriber).toHaveBeenCalledTimes(1);

		unsubscribe();
	});

	it("ignores browser storage events from another storage area", () => {
		window.localStorage.setItem("area-theme", "light");
		const store = createPreferenceStore(
			defaultBrowserStorage,
			"area-theme",
			"system"
		);
		const subscriber = vi.fn();
		const unsubscribe = store.subscribe(subscriber);

		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "area-theme",
				newValue: "dark",
				storageArea: window.sessionStorage,
			})
		);

		expect(store.getSnapshot()).toBe("light");
		expect(subscriber).not.toHaveBeenCalled();

		unsubscribe();
	});

	it("ignores browser storage events for another key", () => {
		window.localStorage.setItem("owned-theme", "light");
		const store = createPreferenceStore(
			defaultBrowserStorage,
			"owned-theme",
			"system"
		);
		const subscriber = vi.fn();
		const unsubscribe = store.subscribe(subscriber);

		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "other-theme",
				newValue: "dark",
				storageArea: window.localStorage,
			})
		);

		expect(store.getSnapshot()).toBe("light");
		expect(subscriber).not.toHaveBeenCalled();

		unsubscribe();
	});
});
