import type { JSX } from "react";
import { DEFAULT_STORAGE_KEY, DEFAULT_THEME_PREFERENCE } from "./theme-storage";
import { getDarkThemeTokens } from "./theme-tokens";
import type { ThemePreference, ThemeScriptProps } from "./types";

function safeJson(value: unknown): string {
	return JSON.stringify(value).replace(/</gu, "\\u003c");
}

function buildThemeScript(
	storageKey: string,
	defaultTheme: ThemePreference,
	darkClasses: readonly string[]
): string {
	const k = safeJson(storageKey);
	const d = safeJson(defaultTheme);
	const c = safeJson(darkClasses);

	return `(function(){try{var k=${k};var d=${d};var c=${c};var p=null;try{p=localStorage.getItem(k)}catch(e){}var t=(p==="light"||p==="dark"||p==="system")?p:d;var m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var isDark=t==="dark"||(t==="system"&&m);var r=isDark?"dark":"light";var el=document.documentElement;el.setAttribute("data-theme",r);el.style.colorScheme=r;if(isDark){for(var i=0;i<c.length;i++){if(c[i])el.classList.add(c[i])}}else{for(var i=0;i<c.length;i++){if(c[i])el.classList.remove(c[i])}}}catch(e){}})()`;
}

export function ThemeScript({
	defaultTheme = DEFAULT_THEME_PREFERENCE,
	nonce,
	storageKey = DEFAULT_STORAGE_KEY,
}: ThemeScriptProps): JSX.Element {
	const darkClasses = getDarkThemeTokens();
	const scriptCode = buildThemeScript(storageKey, defaultTheme, darkClasses);

	return (
		<script nonce={nonce} suppressHydrationWarning>
			{scriptCode}
		</script>
	);
}
