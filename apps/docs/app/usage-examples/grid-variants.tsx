import {
	Badge,
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
	Grid,
	Inline,
	Stack,
	Text,
} from "@mizen/ui";

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
			<Grid>
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
