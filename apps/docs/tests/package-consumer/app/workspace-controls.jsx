"use client";

import {
	Button,
	Dialog,
	DialogDescription,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
	Field,
	FieldLabel,
	Input,
	Select,
	SelectItem,
	SelectLabel,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "@mizen-labs/ui";
import { useCallback, useState } from "react";

export function WorkspaceControls() {
	const [savedName, setSavedName] = useState("");
	const [segment, setSegment] = useState("all");

	const saveWorkspace = useCallback((event) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const name = String(form.get("workspaceName") ?? "");
		const selectedSegment = String(form.get("segment") ?? "all");
		setSavedName(`${name} · ${selectedSegment}`);
	}, []);

	return (
		<section aria-labelledby="workspace-controls-title">
			<h2 id="workspace-controls-title">Workspace settings</h2>
			<form id="workspace-form" onSubmit={saveWorkspace}>
				<Field name="workspaceName">
					<FieldLabel>Workspace name</FieldLabel>
					<Input
						defaultValue="Research"
						id="workspace-name"
						name="workspaceName"
						required
					/>
				</Field>
				<input name="segment" type="hidden" value={segment} />
				<Button type="submit">Save workspace</Button>
				<Dialog>
					<DialogTrigger
						render={<Button type="button">Choose segment</Button>}
					/>
					<DialogPopup>
						<DialogTitle>Resource segment</DialogTitle>
						<DialogDescription>
							Choose which accounts to review.
						</DialogDescription>
						<Select onValueChange={setSegment} value={segment}>
							<SelectLabel>Segment</SelectLabel>
							<SelectTrigger>
								<SelectValue placeholder="Choose a segment" />
							</SelectTrigger>
							<SelectPopup>
								<SelectItem value="all">All accounts</SelectItem>
								<SelectItem value="priority">Priority accounts</SelectItem>
							</SelectPopup>
						</Select>
						<p data-testid="selected-segment">
							{segment === "priority" ? "Priority accounts" : "All accounts"}
						</p>
					</DialogPopup>
				</Dialog>
			</form>
			<output aria-live="polite" data-testid="saved-workspace">
				{savedName ? `Saved ${savedName}` : ""}
			</output>
		</section>
	);
}
