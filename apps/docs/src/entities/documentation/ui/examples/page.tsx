import {
	Badge,
	Button,
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
	Grid,
	Inline,
	Page,
	PageAction,
	PageDescription,
	PageHeader,
	PageTitle,
	Section,
	SectionDescription,
	SectionHeader,
	SectionTitle,
	Stack,
} from "@mizen-labs/ui";

const projects = [
	{
		name: "Northstar launch",
		status: "In progress",
		summary: "Coordinate the autumn release.",
	},
	{
		name: "Field notes",
		status: "In review",
		summary: "Turn customer feedback into next steps.",
	},
	{
		name: "Website refresh",
		status: "Planning",
		summary: "Make the product easier to discover.",
	},
	{
		name: "Design system",
		status: "In review",
		summary: "Build a calmer, more consistent workspace.",
	},
];

export function ProjectsPage() {
	return (
		<Page>
			<PageHeader>
				<PageTitle>Projects</PageTitle>
				<PageDescription>Everything your team ships.</PageDescription>
				<PageAction>
					<Button variant="brand">New project</Button>
				</PageAction>
			</PageHeader>
			<Section aria-labelledby="projects-active-title">
				<SectionHeader>
					<SectionTitle id="projects-active-title">Active</SectionTitle>
					<SectionDescription>Updated this week.</SectionDescription>
				</SectionHeader>
				<Grid gap="4">
					{projects.map((project) => (
						<Card key={project.name}>
							<CardHeader>
								<Stack gap="3">
									<Inline>
										<Badge variant="outline">{project.status}</Badge>
									</Inline>
									<Stack gap="1">
										<CardTitle>{project.name}</CardTitle>
										<CardDescription>{project.summary}</CardDescription>
									</Stack>
								</Stack>
							</CardHeader>
						</Card>
					))}
				</Grid>
			</Section>
		</Page>
	);
}
