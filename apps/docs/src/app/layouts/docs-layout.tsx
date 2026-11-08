import { props } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { docsStyles } from "../../shared/ui/docs.styles";
import { DocsShell } from "../../widgets/site-shell/ui/docs-shell";
export default function DocumentationLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<DocsShell>
			<div {...props(docsStyles.workspace)}>{children}</div>
		</DocsShell>
	);
}
