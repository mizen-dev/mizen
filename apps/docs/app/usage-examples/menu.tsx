import {
	Button,
	Menu,
	MenuCheckboxItem,
	MenuItem,
	MenuPopup,
	MenuSeparator,
	MenuShortcut,
	MenuSub,
	MenuSubPopup,
	MenuSubTrigger,
	MenuTrigger,
} from "@mizen/ui";
import {
	IconChevronDown,
	IconCopy,
	IconFolderSymlink,
	IconPencil,
	IconShare,
	IconTrash,
} from "@tabler/icons-react";

export function WorkspaceMenu() {
	return (
		<Menu>
			<MenuTrigger
				render={
					<Button variant="outline">
						Actions
						<IconChevronDown aria-hidden="true" size={16} />
					</Button>
				}
			/>
			<MenuPopup>
				<MenuItem>
					<IconPencil aria-hidden="true" size={16} />
					Rename
					<MenuShortcut>⌘R</MenuShortcut>
				</MenuItem>
				<MenuItem>
					<IconCopy aria-hidden="true" size={16} />
					Duplicate
					<MenuShortcut>⌘D</MenuShortcut>
				</MenuItem>
				<MenuItem>
					<IconShare aria-hidden="true" size={16} />
					Share
				</MenuItem>
				<MenuSeparator />
				<MenuCheckboxItem defaultChecked>Show activity</MenuCheckboxItem>
				<MenuSeparator />
				<MenuSub>
					<MenuSubTrigger>
						<IconFolderSymlink aria-hidden="true" size={16} />
						Move to
					</MenuSubTrigger>
					<MenuSubPopup>
						<MenuItem>Personal</MenuItem>
						<MenuItem>Product team</MenuItem>
						<MenuItem>Archive</MenuItem>
					</MenuSubPopup>
				</MenuSub>
				<MenuSeparator />
				<MenuItem variant="destructive">
					<IconTrash aria-hidden="true" size={16} />
					Delete project
				</MenuItem>
			</MenuPopup>
		</Menu>
	);
}
