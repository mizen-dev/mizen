import { Badge, Group } from "@mizen/ui";

export function ProjectActions() {
	return (
		<Group>
			<Badge variant="info">In review</Badge>
			<Badge variant="outline">Design</Badge>
			<Badge variant="outline">Payments</Badge>
			<Badge variant="outline">Q3 launch</Badge>
		</Group>
	);
}
