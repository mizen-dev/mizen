import { Stack, Text } from "@mizen-labs/ui";

export function ReadingText() {
	return (
		<Stack gap="3">
			<Text size="ui" tone="muted">
				Updated October 28 · 3 min read
			</Text>
			<Text>
				A saved view keeps your filters, sort order, and columns. Open it from
				the sidebar to pick up where you left off.
			</Text>
			<Text size="caption" tone="muted">
				Shared views need edit access on a paid plan.
			</Text>
		</Stack>
	);
}
