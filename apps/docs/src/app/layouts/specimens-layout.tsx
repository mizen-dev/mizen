import type { ReactNode } from "react";
import { DocsShell } from "../../widgets/site-shell/ui/docs-shell";
export default function SpecimenLayout({ children }: { children: ReactNode }) {
	return <DocsShell>{children}</DocsShell>;
}
