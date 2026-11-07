"use client";

import {
	Button,
	Group,
	Tooltip,
	TooltipCreateHandle,
	TooltipPopup,
	TooltipProvider,
	TooltipTrigger,
} from "@mizen-labs/ui";
import { IconBold, IconItalic, IconUnderline } from "@tabler/icons-react";
import { useState } from "react";

const actions = [
	{ hint: "Make text bold", icon: IconBold, label: "Bold" },
	{
		hint: "Apply italic formatting to text",
		icon: IconItalic,
		label: "Italic",
	},
	{ hint: "Underline text", icon: IconUnderline, label: "Underline" },
];
const animatedHandle = TooltipCreateHandle<string>();

export function TooltipGrouped() {
	return (
		<TooltipProvider>
			<Group>
				{actions.map(({ icon: Icon, label }) => (
					<Tooltip key={label}>
						<TooltipTrigger
							render={
								<Button aria-label={label} size="icon-sm" variant="outline" />
							}
						>
							<Icon aria-hidden="true" size={16} />
						</TooltipTrigger>
						<TooltipPopup>{label}</TooltipPopup>
					</Tooltip>
				))}
			</Group>
		</TooltipProvider>
	);
}

export function TooltipAnimated() {
	return (
		<TooltipProvider>
			<Group>
				{actions.map(({ icon: Icon, label, hint }) => (
					<TooltipTrigger
						handle={animatedHandle}
						key={label}
						payload={hint}
						render={
							<Button
								aria-label={`Format ${label.toLowerCase()}`}
								size="icon-sm"
								variant="outline"
							/>
						}
					>
						<Icon aria-hidden="true" size={16} />
					</TooltipTrigger>
				))}
			</Group>
			<Tooltip handle={animatedHandle}>
				{({ payload }) => <TooltipPopup>{payload}</TooltipPopup>}
			</Tooltip>
		</TooltipProvider>
	);
}

export function TooltipPositions() {
	return (
		<Group>
			{(["top", "right", "bottom", "left"] as const).map((side) => (
				<Tooltip key={side}>
					<TooltipTrigger render={<Button variant="outline" />}>
						{side}
					</TooltipTrigger>
					<TooltipPopup side={side}>Hint on the {side}</TooltipPopup>
				</Tooltip>
			))}
		</Group>
	);
}

export function TooltipDisabled() {
	return (
		<Tooltip disabled>
			<TooltipTrigger render={<Button variant="outline" />}>
				Hints disabled
			</TooltipTrigger>
			<TooltipPopup>This hint stays closed.</TooltipPopup>
		</Tooltip>
	);
}

export function TooltipControlled() {
	const [open, setOpen] = useState(false);
	return (
		<Tooltip onOpenChange={setOpen} open={open}>
			<TooltipTrigger render={<Button variant="outline" />}>
				Release identifier
			</TooltipTrigger>
			<TooltipPopup portalProps={{ keepMounted: true }}>
				release_2026_10_13_production_europe_west_workspace_permissions_revision_1842
			</TooltipPopup>
		</Tooltip>
	);
}
