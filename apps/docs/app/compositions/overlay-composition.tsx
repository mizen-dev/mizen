"use client";

import {
	Button,
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPanel,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
	Field,
	FieldDescription,
	FieldLabel,
	Heading,
	Inline,
	Input,
	Menu,
	MenuItem,
	MenuPopup,
	MenuSub,
	MenuSubPopup,
	MenuSubTrigger,
	MenuTrigger,
	Popover,
	PopoverDescription,
	PopoverPopup,
	PopoverTitle,
	PopoverTrigger,
	Section,
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
	Stack,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { type ChangeEvent, useCallback, useState } from "react";
import { compositionStyles } from "./composition.styles";

export function OverlayComposition() {
	const [open, setOpen] = useState(false);
	const [saved, setSaved] = useState({ name: "Mizen Studio", team: "product" });
	const [draft, setDraft] = useState(saved);
	const [showProjectId, setShowProjectId] = useState(false);
	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			setOpen(nextOpen);
			if (nextOpen) {
				setDraft(saved);
			}
		},
		[saved]
	);
	const handleCancel = useCallback(() => {
		setOpen(false);
		setDraft(saved);
	}, [saved]);
	const handleSave = useCallback(() => {
		setSaved(draft);
		setOpen(false);
	}, [draft]);
	const handleNameChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setDraft((current) => ({ ...current, name: event.currentTarget.value }));
		},
		[]
	);
	const handleTeamChange = useCallback((team: string | null) => {
		if (team === "product" || team === "design") {
			setDraft((current) => ({ ...current, team }));
		}
	}, []);
	const handleUseProductTeam = useCallback(() => {
		setDraft((current) => ({ ...current, team: "product" }));
	}, []);
	const handleUseDesignTeam = useCallback(() => {
		setDraft((current) => ({ ...current, team: "design" }));
	}, []);
	const handleShowProjectId = useCallback(() => setShowProjectId(true), []);
	const handleHideProjectId = useCallback(() => setShowProjectId(false), []);

	return (
		<div
			{...props(
				compositionStyles.workspace,
				compositionStyles.compactWorkspace
			)}
		>
			<Section aria-labelledby="overlay-heading">
				<div {...props(compositionStyles.intro)}>
					<Heading id="overlay-heading" level={2} size="title">
						Workspace details
					</Heading>
					<p {...props(compositionStyles.sectionDescription)}>
						Manage the workspace name and the team responsible for new projects.
					</p>
				</div>
				<div {...props(compositionStyles.workarea)}>
					<Stack gap="4">
						<p aria-live="polite" {...props(compositionStyles.sectionTitle)}>
							Workspace: {saved.name} · Default team:{" "}
							{saved.team === "product" ? "Product" : "Design"}
							{showProjectId ? " · ws_8f29c1" : ""}
						</p>
						<Dialog onOpenChange={handleOpenChange} open={open}>
							<Inline>
								<DialogTrigger
									render={
										<Button aria-label="Edit workspace details" variant="brand">
											Edit
										</Button>
									}
								/>
							</Inline>
							<DialogPopup size="md">
								<DialogHeader>
									<DialogTitle>Workspace details</DialogTitle>
									<DialogDescription>
										Update the workspace profile and its default team.
									</DialogDescription>
								</DialogHeader>
								<DialogPanel>
									<Stack>
										<Field>
											<FieldLabel>Workspace name</FieldLabel>
											<Input onChange={handleNameChange} value={draft.name} />
											<FieldDescription>
												Visible to invited teammates.
											</FieldDescription>
										</Field>
										<Field>
											<FieldLabel>Default team</FieldLabel>
											<Select
												items={[
													{ label: "Product team", value: "product" },
													{ label: "Design team", value: "design" },
												]}
												onValueChange={handleTeamChange}
												value={draft.team}
											>
												<SelectTrigger aria-label="Default team">
													<SelectValue />
												</SelectTrigger>
												<SelectPopup>
													<SelectItem value="product">Product team</SelectItem>
													<SelectItem value="design">Design team</SelectItem>
												</SelectPopup>
											</Select>
											<FieldDescription>
												New projects start with this team.
											</FieldDescription>
										</Field>
										<Inline>
											<Popover>
												<PopoverTrigger
													render={
														<Button variant="ghost">
															About workspace roles
														</Button>
													}
												/>
												<PopoverPopup>
													<PopoverTitle>Workspace roles</PopoverTitle>
													<PopoverDescription>
														Admins manage billing and access. Members can edit
														shared projects.
													</PopoverDescription>
												</PopoverPopup>
											</Popover>
											<Menu>
												<MenuTrigger
													render={
														<Button variant="outline">More actions</Button>
													}
												/>
												<MenuPopup>
													<MenuItem onClick={handleUseProductTeam}>
														Use Product team
													</MenuItem>
													<MenuItem onClick={handleUseDesignTeam}>
														Use Design team
													</MenuItem>
													<MenuSub>
														<MenuSubTrigger>Workspace display</MenuSubTrigger>
														<MenuSubPopup>
															<MenuItem onClick={handleShowProjectId}>
																Show project ID
															</MenuItem>
															<MenuItem onClick={handleHideProjectId}>
																Hide project ID
															</MenuItem>
														</MenuSubPopup>
													</MenuSub>
												</MenuPopup>
											</Menu>
										</Inline>
									</Stack>
								</DialogPanel>
								<DialogFooter>
									<Button onClick={handleCancel} variant="outline">
										Cancel
									</Button>
									<Button
										disabled={!draft.name.trim()}
										onClick={handleSave}
										variant="brand"
									>
										Save details
									</Button>
								</DialogFooter>
							</DialogPopup>
						</Dialog>
					</Stack>
				</div>
			</Section>
		</div>
	);
}
