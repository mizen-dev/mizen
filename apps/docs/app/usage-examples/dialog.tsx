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
	DialogTrigger,
} from "@mizen/ui";
import { useCallback, useState } from "react";

export function BasicDialog() {
	return (
		<Dialog>
			<DialogTrigger
				render={<Button variant="outline">About this workspace</Button>}
			/>
			<DialogPopup size="sm">
				<DialogHeader>
					<DialogTitle>Product workspace</DialogTitle>
					<DialogDescription>
						A shared place for your team's projects.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button>Done</Button>} />
				</DialogFooter>
			</DialogPopup>
		</Dialog>
	);
}

export function ControlledDialog() {
	const [open, setOpen] = useState(false);
	const close = useCallback(() => setOpen(false), []);
	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger
				render={<Button variant="outline">Review notifications</Button>}
			/>
			<DialogPopup size="sm">
				<DialogHeader>
					<DialogTitle>Notification preferences</DialogTitle>
					<DialogDescription>
						Workspace notifications are enabled. This example does not save
						settings.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={close}>Close review</Button>
				</DialogFooter>
			</DialogPopup>
		</Dialog>
	);
}
