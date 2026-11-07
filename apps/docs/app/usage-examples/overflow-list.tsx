import { Badge, ListItem, OverflowList } from "@mizen-labs/ui";

export function Contributors() {
	return (
		<OverflowList
			aria-label="Release contributors"
			overflowLabel="More contributors"
			visibleCount={2}
		>
			<ListItem>
				<Badge variant="secondary">Maya Chen</Badge>
			</ListItem>
			<ListItem>
				<Badge variant="secondary">Alex Rivera</Badge>
			</ListItem>
			<ListItem>
				<Badge variant="secondary">Sam Jordan</Badge>
			</ListItem>
		</OverflowList>
	);
}
