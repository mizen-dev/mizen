import {
	Inline,
	Progress,
	ProgressIndicator,
	ProgressLabel,
	ProgressTrack,
	ProgressValue,
	Spacer,
} from "@mizen/ui";

export function ExportProgress() {
	return (
		<Progress aria-label="Workspace export" max={100} value={65}>
			<Inline>
				<ProgressLabel>Exporting workspace</ProgressLabel>
				<Spacer />
				<ProgressValue />
			</Inline>
			<ProgressTrack>
				<ProgressIndicator />
			</ProgressTrack>
		</Progress>
	);
}
