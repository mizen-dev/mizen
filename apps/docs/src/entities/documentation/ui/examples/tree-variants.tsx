"use client";
import { Heading, Stack, Text, Tree } from "@mizen-labs/ui";
import { useState } from "react";

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
export function TreeSelectedResourceExample1() {
	const [selected, setSelected] = useState<string | null>("reports");
	return (
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
	);
}
