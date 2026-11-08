"use client";

import {
	ActivityFeed,
	ActivityFeedContent,
	ActivityFeedItem,
	ActivityFeedTime,
	Badge,
	Heading,
	ListItem,
	OverflowList,
	PropertyList,
	PropertyListItem,
	PropertyListLabel,
	PropertyListValue,
	Stack,
	Text,
	Tree,
} from "@mizen-labs/ui";
import { useState } from "react";
import { PreviewWorkspace } from "../../../../shared/ui/preview-workspace";

const files = [
	{
		children: [
			{
				children: [
					{ id: "tokens", label: "Tokens" },
					{ id: "components", label: "Components" },
				],
				id: "design",
				label: "Design",
			},
			{ id: "reports", label: "Reports" },
			{ disabled: true, id: "archive", label: "Archive" },
		],
		id: "workspace",
		label: "Workspace",
	},
	{ id: "shared", label: "Shared resources" },
] as const;

const events = [
	{
		action: "published the updated component library.",
		actor: "Maya",
		dateTime: "2026-10-07T09:20:00Z",
		id: "published",
		time: "7 October 2026, 14:20",
	},
	{
		action: "reviewed the new input states.",
		actor: "Alex",
		dateTime: "2026-10-07T08:45:00Z",
		id: "reviewed",
		time: "7 October 2026, 13:45",
	},
	{
		action: "created the design review.",
		actor: "Maya",
		dateTime: "2026-10-06T11:00:00Z",
		id: "created",
		time: "6 October 2026, 16:00",
	},
] as const;

function MetadataExamples() {
	return (
		<PreviewWorkspace
			testId="metadata-example"
			title="Resource metadata"
			titleId="metadata-heading"
		>
			<Stack gap="3">
				<PropertyList aria-label="Release metadata">
					<PropertyListItem>
						<PropertyListLabel>Release</PropertyListLabel>
						<PropertyListValue>Mizen 0.1</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Owner</PropertyListLabel>
						<PropertyListValue>Design systems</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Status</PropertyListLabel>
						<PropertyListValue>
							<Badge variant="secondary">In review</Badge>
						</PropertyListValue>
					</PropertyListItem>
				</PropertyList>
			</Stack>
		</PreviewWorkspace>
	);
}

export function TreeExamples() {
	const [selected, setSelected] = useState<string | null>("reports");
	return (
		<PreviewWorkspace
			testId="tree-example"
			title="Resource tree"
			titleId="tree-heading"
		>
			<Stack gap="3">
				<Text size="ui" tone="muted">
					Use arrow keys to explore folders. Type a name to find an item.
				</Text>
				<Tree
					aria-label="Workspace files"
					defaultExpandedItems={["workspace"]}
					items={files}
					onSelectedItemIdChange={setSelected}
					selectedItemId={selected}
				/>
				<Heading level={4}>Selected resource</Heading>
				<Text aria-live="polite">{selected || "No resource selected"}</Text>
				<Text size="ui" tone="muted">
					Workspace resources are shared with the Product team.
				</Text>
			</Stack>
		</PreviewWorkspace>
	);
}

export function OverflowListExamples() {
	return (
		<PreviewWorkspace
			testId="overflow-example"
			title="Release contributors"
			titleId="overflow-heading"
		>
			<Stack gap="3">
				<OverflowList
					aria-label="Contributors"
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
					<ListItem>
						<Badge variant="secondary">Rin Tanaka</Badge>
					</ListItem>
				</OverflowList>
			</Stack>
		</PreviewWorkspace>
	);
}

export function ActivityFeedExamples() {
	return (
		<PreviewWorkspace
			testId="activity-example"
			title="Recent activity"
			titleId="activity-heading"
		>
			<Stack gap="3">
				<ActivityFeed aria-label="Release activity">
					{events.map((event) => (
						<ActivityFeedItem key={event.id}>
							<ActivityFeedContent>
								<Text>
									<strong>{event.actor}</strong> {event.action}
								</Text>
							</ActivityFeedContent>
							<ActivityFeedTime dateTime={event.dateTime}>
								{event.time}
							</ActivityFeedTime>
						</ActivityFeedItem>
					))}
				</ActivityFeed>
			</Stack>
		</PreviewWorkspace>
	);
}

export function DataSystemsComposition() {
	return (
		<Stack gap="4">
			<MetadataExamples />
			<TreeExamples />
			<OverflowListExamples />
			<ActivityFeedExamples />
		</Stack>
	);
}
