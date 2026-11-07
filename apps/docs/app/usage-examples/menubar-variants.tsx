"use client";
import {
	Heading,
	Menu,
	Menubar,
	MenubarTrigger,
	MenuItem,
	MenuPopup,
	Stack,
	Text,
} from "@mizen-labs/ui";

export function MenubarNorthstarLaunchExample1() {
	return (
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
				Keep projects, conversations, and decisions together. The autumn release
				gives everyday work a little more room.
			</Text>
			<Text size="ui" tone="muted">
				Release notes · Local draft
			</Text>
		</Stack>
	);
}
export function MenubarPanelNavigationExample2() {
	return (
		<Stack gap="4">
			<Heading level={3}>Panel navigation</Heading>
			<Text size="ui" tone="muted">
				Use vertical menus beside a working canvas.
			</Text>
			<Menubar aria-label="Vertical actions" orientation="vertical">
				<Menu>
					<MenubarTrigger>Navigate</MenubarTrigger>
					<MenuPopup align="start" side="inline-end">
						<MenuItem>Open component index</MenuItem>
					</MenuPopup>
				</Menu>
				<Menu>
					<MenubarTrigger>View</MenubarTrigger>
					<MenuPopup align="start" side="inline-end">
						<MenuItem>Show panel</MenuItem>
					</MenuPopup>
				</Menu>
			</Menubar>
		</Stack>
	);
}
