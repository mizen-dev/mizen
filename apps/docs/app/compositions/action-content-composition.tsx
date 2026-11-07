"use client";

import {
	Attachment,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentName,
	Button,
	Heading,
	Inline,
	Link,
	Menu,
	Menubar,
	MenubarTrigger,
	MenuItem,
	MenuPopup,
	Stack,
	Text,
	Thumbnail,
} from "@mizen/ui";
import { IconX } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { PreviewWorkspace } from "../components/preview-workspace";

function RemoveIcon() {
	return <IconX aria-hidden="true" focusable="false" size="1em" />;
}

export function MenubarExamples() {
	return (
		<PreviewWorkspace
			testId="menubar-example"
			title="Workspace menu"
			titleId="menubar-heading"
		>
			<Stack gap="8">
				<Stack gap="4">
					<Text size="ui" tone="muted">
						Use arrow keys to move between menus, then open an action.
					</Text>
					<Menubar aria-label="Workspace actions">
						<Menu>
							<MenubarTrigger>File</MenubarTrigger>
							<MenuPopup>
								<MenuItem>New workspace</MenuItem>
								<MenuItem disabled>Archive workspace</MenuItem>
							</MenuPopup>
						</Menu>
						<Menu>
							<MenubarTrigger>Edit</MenubarTrigger>
							<MenuPopup>
								<MenuItem>Rename workspace</MenuItem>
							</MenuPopup>
						</Menu>
						<Menu>
							<MenubarTrigger disabled>Help</MenubarTrigger>
							<MenuPopup>
								<MenuItem>About workspace</MenuItem>
							</MenuPopup>
						</Menu>
					</Menubar>
					<Heading level={4}>Northstar launch</Heading>
					<Text>
						Keep projects, conversations, and decisions together. The autumn
						release gives everyday work a little more room.
					</Text>
					<Text size="ui" tone="muted">
						Release notes · Local draft
					</Text>
				</Stack>
				<Stack gap="4">
					<Heading level={3}>Panel navigation</Heading>
					<Text size="ui" tone="muted">
						Use vertical menus beside a working canvas.
					</Text>
					<Menubar aria-label="Vertical actions" orientation="vertical">
						<Menu>
							<MenubarTrigger>Navigate</MenubarTrigger>
							<MenuPopup>
								<MenuItem>Open component index</MenuItem>
							</MenuPopup>
						</Menu>
						<Menu>
							<MenubarTrigger>View</MenubarTrigger>
							<MenuPopup>
								<MenuItem>Show panel</MenuItem>
							</MenuPopup>
						</Menu>
					</Menubar>
				</Stack>
			</Stack>
		</PreviewWorkspace>
	);
}

function FilterExamples() {
	const [removed, setRemoved] = useState(false);
	const removeReview = useCallback(() => setRemoved(true), []);

	return (
		<PreviewWorkspace
			testId="filter-example"
			title="Document filters"
			titleId="filter-heading"
		>
			<Stack gap="3">
				<Text size="ui" tone="muted">
					Filter project documents by status.
				</Text>
				<Inline>
					{removed ? (
						<Text aria-live="polite">Needs review filter removed</Text>
					) : (
						<Button
							aria-label="Remove Needs review filter"
							onClick={removeReview}
							size="sm"
							variant="secondary"
						>
							Needs review
							<RemoveIcon />
						</Button>
					)}
					<Button
						aria-label="Remove Published filter"
						disabled
						size="sm"
						variant="secondary"
					>
						Published
						<RemoveIcon />
					</Button>
				</Inline>
				<Stack gap="3">
					<Text>Release announcement · Published</Text>
					{removed ? null : <Text>Customer handoff · Needs review</Text>}
					<Text>Support checklist · Published</Text>
				</Stack>
			</Stack>
		</PreviewWorkspace>
	);
}

export function AttachmentExamples() {
	return (
		<PreviewWorkspace
			testId="attachment-example"
			title="Release files"
			titleId="attachment-heading"
		>
			<Stack gap="3">
				<Attachment>
					<AttachmentMedia>
						<Thumbnail
							alt="Rows of lavender under a pink evening sky"
							size="default"
							src="/media/lavender-valensole.jpg"
						/>
					</AttachmentMedia>
					<AttachmentContent>
						<AttachmentName>lavender-valensole.jpg</AttachmentName>
						<AttachmentDescription>JPEG image · 271 KB</AttachmentDescription>
					</AttachmentContent>
					<AttachmentActions>
						<Link href="/components/attachment">View file details</Link>
					</AttachmentActions>
				</Attachment>
			</Stack>
		</PreviewWorkspace>
	);
}

export function ActionContentComposition() {
	return (
		<Stack data-testid="action-content-example" gap="4">
			<Heading level={2} size="title">
				Actions and content
			</Heading>
			<MenubarExamples />
			<FilterExamples />
			<AttachmentExamples />
		</Stack>
	);
}
