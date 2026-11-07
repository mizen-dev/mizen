import {
	Avatar,
	AvatarFallback,
	Badge,
	Group,
	Inline,
	Text,
} from "@mizen-labs/ui";

export function ReleaseSummary() {
	return (
		<Inline>
			<Group>
				<Avatar size="sm">
					<AvatarFallback color="purple">MC</AvatarFallback>
				</Avatar>
				<Text size="ui">Maya Chen</Text>
			</Group>
			<Text size="ui" tone="muted">
				October 28
			</Text>
			<Text size="ui" tone="muted">
				4 min read
			</Text>
			<Badge variant="info">Feature</Badge>
		</Inline>
	);
}
