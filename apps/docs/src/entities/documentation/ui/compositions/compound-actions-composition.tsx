"use client";

import {
	Badge,
	Button,
	ButtonGroup,
	Grid,
	Heading,
	Menu,
	MenuItem,
	MenuPopup,
	MenuTrigger,
	Section,
	SegmentedControl,
	SegmentedControlItem,
	Stack,
	Text,
	Toggle,
	ToggleGroup,
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarLink,
	ToolbarSeparator,
} from "@mizen-labs/ui";
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
import { PreviewWorkspace } from "../../../../shared/ui/preview-workspace";
import { DrawingToolbar } from "../examples/toolbar";
import { toolbarPreviewStyles } from "./toolbar-preview.styles";

export function ButtonGroupExamples() {
	const [status, setStatus] = useState("Draft · Ready for review");
	const publish = useCallback(
		() => setStatus("Release published in this preview."),
		[]
	);
	const save = useCallback(() => setStatus("Draft saved in this preview."), []);
	return (
		<Grid>
			<PreviewWorkspace
				description="Publish now or save the work as a draft."
				title="Publish a release"
			>
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
			</PreviewWorkspace>
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
		</Grid>
	);
}

export function ToolbarExamples() {
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
						render={<Toggle aria-label="Bold" size="default" value="bold" />}
					>
						<IconBold aria-hidden="true" size="1em" />
					</ToolbarButton>
					<ToolbarButton
						aria-label="Italic"
						render={
							<Toggle aria-label="Italic" size="default" value="italic" />
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

export function SegmentedControlExamples() {
	const [view, setView] = useState<string[]>(["list"]);
	return (
		<Grid>
			<PreviewWorkspace
				description="Choose how to browse the workspace."
				title="Project views"
			>
				<SegmentedControl
					aria-label="Project view"
					onValueChange={setView}
					value={view}
				>
					<SegmentedControlItem value="list">List</SegmentedControlItem>
					<SegmentedControlItem value="board">Board</SegmentedControlItem>
					<SegmentedControlItem disabled value="timeline">
						Timeline
					</SegmentedControlItem>
				</SegmentedControl>
				{view.includes("board") ? (
					<Grid>
						<Stack gap="2">
							<Badge variant="outline">In progress</Badge>
							<Text>Northstar launch</Text>
							<Text size="ui" tone="muted">
								Maya Chen
							</Text>
						</Stack>
						<Stack gap="2">
							<Badge variant="outline">In review</Badge>
							<Text>Design system</Text>
							<Text size="ui" tone="muted">
								Sam Lee
							</Text>
						</Stack>
					</Grid>
				) : (
					<Stack gap="3">
						<Text>Northstar launch · In progress</Text>
						<Text>Design system · In review</Text>
					</Stack>
				)}
				<Text data-testid="project-view-status" size="ui" tone="muted">
					{view[0] ? `Selected view: ${view[0]}` : "No view selected."}
				</Text>
			</PreviewWorkspace>
			<Stack>
				<Heading level={3}>Report settings</Heading>
				<Text size="ui" tone="muted">
					Choose a period. The workspace controls the managed view.
				</Text>
				<SegmentedControl
					aria-label="Report period"
					defaultValue={["week"]}
					size="sm"
				>
					<SegmentedControlItem value="day">Day</SegmentedControlItem>
					<SegmentedControlItem value="week">Week</SegmentedControlItem>
					<SegmentedControlItem value="month">Month</SegmentedControlItem>
				</SegmentedControl>
				<SegmentedControl
					aria-label="Managed view"
					defaultValue={["table"]}
					disabled
					size="lg"
				>
					<SegmentedControlItem value="table">Table</SegmentedControlItem>
					<SegmentedControlItem value="chart">Chart</SegmentedControlItem>
				</SegmentedControl>
			</Stack>
		</Grid>
	);
}

export function CompoundActionsComposition() {
	return (
		<Section aria-labelledby="compound-actions-heading">
			<Heading id="compound-actions-heading" level={2} size="title">
				Actions and selection
			</Heading>
			<Text size="ui" tone="muted">
				Connected actions use normal Tab navigation. Toolbars use arrow keys.
				Segmented controls choose one value.
			</Text>
			<Heading level={3}>Button Group</Heading>
			<ButtonGroupExamples />
			<Heading level={3}>Toolbar</Heading>
			<ToolbarExamples />
			<DrawingToolbar />
			<Heading level={3}>Segmented Control</Heading>
			<SegmentedControlExamples />
		</Section>
	);
}
