import { VisuallyHidden } from "@mizen-labs/ui/visually-hidden";
import { useRouterState } from "@tanstack/react-router";

export function NavigationProgress() {
	const pending = useRouterState({
		select: (state) => state.status === "pending",
	});
	return (
		<div role="status">
			{pending && (
				<div
					className="docs-navigation-progress"
					data-slot="navigation-progress"
				>
					<progress aria-label="Loading page" />
					<VisuallyHidden>Loading page</VisuallyHidden>
				</div>
			)}
		</div>
	);
}
