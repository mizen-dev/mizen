"use client";

import { Button, Tooltip, TooltipPopup, TooltipTrigger } from "@mizen-labs/ui";
import { type ThemePreference, useTheme } from "@mizen-labs/ui/theme";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useCallback, useSyncExternalStore } from "react";

const modes = {
	dark: { icon: IconMoon, label: "Dark", next: "system" },
	light: { icon: IconSun, label: "Light", next: "dark" },
	system: { icon: IconDeviceDesktop, label: "System", next: "light" },
} as const satisfies Record<
	ThemePreference,
	{ icon: typeof IconSun; label: string; next: ThemePreference }
>;

const subscribe = () => () => undefined;

// Cycles System → Light → Dark. The stored choice is unknown on the server, so
// the icon waits for hydration rather than flashing the wrong mode.
export function ThemeToggle() {
	const { setTheme, theme } = useTheme();
	const hydrated = useSyncExternalStore<boolean>(
		subscribe,
		() => true,
		() => false
	);
	const { icon: Icon, label, next } = modes[theme];
	const cycle = useCallback(() => setTheme(next), [next, setTheme]);
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						aria-label={`Theme: ${label}`}
						onClick={cycle}
						size="icon-sm"
						variant="ghost"
					>
						{hydrated ? <Icon aria-hidden="true" size={18} /> : null}
					</Button>
				}
			/>
			<TooltipPopup side="bottom">Theme: {label}</TooltipPopup>
		</Tooltip>
	);
}
