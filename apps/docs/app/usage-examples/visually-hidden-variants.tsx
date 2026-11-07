import { Stack, Text, VisuallyHidden } from "@mizen-labs/ui";

export function VisuallyHiddenInboxExample1() {
	return (
		<Stack gap="4">
			<Stack gap="2">
				<Text data-testid="notification-count">
					Inbox: 4 <VisuallyHidden>unread notifications</VisuallyHidden>
				</Text>
			</Stack>
		</Stack>
	);
}
