import { List, ListContent, ListItem, Text } from "@mizen-labs/ui";

export function ProjectList() {
	return (
		<List aria-label="Recent projects">
			<ListItem>
				<ListContent>
					<Text size="ui">Design system</Text>
					<Text size="ui" tone="muted">
						Updated 10 October 2026 · Maya Chen
					</Text>
				</ListContent>
			</ListItem>
			<ListItem>
				<ListContent>
					<Text size="ui">Documentation</Text>
					<Text size="ui" tone="muted">
						Updated 9 October 2026 · Alex Rivera
					</Text>
				</ListContent>
			</ListItem>
		</List>
	);
}
