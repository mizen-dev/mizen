import { initializeTheme as initialize } from "./initialize";
import {
	ThemeProvider as Provider,
	useTheme as useThemeHook,
} from "./theme-provider";
import { ThemeScript as Script } from "./theme-script";
import { isThemePreference as isPref } from "./types";

export type { ThemeInitializationOptions } from "./initialize";

export type {
	ResolvedTheme,
	ThemeContextValue,
	ThemePreference,
	ThemeProviderProps,
	ThemeScriptProps,
	ThemeStorage,
} from "./types";

export const isThemePreference = isPref;
export const ThemeProvider = Provider;
export const useTheme = useThemeHook;
export const ThemeScript = Script;

export const initializeTheme = initialize;
