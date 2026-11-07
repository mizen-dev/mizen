import { props } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { ActiveComponentNavigation } from "./active-component-navigation";
import { shellStyles } from "./docs-shell.styles";
import { SiteHeader } from "./site-header";

export function DocsShell({ children }: { children: ReactNode }) {
	return (
		<div data-slot="docs-shell" {...props(shellStyles.shell)}>
			<SiteHeader docs />
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
