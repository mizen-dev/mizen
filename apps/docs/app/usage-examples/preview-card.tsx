import {
	PreviewCard,
	PreviewCardPopup,
	PreviewCardTrigger,
	Text,
} from "@mizen/ui";

export function DocumentationPreview() {
	return (
		<Text>
			Read about{" "}
			<PreviewCard>
				<PreviewCardTrigger href="/components/card">
					Card composition
				</PreviewCardTrigger>
				<PreviewCardPopup>
					<Text size="ui" tone="muted">
						Compose a header, panel, and footer around related content.
					</Text>
				</PreviewCardPopup>
			</PreviewCard>{" "}
			before grouping workspace settings.
		</Text>
	);
}
