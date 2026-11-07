import { applyRootTheme } from "./theme-root";
import {
	DEFAULT_STORAGE_KEY,
	DEFAULT_THEME_PREFERENCE,
	defaultBrowserStorage,
	getSystemSnapshot,
	readStorage,
} from "./theme-storage";
import {
	isThemePreference,
	type ResolvedTheme,
	type ThemeProviderProps,
} from "./types";

export type ThemeInitializationOptions = Omit<ThemeProviderProps, "children">;

/** Apply the initial client theme before createRoot renders. ThemeProvider owns later updates. */
export function initializeTheme({
	storageKey = DEFAULT_STORAGE_KEY,
	defaultTheme = DEFAULT_THEME_PREFERENCE,
	storage = defaultBrowserStorage,
}: ThemeInitializationOptions = {}): ResolvedTheme | null {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return null;
	}
	const saved = readStorage(storage, storageKey);
	const preference = isThemePreference(saved) ? saved : defaultTheme;
	const resolved = preference === "system" ? getSystemSnapshot() : preference;
	applyRootTheme(resolved);
	return resolved;
}
