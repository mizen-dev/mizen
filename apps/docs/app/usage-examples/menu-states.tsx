"use client";

import {
	Button,
	Dialog,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
	Menu,
	MenuCheckboxItem,
	MenuGroup,
	MenuGroupLabel,
	MenuItem,
	MenuLinkItem,
	MenuPopup,
	MenuRadioGroup,
	MenuRadioItem,
	MenuSeparator,
	MenuSub,
	MenuSubPopup,
	MenuSubTrigger,
	MenuTrigger,
} from "@mizen-labs/ui";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

export function MenuOpenOnHover() {
	return (
		<Menu>
			<MenuTrigger openOnHover render={<Button variant="outline" />}>
				Hover for workspace actions
			</MenuTrigger>
			<MenuPopup>
				<MenuItem>New workspace</MenuItem>
				<MenuItem>Invite members</MenuItem>
			</MenuPopup>
		</Menu>
	);
}

export function MenuWithCheckbox() {
	const [notifications, setNotifications] = useState(true);
	return (
		<Menu>
			<MenuTrigger render={<Button variant="outline" />}>
				Notification options
			</MenuTrigger>
			<MenuPopup>
				<MenuCheckboxItem
					checked={notifications}
					onCheckedChange={setNotifications}
				>
					Email notifications
				</MenuCheckboxItem>
				<MenuCheckboxItem>Weekly summary</MenuCheckboxItem>
				<MenuCheckboxItem disabled>SMS notifications</MenuCheckboxItem>
			</MenuPopup>
		</Menu>
	);
}

export function MenuWithSwitch() {
	return (
		<Menu>
			<MenuTrigger render={<Button variant="outline" />}>
				Editor preferences
			</MenuTrigger>
			<MenuPopup>
				<MenuCheckboxItem defaultChecked variant="switch">
					Auto save
				</MenuCheckboxItem>
				<MenuCheckboxItem variant="switch">Spell check</MenuCheckboxItem>
				<MenuCheckboxItem disabled variant="switch">
					Live translation
				</MenuCheckboxItem>
			</MenuPopup>
		</Menu>
	);
}

export function MenuWithRadioGroup() {
	const [sort, setSort] = useState("recent");
	return (
		<Menu>
			<MenuTrigger render={<Button variant="outline" />}>
				Sort projects
			</MenuTrigger>
			<MenuPopup>
				<MenuRadioGroup onValueChange={setSort} value={sort}>
					<MenuRadioItem value="recent">Most recent</MenuRadioItem>
					<MenuRadioItem value="name">Name</MenuRadioItem>
					<MenuRadioItem disabled value="priority">
						Priority
					</MenuRadioItem>
				</MenuRadioGroup>
			</MenuPopup>
		</Menu>
	);
}

export function MenuWithLink() {
	return (
		<Menu>
			<MenuTrigger render={<Button variant="outline" />}>
				Browse documentation
			</MenuTrigger>
			<MenuPopup>
				<MenuLinkItem render={<Link href="/components/button" />}>
					Button documentation
				</MenuLinkItem>
				<MenuLinkItem render={<Link href="/components/field" />}>
					Field documentation
				</MenuLinkItem>
				<MenuItem disabled>Unavailable page</MenuItem>
			</MenuPopup>
		</Menu>
	);
}

export function MenuWithGroupLabel() {
	return (
		<Menu>
			<MenuTrigger render={<Button variant="outline" />}>
				Account actions
			</MenuTrigger>
			<MenuPopup>
				<MenuGroup>
					<MenuGroupLabel>Account</MenuGroupLabel>
					<MenuItem>Profile</MenuItem>
					<MenuItem>Billing</MenuItem>
				</MenuGroup>
				<MenuSeparator />
				<MenuGroup>
					<MenuGroupLabel>Support</MenuGroupLabel>
					<MenuItem>Contact support</MenuItem>
					<MenuItem>Keyboard shortcuts</MenuItem>
				</MenuGroup>
			</MenuPopup>
		</Menu>
	);
}

export function MenuNested() {
	return (
		<Menu>
			<MenuTrigger render={<Button variant="outline" />}>
				Export project
			</MenuTrigger>
			<MenuPopup>
				<MenuItem>Download archive</MenuItem>
				<MenuSub>
					<MenuSubTrigger>Export format</MenuSubTrigger>
					<MenuSubPopup align="center">
						<MenuItem>PDF document</MenuItem>
						<MenuSub>
							<MenuSubTrigger>Image</MenuSubTrigger>
							<MenuSubPopup>
								<MenuItem>PNG image</MenuItem>
								<MenuItem>JPEG image</MenuItem>
							</MenuSubPopup>
						</MenuSub>
					</MenuSubPopup>
				</MenuSub>
			</MenuPopup>
		</Menu>
	);
}

export function MenuCloseOnClick() {
	return (
		<Menu>
			<MenuTrigger render={<Button variant="outline" />}>
				Quick actions
			</MenuTrigger>
			<MenuPopup>
				<MenuItem closeOnClick>New document</MenuItem>
				<MenuItem closeOnClick>New folder</MenuItem>
				<MenuItem closeOnClick={false}>Keep this menu open</MenuItem>
			</MenuPopup>
		</Menu>
	);
}

export function MenuOpenDialog() {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const showSettings = useCallback(() => setOpen(true), []);
	return (
		<>
			<Menu>
				<MenuTrigger ref={triggerRef} render={<Button variant="outline" />}>
					Workspace settings menu
				</MenuTrigger>
				<MenuPopup>
					<MenuItem onClick={showSettings}>Open workspace settings</MenuItem>
				</MenuPopup>
			</Menu>
			<Dialog onOpenChange={setOpen} open={open}>
				<DialogPopup finalFocus={triggerRef}>
					<DialogHeader>
						<DialogTitle>Workspace settings</DialogTitle>
						<DialogDescription>
							Review preferences without leaving this page.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose render={<Button variant="outline" />}>
							Close settings
						</DialogClose>
					</DialogFooter>
				</DialogPopup>
			</Dialog>
		</>
	);
}

export function MenuDisabled() {
	return (
		<Menu>
			<MenuTrigger disabled render={<Button disabled variant="outline" />}>
				Actions unavailable
			</MenuTrigger>
			<MenuPopup>
				<MenuItem>New project</MenuItem>
			</MenuPopup>
		</Menu>
	);
}

const projects = Array.from(
	{ length: 24 },
	(_, index) => `Project ${index + 1}`
);
export function MenuScrollable() {
	return (
		<Menu>
			<MenuTrigger render={<Button variant="outline" />}>
				Switch project
			</MenuTrigger>
			<MenuPopup>
				<MenuGroup>
					<MenuGroupLabel>Projects</MenuGroupLabel>
					{projects.map((project) => (
						<MenuItem key={project}>{project}</MenuItem>
					))}
				</MenuGroup>
				<MenuSeparator />
				<MenuItem>
					Workspace research and documentation for the autumn product release
				</MenuItem>
			</MenuPopup>
		</Menu>
	);
}
