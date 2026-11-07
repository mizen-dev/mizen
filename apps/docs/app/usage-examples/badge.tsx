import { Badge, Inline } from "@mizen-labs/ui";

export function ReleaseBadge() {
	return (
		<Inline>
			<Badge variant="success">Shipped</Badge>
			<Badge variant="info">In review</Badge>
			<Badge variant="warning">Blocked</Badge>
			<Badge variant="secondary">Draft</Badge>
		</Inline>
	);
}
