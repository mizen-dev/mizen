"use client";

import {
	Inline,
	Progress,
	ProgressIndicator,
	ProgressLabel,
	ProgressTrack,
	ProgressValue,
	Spacer,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../../../page.styles";
import { SpecimenSection } from "./specimen-section";

export function ProgressSpecimen() {
	return (
		<div {...props(pageStyles.fieldGrid)}>
			<SpecimenSection primary title="Workspace export">
				<Text>Northstar launch · Exporting documents and attachments</Text>
				<Progress aria-label="Export progress" value={65} />
				<Text size="ui" tone="muted">
					65 of 100 files prepared. Keep this workspace open until the export
					finishes.
				</Text>
			</SpecimenSection>

			<SpecimenSection title="Build processing">
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
			</SpecimenSection>

			<SpecimenSection title="Archive transfer">
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
			</SpecimenSection>

			<SpecimenSection title="Record sync">
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
			</SpecimenSection>
		</div>
	);
}
