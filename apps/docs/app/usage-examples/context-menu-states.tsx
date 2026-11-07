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
	ContextMenuSub,
	ContextMenuSubPopup,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
	Dialog,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@mizen-labs/ui";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

export function ContextMenuWithLink() {
	return (
		<ContextMenu>
			<ContextMenuTrigger render={<Button variant="outline" />}>
				Right-click documentation
			</ContextMenuTrigger>
			<ContextMenuPopup>
				<ContextMenuLinkItem render={<Link href="/components/button" />}>
					Button documentation
				</ContextMenuLinkItem>
				<ContextMenuLinkItem render={<Link href="/components/field" />}>
					Field documentation
				</ContextMenuLinkItem>
			</ContextMenuPopup>
		</ContextMenu>
	);
}

export function ContextMenuNested() {
	return (
		<ContextMenu>
			<ContextMenuTrigger render={<Button variant="outline" />}>
				Right-click export options
			</ContextMenuTrigger>
			<ContextMenuPopup>
				<ContextMenuItem>Download archive</ContextMenuItem>
				<ContextMenuSub>
					<ContextMenuSubTrigger>Export format</ContextMenuSubTrigger>
					<ContextMenuSubPopup align="center">
						<ContextMenuItem>PDF document</ContextMenuItem>
						<ContextMenuSub>
							<ContextMenuSubTrigger>Image</ContextMenuSubTrigger>
							<ContextMenuSubPopup>
								<ContextMenuItem>PNG image</ContextMenuItem>
								<ContextMenuItem>JPEG image</ContextMenuItem>
							</ContextMenuSubPopup>
						</ContextMenuSub>
					</ContextMenuSubPopup>
				</ContextMenuSub>
			</ContextMenuPopup>
		</ContextMenu>
	);
}

export function ContextMenuWithCheckbox() {
	const [tracked, setTracked] = useState(true);
	return (
		<ContextMenu>
			<ContextMenuTrigger render={<Button variant="outline" />}>
				Right-click file preferences
			</ContextMenuTrigger>
			<ContextMenuPopup>
				<ContextMenuCheckboxItem checked={tracked} onCheckedChange={setTracked}>
					Track changes
				</ContextMenuCheckboxItem>
				<ContextMenuCheckboxItem>Show hidden files</ContextMenuCheckboxItem>
				<ContextMenuCheckboxItem disabled>
					Sync protected files
				</ContextMenuCheckboxItem>
			</ContextMenuPopup>
		</ContextMenu>
	);
}

export function ContextMenuWithGroupLabel() {
	return (
		<ContextMenu>
			<ContextMenuTrigger render={<Button variant="outline" />}>
				Right-click file actions
			</ContextMenuTrigger>
			<ContextMenuPopup>
				<ContextMenuGroup>
					<ContextMenuGroupLabel>File</ContextMenuGroupLabel>
					<ContextMenuItem>Rename</ContextMenuItem>
					<ContextMenuItem>Duplicate</ContextMenuItem>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuGroupLabel>Sharing</ContextMenuGroupLabel>
					<ContextMenuItem>Copy link</ContextMenuItem>
					<ContextMenuItem>Manage access</ContextMenuItem>
				</ContextMenuGroup>
			</ContextMenuPopup>
		</ContextMenu>
	);
}

export function ContextMenuWithRadioGroup() {
	const [order, setOrder] = useState("name");
	return (
		<ContextMenu>
			<ContextMenuTrigger render={<Button variant="outline" />}>
				Right-click file order
			</ContextMenuTrigger>
			<ContextMenuPopup>
				<ContextMenuRadioGroup onValueChange={setOrder} value={order}>
					<ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
					<ContextMenuRadioItem value="modified">
						Last modified
					</ContextMenuRadioItem>
					<ContextMenuRadioItem disabled value="priority">
						Priority
					</ContextMenuRadioItem>
				</ContextMenuRadioGroup>
			</ContextMenuPopup>
		</ContextMenu>
	);
}

export function ContextMenuCloseOnClick() {
	return (
		<ContextMenu>
			<ContextMenuTrigger render={<Button variant="outline" />}>
				Right-click quick actions
			</ContextMenuTrigger>
			<ContextMenuPopup>
				<ContextMenuItem closeOnClick>New file</ContextMenuItem>
				<ContextMenuItem closeOnClick={false}>
					Keep this menu open
				</ContextMenuItem>
			</ContextMenuPopup>
		</ContextMenu>
	);
}

export function ContextMenuOpenDialog() {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLElement>(null);
	const setTriggerRef = useCallback((node: HTMLElement | null) => {
		triggerRef.current = node;
	}, []);
	const showSettings = useCallback(() => setOpen(true), []);
	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger
					ref={setTriggerRef}
					render={<Button variant="outline" />}
				>
					Right-click file settings
				</ContextMenuTrigger>
				<ContextMenuPopup>
					<ContextMenuItem onClick={showSettings}>
						Open file settings
					</ContextMenuItem>
				</ContextMenuPopup>
			</ContextMenu>
			<Dialog onOpenChange={setOpen} open={open}>
				<DialogPopup finalFocus={triggerRef}>
					<DialogHeader>
						<DialogTitle>File settings</DialogTitle>
						<DialogDescription>
							Review access and sharing preferences.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose render={<Button variant="outline" />}>
							Close file settings
						</DialogClose>
					</DialogFooter>
				</DialogPopup>
			</Dialog>
		</>
	);
}

export function ContextMenuWithSwitch() {
	return (
		<ContextMenu>
			<ContextMenuTrigger render={<Button variant="outline" />}>
				Right-click editor preferences
			</ContextMenuTrigger>
			<ContextMenuPopup>
				<ContextMenuCheckboxItem defaultChecked variant="switch">
					Auto save
				</ContextMenuCheckboxItem>
				<ContextMenuCheckboxItem variant="switch">
					Spell check
				</ContextMenuCheckboxItem>
				<ContextMenuCheckboxItem disabled variant="switch">
					Live translation
				</ContextMenuCheckboxItem>
			</ContextMenuPopup>
		</ContextMenu>
	);
}

const files = Array.from({ length: 24 }, (_, index) => `Document ${index + 1}`);

export function ContextMenuScrollable() {
	return (
		<ContextMenu>
			<ContextMenuTrigger render={<Button variant="outline" />}>
				Right-click recent files
			</ContextMenuTrigger>
			<ContextMenuPopup render={<section />}>
				<ContextMenuGroup>
					<ContextMenuGroupLabel>Recent files</ContextMenuGroupLabel>
					{files.map((file) => (
						<ContextMenuItem key={file}>{file}</ContextMenuItem>
					))}
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuItem>
					Workspace research and documentation for the autumn product release
				</ContextMenuItem>
			</ContextMenuPopup>
		</ContextMenu>
	);
}
