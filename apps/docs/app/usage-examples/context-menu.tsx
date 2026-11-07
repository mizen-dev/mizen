import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuPopup,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuTrigger,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import {
	IconDownload,
	IconExternalLink,
	IconFileTypePdf,
	IconLink,
	IconPin,
	IconTrash,
} from "@tabler/icons-react";
import { contextMenuPreviewStyles as styles } from "./context-menu-preview.styles";

export function FileContextMenu() {
	return (
		<ContextMenu>
			<ContextMenuTrigger
				render={
					// Focusable, so Shift+F10 or the menu key opens it too.
					// biome-ignore lint/a11y/noNoninteractiveTabindex: a context menu target needs keyboard focus.
					<div tabIndex={0} {...props(styles.area)} />
				}
			>
				<IconFileTypePdf aria-hidden="true" size={24} {...props(styles.icon)} />
				<span {...props(styles.name)}>Launch brief.pdf</span>
				<span {...props(styles.hint)}>Right-click or press and hold</span>
			</ContextMenuTrigger>
			<ContextMenuPopup>
				<ContextMenuItem>
					<IconExternalLink aria-hidden="true" size={16} />
					Open
					<ContextMenuShortcut>⌘O</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					<IconLink aria-hidden="true" size={16} />
					Copy link
					<ContextMenuShortcut>⌥⌘C</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					<IconDownload aria-hidden="true" size={16} />
					Download
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem>
					<IconPin aria-hidden="true" size={16} />
					Pin to sidebar
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem variant="destructive">
					<IconTrash aria-hidden="true" size={16} />
					Move to trash
				</ContextMenuItem>
			</ContextMenuPopup>
		</ContextMenu>
	);
}
