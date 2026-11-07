import type { ReactNode } from "react";
import { DocsShell } from "../../docs-shell";

export default function Layout({ children }: { children: ReactNode }) {
	return <DocsShell>{children}</DocsShell>;
}
