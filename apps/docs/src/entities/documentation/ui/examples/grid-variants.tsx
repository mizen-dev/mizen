import {
	Badge,
	Card,
	CardDescription,
	CardHeader,
	CardPanel,
	CardTitle,
	Grid,
	Inline,
	PropertyList,
	PropertyListItem,
	PropertyListLabel,
	PropertyListValue,
	Stack,
	Text,
} from "@mizen-labs/ui";

const projects = [
	{
		name: "Northstar launch",
		owner: "Maya Chen",
		status: "In progress",
		summary: "Coordinate the autumn release.",
	},
	{
		name: "Field notes",
		owner: "Nadia Ilyin",
		status: "In progress",
		summary: "Turn customer feedback into clear next steps.",
	},
	{
		name: "Website refresh",
		owner: "Alex Morgan",
		status: "Planning",
		summary: "Make the product easier to discover.",
	},
	{
		name: "Design system",
		owner: "Sam Lee",
		status: "In review",
		summary: "Build a calmer, more consistent workspace.",
	},
];
export function GridYourProjectsExample1() {
	return (
		<Stack gap="4">
			<Grid columns="auto" gap="4">
				{projects.map((project) => (
					<Card key={project.name}>
						<CardHeader>
							<Stack gap="3">
								<Inline>
									<Badge variant="outline">{project.status}</Badge>
								</Inline>
								<CardTitle>{project.name}</CardTitle>
								<CardDescription>{project.summary}</CardDescription>
								<Text size="ui" tone="muted">
									Owned by {project.owner}
								</Text>
							</Stack>
						</CardHeader>
					</Card>
				))}
			</Grid>
		</Stack>
	);
}

export function GridMainAsideExample2() {
	return (
		<Grid columns="2:1" gap="4">
			<Card>
				<CardHeader>
					<CardTitle>Release notes</CardTitle>
					<CardDescription>Northstar 2.8.0</CardDescription>
				</CardHeader>
				<CardPanel>
					<Text>
						This release makes the workspace calmer. Navigation is quieter,
						tables are easier to scan, and forms explain their errors in place.
					</Text>
				</CardPanel>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Details</CardTitle>
				</CardHeader>
				<CardPanel>
					<PropertyList aria-label="Release details">
						<PropertyListItem>
							<PropertyListLabel>Owner</PropertyListLabel>
							<PropertyListValue>Maya Chen</PropertyListValue>
						</PropertyListItem>
						<PropertyListItem>
							<PropertyListLabel>Status</PropertyListLabel>
							<PropertyListValue>In review</PropertyListValue>
						</PropertyListItem>
					</PropertyList>
				</CardPanel>
			</Card>
		</Grid>
	);
}
