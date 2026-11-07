import { ScrollArea } from "@base-ui/react/scroll-area";
import type { ReactNode } from "react";
import { presentation } from "./composer.styles";

/** Closed scroll regions: Base UI owns measurement and scrollbar lifetimes. */
export function ComposerScrollArea({
	children,
	region,
}: {
	children: ReactNode;
	region: "draft" | "suggestions";
}) {
	const draft = region === "draft";
	return (
		<ScrollArea.Root
			{...presentation(draft ? "scroll" : "listScroll")}
			data-slot={draft ? "composer-scroll-area" : "composer-suggestions-scroll"}
		>
			<ScrollArea.Viewport data-slot="composer-viewport">
				<ScrollArea.Content data-slot="composer-content">
					{children}
				</ScrollArea.Content>
			</ScrollArea.Viewport>
			<ScrollArea.Scrollbar {...presentation("scrollbar")}>
				<ScrollArea.Thumb {...presentation("thumb")} />
			</ScrollArea.Scrollbar>
		</ScrollArea.Root>
	);
}
