"use client";
import {
	Button,
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuGroup,
	ContextMenuGroupLabel,
	ContextMenuItem,
	ContextMenuLinkItem,
	ContextMenuPopup,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubPopup,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@mizen/ui";
import {
	IconExternalLink,
	IconFile,
	IconFileText,
	IconHistory,
	IconLink,
	IconTrash,
} from "@tabler/icons-react";

export function ContextMenuFileWorkspaceActionsExample1() {
	return (
		<ContextMenu>
			<ContextMenuTrigger
				render={
					<Button
						aria-label="Project file asset: schema.config.json"
						variant="outline"
					/>
				}
			>
				<IconFile aria-hidden="true" size={16} />
				schema.config.json
			</ContextMenuTrigger>
			<ContextMenuPopup>
				<ContextMenuGroup>
					<ContextMenuGroupLabel>File actions</ContextMenuGroupLabel>
					<ContextMenuItem>
						<IconFileText aria-hidden="true" size={16} />
						Edit file
						<ContextMenuShortcut>⌘E</ContextMenuShortcut>
					</ContextMenuItem>
					<ContextMenuItem>
						<IconLink aria-hidden="true" size={16} />
						Copy relative path
						<ContextMenuShortcut>⌥⌘C</ContextMenuShortcut>
					</ContextMenuItem>
					<ContextMenuItem disabled>
						<IconHistory aria-hidden="true" size={16} />
						Revert to commit
					</ContextMenuItem>
					<ContextMenuLinkItem href="/components/menu">
						<IconExternalLink aria-hidden="true" size={16} />
						View menu docs
					</ContextMenuLinkItem>
				</ContextMenuGroup>

				<ContextMenuSeparator />

				<ContextMenuGroup>
					<ContextMenuGroupLabel>Settings</ContextMenuGroupLabel>
					<ContextMenuCheckboxItem defaultChecked>
						Track modifications
					</ContextMenuCheckboxItem>
					<ContextMenuCheckboxItem variant="switch">
						Format on save
					</ContextMenuCheckboxItem>
				</ContextMenuGroup>

				<ContextMenuSeparator />

				<ContextMenuGroup>
					<ContextMenuGroupLabel inset>Validation mode</ContextMenuGroupLabel>
					<ContextMenuRadioGroup defaultValue="strict">
						<ContextMenuRadioItem value="strict">Strict</ContextMenuRadioItem>
						<ContextMenuRadioItem value="lax">Lax</ContextMenuRadioItem>
						<ContextMenuRadioItem value="off">Off</ContextMenuRadioItem>
					</ContextMenuRadioGroup>
				</ContextMenuGroup>

				<ContextMenuSeparator />

				<ContextMenuSub>
					<ContextMenuSubTrigger inset>Export as</ContextMenuSubTrigger>
					<ContextMenuSubPopup>
						<ContextMenuItem>Production bundle</ContextMenuItem>
						<ContextMenuItem>Source archive tarball</ContextMenuItem>
						<ContextMenuItem>TypeScript declaration</ContextMenuItem>
					</ContextMenuSubPopup>
				</ContextMenuSub>

				<ContextMenuSeparator />

				<ContextMenuItem variant="destructive">
					<IconTrash aria-hidden="true" size={16} />
					Delete file
					<ContextMenuShortcut dir="ltr">⌫</ContextMenuShortcut>
				</ContextMenuItem>
			</ContextMenuPopup>
		</ContextMenu>
	);
}
