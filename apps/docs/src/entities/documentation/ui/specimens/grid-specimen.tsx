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
} from "@mizen-labs/ui";
import { SpecimenSection } from "./specimen-section";

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

export function GridSpecimen() {
	return (
		<SpecimenSection
			description="Four projects, arranged to fit the available space."
			primary
			title="Your projects"
		>
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
		</SpecimenSection>
	);
}
