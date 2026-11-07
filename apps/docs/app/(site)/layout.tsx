import { props } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { shellStyles } from "../docs-shell.styles";
import { SiteHeader } from "../site-header";
export default function SiteLayout({ children }: { children: ReactNode }) {
	return (
		<div {...props(shellStyles.shell, shellStyles.siteShell)}>
			<SiteHeader />
			{children}
		</div>
	);
}
