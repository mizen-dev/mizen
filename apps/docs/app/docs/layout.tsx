import { props } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { docsStyles } from "../components/docs.styles";
import { DocsShell } from "../docs-shell";
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
