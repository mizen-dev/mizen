import { props } from "@stylexjs/stylex";
import { darkTheme } from "../styles/themes";

const WHITESPACE_REGEX = /\s+/;

export function getDarkThemeTokens(): readonly string[] {
	const result = props(darkTheme);
	const className =
		typeof result.className === "string" ? result.className : "";
	return className.split(WHITESPACE_REGEX).filter(Boolean);
}
