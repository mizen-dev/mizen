import type { ComponentType } from "react";
// The theme file `mizen init --preset vivid` writes into an application.
import vividTheme from "../../../../../../../packages/cli/presets/vivid.css?url";
import { App as Dashboard } from "./dashboard/app";

export const apps: Record<string, { App: ComponentType; theme: string }> = {
	dashboard: { App: Dashboard, theme: vividTheme },
};
