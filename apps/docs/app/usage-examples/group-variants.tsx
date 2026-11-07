"use client";
import { Button, Heading, Stack, Text } from "@mizen/ui";
import { Group } from "@mizen/ui/group";
import { useCallback, useState } from "react";

export function GroupWorkspaceChangesExample1() {
	const [status, setStatus] = useState("Local changes · Not saved");
	const save = useCallback(
		() => setStatus("Workspace changes saved in this preview."),
		[]
	);
	const duplicate = useCallback(
		() => setStatus("Deployment duplicated in this preview."),
		[]
	);
	const revert = useCallback(
		() => setStatus("Working tree restored in this preview."),
		[]
	);
	return (
		<Stack gap="4">
			<Heading level={4}>Northstar launch</Heading>
			<Text size="ui" tone="muted">
				Production workspace · Three files changed
			</Text>
			<Group>
				<Button onClick={save} variant="brand">
					Save workspace changes
				</Button>
				<Button onClick={duplicate} variant="secondary">
					Duplicate deployment
				</Button>
				<Button onClick={revert} variant="ghost">
					Revert working tree
				</Button>
			</Group>
			<Text aria-live="polite" size="ui" tone="muted">
				{status}
			</Text>
		</Stack>
	);
}
