import { props } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { NavigationProgress } from "../../../features/navigation-progress/ui/navigation-progress";
import { shellStyles } from "../../../shared/styles/docs-shell.styles";
import { ActiveComponentNavigation } from "./active-component-navigation";
import { SiteHeader } from "./site-header";

export function DocsShell({ children }: { children: ReactNode }) {
	return (
		<div data-slot="docs-shell" {...props(shellStyles.shell)}>
			<SiteHeader docs />
			<NavigationProgress />
			<div {...props(shellStyles.body)}>
				<aside
					data-slot="desktop-sidebar"
					{...props(shellStyles.desktopSidebar)}
				>
					<ActiveComponentNavigation aside />
				</aside>
				<div {...props(shellStyles.main)}>{children}</div>
			</div>
		</div>
	);
}
