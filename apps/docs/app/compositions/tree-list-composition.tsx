"use client";

import { Heading, Section, Stack, Text, Tree } from "@mizen-labs/ui";
import { useState } from "react";

const workspaceItems = [
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
];

const favoriteItems = [
	{
		children: [
			{ id: "research", label: "Research" },
			{ id: "planning", label: "Planning" },
			{ disabled: true, id: "writing", label: "Writing · Offline" },
		],
		id: "favorites",
		label: "Favorites",
	},
];

const itemLabels: Record<string, string> = {
	archive: "Archive",
	components: "Components",
	design: "Design",
	reports: "Reports",
	shared: "Shared resources",
	tokens: "Tokens",
	workspace: "Workspace",
};

export function TreeListExamples() {
	const [selectedItemId, setSelectedItemId] = useState<string | null>(
		"components"
	);
	const selectedLabel = selectedItemId ? itemLabels[selectedItemId] : undefined;

	return (
		<Section
			aria-labelledby="tree-list-heading"
			data-testid="tree-list-example"
		>
			<Stack gap="3">
				<Heading id="tree-list-heading" level={2} size="title">
					Selectable resource tree
				</Heading>
				<Text size="ui" tone="muted">
					Focus and selection are separate. Use arrow keys to navigate, then
					press Enter or Space to select.
				</Text>
				<Tree
					aria-label="Workspace files, controlled selection"
					defaultExpandedItems={["workspace", "design"]}
					items={workspaceItems}
					onSelectedItemIdChange={setSelectedItemId}
					selectedItemId={selectedItemId}
				/>
				<Text>
					Selected resource: {selectedLabel ?? "No resource selected"}
				</Text>
				<Tree
					aria-label="Favorite resources, uncontrolled selection"
					defaultExpandedItems={["favorites"]}
					defaultSelectedItemId={null}
					items={favoriteItems}
				/>
			</Stack>
		</Section>
	);
}
