"use client";

import {
	Badge,
	Button,
	darkTheme,
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	Frame,
	FrameDescription,
	FrameHeader,
	FramePanel,
	FrameTitle,
	Grid,
	Heading,
	Stack,
	StatusDot,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { IconFolder, IconSearch, IconUsers } from "@tabler/icons-react";
import { pageStyles } from "../../../page.styles";
import { SpecimenSection } from "./specimen-section";

function FolderIcon() {
	return <IconFolder aria-hidden="true" size="18" />;
}

function SearchIcon() {
	return <IconSearch aria-hidden="true" size="18" />;
}

function UsersIcon() {
	return <IconUsers aria-hidden="true" size="18" />;
}

export function EmptySpecimen() {
	return (
		<Stack gap="8">
			<SpecimenSection
				description="Standard empty presentation with stacked decorative back cards, title, description, and primary action."
				primary
				title="Canonical icon state"
			>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<FolderIcon />
						</EmptyMedia>
						<EmptyTitle>No repositories yet</EmptyTitle>
						<EmptyDescription>
							Create a new repository to start collaborating on code with your
							team.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button variant="brand">Create repository</Button>
					</EmptyContent>
				</Empty>
			</SpecimenSection>

			<SpecimenSection
				description="Presents multiple next steps arranged with layout primitives like Grid."
				title="Composed actions"
			>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<FolderIcon />
						</EmptyMedia>
						<EmptyTitle>Get started with your project</EmptyTitle>
						<EmptyDescription>
							Import an existing git repository or start from a scaffolded
							template.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Grid>
							<Button variant="brand">Create project</Button>
							<Button variant="outline">Import repository</Button>
						</Grid>
					</EmptyContent>
				</Empty>
			</SpecimenSection>

			<SpecimenSection
				description="Renders plain non-icon media composed from existing Mizen primitives."
				title="Default media visual"
			>
				<Empty>
					<EmptyHeader>
						<EmptyMedia aria-hidden={false} variant="default">
							<Badge size="lg" variant="secondary">
								<StatusDot aria-hidden="true" label="Ready" variant="accent" />
								Workspace ready
							</Badge>
						</EmptyMedia>
						<EmptyTitle>No active deployments</EmptyTitle>
						<EmptyDescription>
							Deploy your first build to see live performance telemetry and
							logs.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button variant="outline">Trigger build</Button>
					</EmptyContent>
				</Empty>
			</SpecimenSection>

			<SpecimenSection
				canvas={false}
				description="Composes inside a Frame panel using Mizen's compound layout components."
				title="Framed composition"
			>
				<div
					data-testid="empty-dark-theme"
					{...props(darkTheme as never, pageStyles.themePanel as never)}
				>
					<Frame>
						<FrameHeader>
							<FrameTitle>Team members</FrameTitle>
							<FrameDescription>
								Manage your workspace collaborators and permissions.
							</FrameDescription>
						</FrameHeader>
						<FramePanel>
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<UsersIcon />
									</EmptyMedia>
									<EmptyTitle>No team members yet</EmptyTitle>
									<EmptyDescription>
										Invite colleagues to begin reviewing pull requests and
										collaborating.
									</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
									<Button variant="secondary">Invite member</Button>
								</EmptyContent>
							</Empty>
						</FramePanel>
					</Frame>
				</div>
			</SpecimenSection>

			<SpecimenSection
				description="Configures semantic heading levels (such as h4) and dynamic status announcements for filtered search results."
				title="Semantic level and dynamic status"
			>
				<Heading level={3}>Filtered query feedback</Heading>
				<Empty aria-live="polite" role="status">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<SearchIcon />
						</EmptyMedia>
						<EmptyTitle level={4}>No matching records found</EmptyTitle>
						<EmptyDescription>
							No records matched your current query filter. Clear your search to
							view all items.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button variant="outline">Reset filters</Button>
					</EmptyContent>
				</Empty>
			</SpecimenSection>
		</Stack>
	);
}
