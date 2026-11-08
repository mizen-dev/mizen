"use client";

import { Button, Heading, Text } from "@mizen-labs/ui";
import { Group } from "@mizen-labs/ui/group";
import { props } from "@stylexjs/stylex";
import { useCallback, useState } from "react";
import { specimenStyles as previewStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function GroupSpecimen() {
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
		<div {...props(previewStyles.examples)}>
			<SpecimenSection
				description="Save the current configuration or review the other available actions."
				primary
				title="Workspace changes"
			>
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
			</SpecimenSection>
		</div>
	);
}
