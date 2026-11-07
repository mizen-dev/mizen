import type { ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeStorage {
	readonly getItem: (key: string) => string | null;
	readonly setItem: (key: string, value: string) => void;
}

export interface ThemeContextValue {
	readonly resolvedTheme: ResolvedTheme;
	readonly setTheme: (theme: ThemePreference) => void;
	readonly systemTheme: ResolvedTheme;
	readonly theme: ThemePreference;
}

export interface ThemeProviderProps {
	readonly children?: ReactNode;
	readonly defaultTheme?: ThemePreference;
	readonly storage?: ThemeStorage;
	readonly storageKey?: string;
}

export interface ThemeScriptProps {
	readonly defaultTheme?: ThemePreference;
	readonly nonce?: string;
	readonly storageKey?: string;
}

export function isThemePreference(value: unknown): value is ThemePreference {
	return value === "light" || value === "dark" || value === "system";
}
