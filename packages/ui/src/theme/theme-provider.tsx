"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	useSyncExternalStore,
} from "react";
import { applyRootTheme } from "./theme-root";
import {
	createPreferenceStore,
	DEFAULT_STORAGE_KEY,
	DEFAULT_THEME_PREFERENCE,
	defaultBrowserStorage,
	getServerSystemSnapshot,
	getSystemSnapshot,
	subscribeSystem,
} from "./theme-storage";
import { getDarkThemeTokens } from "./theme-tokens";
import { cleanThemeTransitionGuard } from "./theme-transition-guard";
import type {
	ResolvedTheme,
	ThemeContextValue,
	ThemePreference,
	ThemeProviderProps,
} from "./types";

interface RootSnapshot {
	readonly colorScheme: string;
	readonly dataTheme: string | null;
	readonly initialDarkTokens: ReadonlySet<string>;
}

interface ActiveProvider {
	readonly id: symbol;
	readonly theme: ResolvedTheme;
}

let activeProviders: ActiveProvider[] = [];
let rootSnapshot: RootSnapshot | null = null;

function captureRootSnapshot(): RootSnapshot {
	const root = document.documentElement;
	const darkTokens = getDarkThemeTokens();
	const initialDarkTokens = new Set<string>();
	for (const token of darkTokens) {
		if (root.classList.contains(token)) {
			initialDarkTokens.add(token);
		}
	}
	return {
		colorScheme: root.style.colorScheme,
		dataTheme: root.getAttribute("data-theme"),
		initialDarkTokens,
	};
}

function restoreRootSnapshot(snapshot: RootSnapshot): void {
	const root = document.documentElement;
	if (snapshot.dataTheme === null) {
		root.removeAttribute("data-theme");
	} else {
		root.setAttribute("data-theme", snapshot.dataTheme);
	}
	root.style.colorScheme = snapshot.colorScheme;
	const darkTokens = getDarkThemeTokens();
	for (const token of darkTokens) {
		if (snapshot.initialDarkTokens.has(token)) {
			root.classList.add(token);
		} else {
			root.classList.remove(token);
		}
	}
}

function registerOrUpdateProvider(id: symbol, theme: ResolvedTheme): void {
	if (activeProviders.length === 0) {
		rootSnapshot = captureRootSnapshot();
	}
	activeProviders = activeProviders.filter((entry) => entry.id !== id);
	activeProviders.push({ id, theme });
	applyRootTheme(theme);
}

function unregisterProvider(id: symbol): void {
	activeProviders = activeProviders.filter((entry) => entry.id !== id);
	if (activeProviders.length === 0) {
		if (rootSnapshot !== null) {
			restoreRootSnapshot(rootSnapshot);
			rootSnapshot = null;
		}
		cleanThemeTransitionGuard();
		return;
	}
	const latest = activeProviders.at(-1);
	if (latest) {
		applyRootTheme(latest.theme);
	}
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
	children,
	defaultTheme = DEFAULT_THEME_PREFERENCE,
	storageKey = DEFAULT_STORAGE_KEY,
	storage,
}: ThemeProviderProps) {
	const effectiveStorage = storage ?? defaultBrowserStorage;
	const [providerId] = useState(() => Symbol("ThemeProvider"));

	const store = useMemo(
		() => createPreferenceStore(effectiveStorage, storageKey, defaultTheme),
		[effectiveStorage, storageKey, defaultTheme]
	);

	// <html> follows the store and the system query inside their own
	// subscriptions, so a change lands before React re-renders. Unsubscribing
	// hands the root back to the next provider, or restores it.
	const subscribeRoot = useCallback(
		(onStoreChange: () => void) => {
			const apply = () => {
				const preference = store.getSnapshot();
				registerOrUpdateProvider(
					providerId,
					preference === "system" ? getSystemSnapshot() : preference
				);
			};
			const onChange = () => {
				apply();
				onStoreChange();
			};
			apply();
			const stopStore = store.subscribe(onChange);
			const stopSystem = subscribeSystem(onChange);
			return () => {
				stopStore();
				stopSystem();
				unregisterProvider(providerId);
			};
		},
		[providerId, store]
	);

	const theme = useSyncExternalStore(
		subscribeRoot,
		store.getSnapshot,
		store.getServerSnapshot
	);

	const systemTheme = useSyncExternalStore(
		subscribeSystem,
		getSystemSnapshot,
		getServerSystemSnapshot
	);

	const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

	const setTheme = useCallback(
		(next: ThemePreference) => {
			store.setPreference(next);
		},
		[store]
	);

	const value = useMemo<ThemeContextValue>(
		() => ({
			resolvedTheme,
			setTheme,
			systemTheme,
			theme,
		}),
		[resolvedTheme, setTheme, systemTheme, theme]
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext);
	if (context === null) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
