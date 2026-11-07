"use client";

import { Heading, Text, Toggle, ToggleGroup } from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { useState } from "react";
import { toolbarPreviewStyles } from "../../../compositions/toolbar-preview.styles";
import { previewWorkspaceStyles } from "../../preview-workspace.styles";
import { specimenStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function ToggleGroupSpecimen() {
	const [alignment, setAlignment] = useState<string[]>(["Left"]);
	const [formatting, setFormatting] = useState<string[]>(["Bold"]);
	return (
		<div {...props(specimenStyles.examples)}>
			<SpecimenSection
				description="Choose one alignment for the paragraph."
				primary
				title="Paragraph alignment"
			>
				<ToggleGroup
					aria-label="Text alignment"
					onValueChange={setAlignment}
					value={alignment}
				>
					<Toggle value="Left">Left</Toggle>
					<Toggle value="Center">Center</Toggle>
					<Toggle value="Right">Right</Toggle>
				</ToggleGroup>
				<Heading level={4}>A calmer workspace</Heading>
				<p
					{...props(
						previewWorkspaceStyles.copy,
						alignment[0] === "Center" && previewWorkspaceStyles.alignCenter,
						alignment[0] === "Right" && previewWorkspaceStyles.alignEnd
					)}
				>
					Keep projects, conversations, and decisions together. Give everyday
					work a little more room.
				</p>
			</SpecimenSection>
			<SpecimenSection
				description="Combine bold, italic, and underline."
				title="Text formatting"
			>
				<ToggleGroup
					aria-label="Text styles"
					multiple
					onValueChange={setFormatting}
					value={formatting}
					variant="outline"
				>
					<Toggle value="Bold">Bold</Toggle>
					<Toggle value="Italic">Italic</Toggle>
					<Toggle value="Underline">Underline</Toggle>
				</ToggleGroup>
				<p
					{...props(
						previewWorkspaceStyles.copy,
						formatting.includes("Bold") && toolbarPreviewStyles.formatBold,
						formatting.includes("Italic") && toolbarPreviewStyles.formatItalic,
						formatting.includes("Underline") && previewWorkspaceStyles.underline
					)}
				>
					The best tools make the next step clear.
				</p>
			</SpecimenSection>
			<SpecimenSection
				description="Use a vertical group when the tools sit beside a canvas."
				title="Canvas layout"
			>
				<ToggleGroup
					aria-label="Layout direction"
					defaultValue={["Rows"]}
					orientation="vertical"
					size="sm"
				>
					<Toggle value="Rows">Rows</Toggle>
					<Toggle value="Columns">Columns</Toggle>
				</ToggleGroup>
				<Text size="ui" tone="muted">
					Choose a direction for the workspace panels.
				</Text>
			</SpecimenSection>
		</div>
	);
}
