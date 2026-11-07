"use client";

import { isThemePreference, useTheme } from "@mizen/ui/theme";
import { useCallback } from "react";

export function ThemeSelect() {
	const { setTheme, theme } = useTheme();
	const handleChange = useCallback(
		(event) => {
			if (isThemePreference(event.target.value)) {
				setTheme(event.target.value);
			}
		},
		[setTheme]
	);

	return (
		<label>
			Theme
			<select
				aria-label="Theme preference"
				data-testid="theme-select"
				onChange={handleChange}
				value={theme}
			>
				<option value="system">System</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</label>
	);
}
