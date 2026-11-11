"use client";
import {
	Heading,
	Stack,
	Text,
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarSeparator,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconEye,
	IconMessagePlus,
	IconPointer,
	IconShare,
	IconSquare,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { toolbarPreviewStyles } from "../compositions/toolbar-preview.styles";

export function DrawingToolbar() {
	const [tool, setTool] = useState("select");
	const selectObject = useCallback(() => setTool("select"), []);
	const drawShape = useCallback(() => setTool("shape"), []);
	return (
		<Stack gap="3">
			<Heading level={3}>Drawing tools</Heading>
			<Text size="ui" tone="muted">
				Place a vertical toolbar beside the canvas it controls.
			</Text>
			<div {...props(toolbarPreviewStyles.drawing)}>
				<Toolbar aria-label="Drawing tools" orientation="vertical">
					<ToolbarButton
						aria-label="Select object"
						aria-pressed={tool === "select"}
						onClick={selectObject}
						size="icon"
						variant={tool === "select" ? "secondary" : "ghost"}
					>
						<IconPointer aria-hidden="true" size="1em" />
					</ToolbarButton>
					<ToolbarButton
						aria-label="Draw shape"
						aria-pressed={tool === "shape"}
						onClick={drawShape}
						size="icon"
						variant={tool === "shape" ? "secondary" : "ghost"}
					>
						<IconSquare aria-hidden="true" size="1em" />
					</ToolbarButton>
				</Toolbar>
				<div {...props(toolbarPreviewStyles.artboard)}>
					<Stack gap="2">
						<Text>Untitled canvas</Text>
						<Text aria-live="polite" size="ui" tone="muted">
							{tool === "select"
								? "Select an object to move or resize it."
								: "Drag on the canvas to draw a rectangle."}
						</Text>
					</Stack>
				</div>
			</div>
		</Stack>
	);
}
export function DocumentToolbar() {
	return (
		<Toolbar aria-label="Editor">
			<ToolbarGroup>
				<ToolbarButton aria-label="Undo" size="icon" variant="ghost">
					<IconArrowBackUp aria-hidden="true" size={16} />
				</ToolbarButton>
				<ToolbarButton aria-label="Redo" size="icon" variant="ghost">
					<IconArrowForwardUp aria-hidden="true" size={16} />
				</ToolbarButton>
			</ToolbarGroup>
			<ToolbarSeparator />
			<ToolbarGroup>
				<ToolbarButton aria-label="Preview draft" size="icon" variant="ghost">
					<IconEye aria-hidden="true" size={16} />
				</ToolbarButton>
				<ToolbarButton aria-label="Add comment" size="icon" variant="ghost">
					<IconMessagePlus aria-hidden="true" size={16} />
				</ToolbarButton>
				<ToolbarButton aria-label="Share draft" size="icon" variant="ghost">
					<IconShare aria-hidden="true" size={16} />
				</ToolbarButton>
			</ToolbarGroup>
		</Toolbar>
	);
}
