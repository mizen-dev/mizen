"use client";

import {
	Button,
	Group,
	Input,
	Popover,
	PopoverClose,
	PopoverCreateHandle,
	PopoverDescription,
	PopoverPopup,
	PopoverTitle,
	PopoverTrigger,
	Stack,
} from "@mizen/ui";
import { space } from "@mizen/ui/spacing.stylex";
import { create, props } from "@stylexjs/stylex";
import { IconBell, IconInfoCircle, IconUser, IconX } from "@tabler/icons-react";
import { useState } from "react";

const styles = create({
	header: {
		alignItems: "center",
		display: "flex",
		gap: space["2"],
		justifyContent: "space-between",
	},
});

export function PopoverWithCloseButton() {
	return (
		<Popover>
			<PopoverTrigger render={<Button variant="outline" />}>
				Notifications
			</PopoverTrigger>
			<PopoverPopup>
				<div {...props(styles.header)}>
					<PopoverTitle>Notifications</PopoverTitle>
					<PopoverClose
						aria-label="Close notifications"
						render={
							<Button
								aria-label="Close notifications"
								size="icon-xs"
								variant="ghost"
							/>
						}
					>
						<IconX aria-hidden size={16} />
					</PopoverClose>
				</div>
				<PopoverDescription>You have no new notifications.</PopoverDescription>
				<PopoverClose render={<Button size="sm" variant="outline" />}>
					Close
				</PopoverClose>
			</PopoverPopup>
		</Popover>
	);
}

export function PopoverTooltipStyle() {
	return (
		<Popover>
			<PopoverTrigger
				openOnHover
				render={
					<Button
						aria-label="Password requirements"
						size="icon-sm"
						variant="ghost"
					/>
				}
			>
				<IconInfoCircle aria-hidden size={16} />
			</PopoverTrigger>
			<PopoverPopup side="top" tooltipStyle>
				Use at least eight characters.
			</PopoverPopup>
		</Popover>
	);
}

const handle = PopoverCreateHandle<"notifications" | "profile">();

export function PopoverAnimated() {
	return (
		<Group>
			<PopoverTrigger
				handle={handle}
				payload="notifications"
				render={
					<Button
						aria-label="Shared notifications"
						size="icon-sm"
						variant="outline"
					/>
				}
			>
				<IconBell aria-hidden size={16} />
			</PopoverTrigger>
			<PopoverTrigger
				handle={handle}
				payload="profile"
				render={
					<Button
						aria-label="Shared profile"
						size="icon-sm"
						variant="outline"
					/>
				}
			>
				<IconUser aria-hidden size={16} />
			</PopoverTrigger>
			<Popover handle={handle}>
				{({ payload }) => (
					<PopoverPopup>
						<PopoverTitle>
							{payload === "profile" ? "Maya Chen" : "Notifications"}
						</PopoverTitle>
						<PopoverDescription>
							{payload === "profile"
								? "Product designer in the Northstar workspace."
								: "You have no new notifications."}
						</PopoverDescription>
						{payload === "profile" && (
							<PopoverClose render={<Button size="sm" variant="outline" />}>
								View profile
							</PopoverClose>
						)}
					</PopoverPopup>
				)}
			</Popover>
		</Group>
	);
}

export function PopoverControlled() {
	const [open, setOpen] = useState(false);
	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger render={<Button variant="outline" />}>
				Quick note
			</PopoverTrigger>
			<PopoverPopup portalProps={{ keepMounted: true }} render={<section />}>
				<PopoverTitle>Quick note</PopoverTitle>
				<PopoverDescription>
					Your draft stays here when you close this popup.
				</PopoverDescription>
				<Input aria-label="Note draft" placeholder="Write a note…" />
				<PopoverClose render={<Button size="sm" />}>Done</PopoverClose>
			</PopoverPopup>
		</Popover>
	);
}

export function PopoverPositions() {
	return (
		<Group>
			{(["top", "right", "bottom", "left"] as const).map((side) => (
				<Popover key={side}>
					<PopoverTrigger render={<Button variant="outline" />}>
						{side}
					</PopoverTrigger>
					<PopoverPopup align="start" side={side}>
						<PopoverTitle>Anchored {side}</PopoverTitle>
						<PopoverDescription>
							Repositions at the viewport edge.
						</PopoverDescription>
					</PopoverPopup>
				</Popover>
			))}
		</Group>
	);
}

export function PopoverDisabled() {
	return (
		<Stack gap="2">
			<Popover>
				<PopoverTrigger disabled render={<Button variant="outline" />}>
					Unavailable
				</PopoverTrigger>
				<PopoverPopup>
					<PopoverTitle>Unavailable information</PopoverTitle>
				</PopoverPopup>
			</Popover>
		</Stack>
	);
}
