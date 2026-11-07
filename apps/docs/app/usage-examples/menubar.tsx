import { Menu, Menubar, MenubarTrigger, MenuItem, MenuPopup } from "@mizen/ui";
export function EditorMenubar() {
	return (
		<Menubar aria-label="Editor menu">
			<Menu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenuPopup>
					<MenuItem>New document</MenuItem>
					<MenuItem>Open recent</MenuItem>
				</MenuPopup>
			</Menu>
			<Menu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenuPopup>
					<MenuItem>Undo</MenuItem>
					<MenuItem>Redo</MenuItem>
				</MenuPopup>
			</Menu>
			<Menu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenuPopup>
					<MenuItem>Show outline</MenuItem>
					<MenuItem>Focus mode</MenuItem>
				</MenuPopup>
			</Menu>
		</Menubar>
	);
}
