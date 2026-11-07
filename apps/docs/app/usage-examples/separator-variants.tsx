import { Heading, Inline, Separator, Stack, Text } from "@mizen/ui";

export function SeparatorAccountDetailsExample1() {
	return (
		<Stack gap="4">
			<Stack gap="2">
				<Heading level={4}>Maya Chen</Heading>
				<Text size="ui" tone="muted">
					maya@example.com
				</Text>
			</Stack>
			<Separator />
			<Stack gap="2">
				<Text>Product team</Text>
				<Text size="ui" tone="muted">
					Workspace administrator
				</Text>
			</Stack>
			<Separator />
			<Inline>
				<Text size="ui" tone="muted">
					Active session
				</Text>
				<Text size="ui" tone="muted">
					·
				</Text>
				<Text size="ui" tone="muted">
					This device
				</Text>
			</Inline>
		</Stack>
	);
}
