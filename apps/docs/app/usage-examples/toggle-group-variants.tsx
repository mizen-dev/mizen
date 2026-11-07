"use client";
import {
	Group,
	Heading,
	Stack,
	Text,
	ToggleGroup,
	ToggleGroupItem,
	ToggleGroupSeparator,
	Tooltip,
	TooltipPopup,
	TooltipProvider,
	TooltipTrigger,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { IconBold, IconItalic, IconUnderline } from "@tabler/icons-react";
import { Fragment as ReactFragment, useState } from "react";
import { previewWorkspaceStyles } from "../components/preview-workspace.styles";
import { toolbarPreviewStyles } from "../compositions/toolbar-preview.styles";

export function ToggleGroupParagraphAlignmentExample1() {
	const [alignment, setAlignment] = useState<string[]>(["Left"]);
	return (
		<Stack gap="4">
			<ToggleGroup
				aria-label="Text alignment"
				onValueChange={setAlignment}
				value={alignment}
			>
				<ToggleGroupItem value="Left">Left</ToggleGroupItem>
				<ToggleGroupItem value="Center">Center</ToggleGroupItem>
				<ToggleGroupItem value="Right">Right</ToggleGroupItem>
			</ToggleGroup>
			<Heading level={4}>A calmer workspace</Heading>
			<p
				{...props(
					previewWorkspaceStyles.copy,
					alignment[0] === "Center" && previewWorkspaceStyles.alignCenter,
					alignment[0] === "Right" && previewWorkspaceStyles.alignEnd
				)}
			>
				Keep projects, conversations, and decisions together. Give everyday work
				a little more room.
			</p>
		</Stack>
	);
}
export function ToggleGroupTextFormattingExample2() {
	const [formatting, setFormatting] = useState<string[]>(["Bold"]);
	return (
		<Stack gap="4">
			<ToggleGroup
				aria-label="Text styles"
				multiple
				onValueChange={setFormatting}
				value={formatting}
				variant="outline"
			>
				<ToggleGroupItem value="Bold">Bold</ToggleGroupItem>
				<ToggleGroupSeparator />
				<ToggleGroupItem value="Italic">Italic</ToggleGroupItem>
				<ToggleGroupSeparator />
				<ToggleGroupItem value="Underline">Underline</ToggleGroupItem>
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
		</Stack>
	);
}
export function ToggleGroupCanvasLayoutExample3() {
	return (
		<Stack gap="4">
			<ToggleGroup
				aria-label="Layout direction"
				defaultValue={["Rows"]}
				orientation="vertical"
				size="sm"
				variant="outline"
			>
				<ToggleGroupItem value="Rows">Rows</ToggleGroupItem>
				<ToggleGroupSeparator orientation="horizontal" />
				<ToggleGroupItem value="Columns">Columns</ToggleGroupItem>
			</ToggleGroup>
			<Text size="ui" tone="muted">
				Choose a direction for the workspace panels.
			</Text>
		</Stack>
	);
}

const formattingTools = [
	["Bold", IconBold],
	["Italic", IconItalic],
	["Underline", IconUnderline],
] as const;

export function ToggleGroupIconSizes() {
	return (
		<Stack gap="4">
			{(["sm", "default", "lg"] as const).map((size) => (
				<ToggleGroup
					aria-label={`${size} formatting`}
					defaultValue={["Bold"]}
					key={size}
					size={size}
					variant="outline"
				>
					{formattingTools.map(([label, Icon], index) => (
						<ReactFragment key={label}>
							{index > 0 && <ToggleGroupSeparator />}
							<ToggleGroupItem aria-label={label} value={label}>
								<Icon aria-hidden="true" size={size === "sm" ? 16 : 18} />
							</ToggleGroupItem>
						</ReactFragment>
					))}
				</ToggleGroup>
			))}
		</Stack>
	);
}

export function ToggleGroupDisabledStates() {
	return (
		<Stack gap="4">
			<ToggleGroup
				aria-label="Disabled formatting"
				defaultValue={["Bold"]}
				disabled
				multiple
			>
				{formattingTools.map(([label, Icon]) => (
					<ToggleGroupItem aria-label={label} key={label} value={label}>
						<Icon aria-hidden="true" size={18} />
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			<ToggleGroup
				aria-label="Formatting with disabled italic"
				defaultValue={["Bold"]}
			>
				{formattingTools.map(([label, Icon]) => (
					<ToggleGroupItem
						aria-label={label}
						disabled={label === "Italic"}
						key={label}
						value={label}
					>
						<Icon aria-hidden="true" size={18} />
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</Stack>
	);
}

export function ToggleGroupWithTooltips() {
	return (
		<TooltipProvider>
			<Group>
				<ToggleGroup
					aria-label="Formatting with tooltips"
					defaultValue={["Bold"]}
					multiple
				>
					{formattingTools.map(([label, Icon]) => (
						<Tooltip key={label}>
							<TooltipTrigger
								render={<ToggleGroupItem aria-label={label} value={label} />}
							>
								<Icon aria-hidden="true" size={18} />
							</TooltipTrigger>
							<TooltipPopup>{label}</TooltipPopup>
						</Tooltip>
					))}
				</ToggleGroup>
			</Group>
		</TooltipProvider>
	);
}
