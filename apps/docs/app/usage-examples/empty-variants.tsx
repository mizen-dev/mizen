"use client";
import {
	Badge,
	Button,
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
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { IconFolder, IconSearch, IconUsers } from "@tabler/icons-react";
import { pageStyles } from "../page.styles";

function FolderIcon() {
	return <IconFolder aria-hidden="true" size="18" />;
}
function SearchIcon() {
	return <IconSearch aria-hidden="true" size="18" />;
}
function UsersIcon() {
	return <IconUsers aria-hidden="true" size="18" />;
}
export function EmptyCanonicalIconStateExample1() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
export function EmptyComposedActionsExample2() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
export function EmptyDefaultMediaVisualExample3() {
	return (
		<Stack gap="4">
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
						Deploy your first build to see live performance telemetry and logs.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="outline">Trigger build</Button>
				</EmptyContent>
			</Empty>
		</Stack>
	);
}
export function EmptyFramedCompositionExample4() {
	return (
		<Stack gap="4">
			<div
				data-testid="empty-framed-composition"
				{...props(pageStyles.themePanel as never)}
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
		</Stack>
	);
}
export function EmptySemanticLevelAndDynamicStatusExample5() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
