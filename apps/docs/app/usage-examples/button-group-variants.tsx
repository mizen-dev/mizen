"use client";
import { Button, ButtonGroup, Heading, Stack, Text } from "@mizen/ui";
import { useCallback, useState } from "react";

export function ButtonGroupPublishAReleaseExample1() {
	const [status, setStatus] = useState("Draft · Ready for review");
	const publish = useCallback(
		() => setStatus("Release published in this preview."),
		[]
	);
	const save = useCallback(() => setStatus("Draft saved in this preview."), []);
	return (
		<Stack gap="4">
			<Heading level={4}>A calmer workspace</Heading>
			<Text size="ui" tone="muted">
				Northstar launch · Release notes
			</Text>
			<ButtonGroup aria-label="Publication actions">
				<Button onClick={publish}>Publish</Button>
				<Button disabled>Schedule</Button>
				<Button onClick={save} variant="secondary">
					Save draft
				</Button>
			</ButtonGroup>
			<Text aria-live="polite" size="ui" tone="muted">
				{status}
			</Text>
		</Stack>
	);
}
export function ButtonGroupEditHistoryExample2() {
	return (
		<Stack>
			<Heading level={3}>Edit history</Heading>
			<Text size="ui" tone="muted">
				Keep reversible actions in one group.
			</Text>
			<ButtonGroup aria-label="History actions">
				<Button size="sm" variant="outline">
					Undo
				</Button>
				<Button size="sm" variant="outline">
					Redo
				</Button>
			</ButtonGroup>
		</Stack>
	);
}
export function ButtonGroupFileActionsExample3() {
	return (
		<Stack>
			<Heading level={3}>File actions</Heading>
			<Text size="ui" tone="muted">
				Place vertical actions beside a selected file.
			</Text>
			<ButtonGroup aria-label="File actions" orientation="vertical">
				<Button variant="outline">Open file</Button>
				<Button variant="outline">Rename file</Button>
				<Button variant="outline">Move file</Button>
			</ButtonGroup>
		</Stack>
	);
}
