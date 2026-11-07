"use client";
import {
	Badge,
	Button,
	Heading,
	Menu,
	MenuItem,
	MenuPopup,
	MenuTrigger,
	Stack,
	Text,
	ToggleGroup,
	ToggleGroupItem,
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarInput,
	ToolbarLink,
	ToolbarSeparator,
	Tooltip,
	TooltipPopup,
	TooltipProvider,
	TooltipTrigger,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import {
	IconArrowBackUp,
	IconBold,
	IconCopy,
	IconDots,
	IconItalic,
	IconPlus,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { toolbarPreviewStyles } from "../compositions/toolbar-preview.styles";

export function ToolbarACalmerWorkspaceExample1() {
	const [action, setAction] = useState("Local draft · not saved");
	const [formatting, setFormatting] = useState<string[]>([]);
	const handleAddBlock = useCallback(
		() => setAction("Added a draft block."),
		[]
	);
	const handleDuplicate = useCallback(
		() => setAction("Duplicated the draft."),
		[]
	);
	const handleExport = useCallback(() => setAction("Exported the draft."), []);
	return (
		<div {...props(toolbarPreviewStyles.surface)}>
			<div {...props(toolbarPreviewStyles.header)}>
				<div {...props(toolbarPreviewStyles.titleRow)}>
					<Text size="ui" tone="muted">
						Release notes
					</Text>
					<Badge variant="outline">Draft</Badge>
				</div>
				<Text size="ui" tone="muted">
					Workspace / Documents
				</Text>
			</div>
			<Toolbar aria-label="Draft tools">
				<ToolbarGroup aria-label="Draft actions">
					<ToolbarButton aria-label="Undo edit" disabled size="icon">
						<IconArrowBackUp aria-hidden="true" size="1em" />
					</ToolbarButton>
					<ToolbarButton
						aria-label="Add draft block"
						onClick={handleAddBlock}
						size="icon"
					>
						<IconPlus aria-hidden="true" size="1em" />
					</ToolbarButton>
					<ToolbarButton
						aria-label="Duplicate draft"
						onClick={handleDuplicate}
						size="icon"
					>
						<IconCopy aria-hidden="true" size="1em" />
					</ToolbarButton>
				</ToolbarGroup>
				<ToolbarSeparator />
				<ToggleGroup
					aria-label="Draft formatting"
					multiple
					onValueChange={setFormatting}
					value={formatting}
				>
					<ToolbarButton
						aria-label="Bold"
						render={
							<ToggleGroupItem aria-label="Bold" size="icon" value="bold" />
						}
					>
						<IconBold aria-hidden="true" size="1em" />
					</ToolbarButton>
					<ToolbarButton
						aria-label="Italic"
						render={
							<ToggleGroupItem aria-label="Italic" size="icon" value="italic" />
						}
					>
						<IconItalic aria-hidden="true" size="1em" />
					</ToolbarButton>
				</ToggleGroup>
				<ToolbarSeparator />
				<Menu>
					<ToolbarButton
						aria-label="More draft actions"
						render={
							<MenuTrigger
								render={
									<Button
										aria-label="More draft actions"
										size="icon"
										variant="ghost"
									/>
								}
							/>
						}
					>
						<IconDots aria-hidden="true" size="1em" />
					</ToolbarButton>
					<MenuPopup>
						<MenuItem onClick={handleExport}>Export draft</MenuItem>
						<MenuItem disabled>Delete draft</MenuItem>
					</MenuPopup>
				</Menu>
				<ToolbarLink href="/docs/components/toggle-group">
					Formatting guide
				</ToolbarLink>
			</Toolbar>
			<div {...props(toolbarPreviewStyles.canvas)}>
				<article
					aria-label="Release note draft"
					{...props(toolbarPreviewStyles.document)}
				>
					<Stack gap="2">
						<Text size="ui" tone="muted">
							PRODUCT UPDATE · OCTOBER 2026
						</Text>
						<Heading level={3} size="title">
							A calmer workspace
						</Heading>
					</Stack>
					<p
						{...props(
							toolbarPreviewStyles.text,
							formatting.includes("bold") && toolbarPreviewStyles.formatBold,
							formatting.includes("italic") && toolbarPreviewStyles.formatItalic
						)}
					>
						Keep your projects, conversations, and decisions together. The new
						workspace gives everyday work a little more room.
					</p>
					<Text size="ui" tone="muted">
						Select Bold or Italic to format this paragraph.
					</Text>
				</article>
			</div>
			<Text
				aria-live="polite"
				data-testid="draft-action-status"
				size="ui"
				tone="muted"
			>
				{action}
			</Text>
		</div>
	);
}

export function ToolbarControlStates() {
	return (
		<Stack gap="4">
			<Toolbar aria-label="Action states">
				<ToolbarGroup>
					<ToolbarButton aria-label="Undo unavailable" disabled size="icon">
						<IconArrowBackUp aria-hidden="true" size={18} />
					</ToolbarButton>
					<ToolbarButton loading>Saving draft</ToolbarButton>
					<ToolbarButton disabled>Publish</ToolbarButton>
				</ToolbarGroup>
				<ToolbarSeparator />
				<ToolbarLink href="/docs/components/toolbar">Guide</ToolbarLink>
			</Toolbar>
			<Toolbar aria-label="Disabled actions" disabled>
				<ToolbarButton>Save</ToolbarButton>
				<ToolbarButton>Publish</ToolbarButton>
			</Toolbar>
		</Stack>
	);
}

const formatTools = [
	["Bold", IconBold],
	["Italic", IconItalic],
] as const;
export function ToolbarWithTooltips() {
	return (
		<TooltipProvider>
			<Toolbar aria-label="Formatting tools">
				<ToggleGroup aria-label="Formatting" defaultValue={["Bold"]} multiple>
					{formatTools.map(([label, Icon]) => (
						<Tooltip key={label}>
							<TooltipTrigger
								render={
									<ToolbarButton
										aria-label={label}
										render={
											<ToggleGroupItem
												aria-label={label}
												size="icon"
												value={label}
											/>
										}
									/>
								}
							>
								<Icon aria-hidden="true" size={18} />
							</TooltipTrigger>
							<TooltipPopup>{label}</TooltipPopup>
						</Tooltip>
					))}
				</ToggleGroup>
				<ToolbarSeparator />
				<ToolbarGroup>
					<ToolbarButton aria-label="Copy formatting" size="icon">
						<IconCopy aria-hidden="true" size={18} />
					</ToolbarButton>
					<ToolbarLink href="/docs/components/toggle-group">
						Formatting guide
					</ToolbarLink>
				</ToolbarGroup>
			</Toolbar>
		</TooltipProvider>
	);
}

export function ToolbarVerticalGroups() {
	return (
		<Toolbar aria-label="Vertical formatting" orientation="vertical">
			<ToggleGroup
				aria-label="Vertical styles"
				defaultValue={["Bold"]}
				multiple
			>
				{formatTools.map(([label, Icon]) => (
					<ToolbarButton
						aria-label={label}
						key={label}
						render={
							<ToggleGroupItem aria-label={label} size="icon" value={label} />
						}
					>
						<Icon aria-hidden="true" size={18} />
					</ToolbarButton>
				))}
			</ToggleGroup>
			<ToolbarSeparator />
			<ToolbarGroup>
				<ToolbarButton aria-label="Copy" size="icon">
					<IconCopy aria-hidden="true" size={18} />
				</ToolbarButton>
				<ToolbarButton
					aria-label="More"
					disabled
					focusableWhenDisabled={false}
					size="icon"
				>
					<IconDots aria-hidden="true" size={18} />
				</ToolbarButton>
			</ToolbarGroup>
		</Toolbar>
	);
}

export function ToolbarWithInput() {
	return (
		<Toolbar aria-label="Document search">
			<ToolbarInput
				aria-label="Find in document"
				defaultValue="Workspace"
				placeholder="Find in document"
			/>
			<ToolbarSeparator />
			<ToolbarButton>Find next</ToolbarButton>
		</Toolbar>
	);
}
