"use client";
import {
	Inline,
	Progress,
	ProgressIndicator,
	ProgressLabel,
	ProgressTrack,
	ProgressValue,
	Spacer,
	Stack,
	Text,
} from "@mizen/ui";

export function ProgressWorkspaceExportExample1() {
	return (
		<Stack gap="4">
			<Text>Northstar launch · Exporting documents and attachments</Text>
			<Progress aria-label="Export progress" value={65} />
			<Text size="ui" tone="muted">
				65 of 100 files prepared. Keep this workspace open until the export
				finishes.
			</Text>
		</Stack>
	);
}
export function ProgressBuildProcessingExample2() {
	return (
		<Stack gap="4">
			<Progress value={45}>
				<Inline>
					<ProgressLabel>Processing task</ProgressLabel>
					<Spacer />
					<ProgressValue />
				</Inline>
				<ProgressTrack>
					<ProgressIndicator />
				</ProgressTrack>
			</Progress>
		</Stack>
	);
}
export function ProgressArchiveTransferExample3() {
	return (
		<Stack gap="4">
			<Progress max={500} value={375}>
				<Inline>
					<ProgressLabel>Transfer volume</ProgressLabel>
					<Spacer />
					<ProgressValue>
						{(_formatted, value) => `${value} / 500 MB`}
					</ProgressValue>
				</Inline>
				<ProgressTrack>
					<ProgressIndicator />
				</ProgressTrack>
			</Progress>
		</Stack>
	);
}
export function ProgressRecordSyncExample4() {
	return (
		<Stack gap="4">
			<Progress value={null}>
				<Inline>
					<ProgressLabel>Synchronizing records</ProgressLabel>
					<Spacer />
					<ProgressValue />
				</Inline>
				<ProgressTrack>
					<ProgressIndicator />
				</ProgressTrack>
			</Progress>
		</Stack>
	);
}
