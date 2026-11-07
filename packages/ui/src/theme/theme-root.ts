import { getDarkThemeTokens } from "./theme-tokens";
import {
	applyThemeTransitionGuard,
	finishThemeTransitionGuard,
} from "./theme-transition-guard";
import type { ResolvedTheme } from "./types";

export function applyRootTheme(theme: ResolvedTheme): void {
	const root = document.documentElement;
	const currentTheme = root.getAttribute("data-theme");
	const isThemeChange =
		(currentTheme === "light" && theme === "dark") ||
		(currentTheme === "dark" && theme === "light");

	if (isThemeChange) {
		applyThemeTransitionGuard();
	}

	if (root.getAttribute("data-theme") !== theme) {
		root.setAttribute("data-theme", theme);
	}
	if (root.style.colorScheme !== theme) {
		root.style.colorScheme = theme;
	}
	const darkTokens = getDarkThemeTokens();
	if (darkTokens.length > 0) {
		if (theme === "dark") {
			root.classList.add(...darkTokens);
		} else {
			root.classList.remove(...darkTokens);
		}
	}

	if (isThemeChange) {
		finishThemeTransitionGuard();
	}
}
