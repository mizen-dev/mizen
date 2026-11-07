"use client";
import {
	Field,
	Select,
	SelectItem,
	SelectLabel,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "@mizen/ui";
import { useState } from "react";

export function WorkspaceSelect() {
	return (
		<Select
			defaultValue="personal"
			items={{ personal: "Personal", team: "Product team" }}
			name="workspace"
		>
			<SelectLabel>Workspace</SelectLabel>
			<SelectTrigger>
				<SelectValue placeholder="Choose a workspace" />
			</SelectTrigger>
			<SelectPopup>
				<SelectItem value="personal">Personal</SelectItem>
				<SelectItem value="team">Product team</SelectItem>
			</SelectPopup>
		</Select>
	);
}
export function MultipleSelect() {
	const [channels, setChannels] = useState<string[]>(["email"]);
	return (
		<Select
			items={{ email: "Email", push: "Push notifications" }}
			multiple
			name="channels"
			onValueChange={setChannels}
			value={channels}
		>
			<SelectLabel>Notification channels</SelectLabel>
			<SelectTrigger>
				<SelectValue placeholder="Choose channels" />
			</SelectTrigger>
			<SelectPopup>
				<SelectItem value="email">Email</SelectItem>
				<SelectItem value="push">Push notifications</SelectItem>
			</SelectPopup>
		</Select>
	);
}
export function SelectSmallSelect() {
	return (
		<Select>
			<SelectTrigger aria-label="Small select" size="sm">
				<SelectValue placeholder="Small" />
			</SelectTrigger>
			<SelectPopup>
				<SelectItem value="small">Small option</SelectItem>
			</SelectPopup>
		</Select>
	);
}
export function SelectLargeSelect() {
	return (
		<Select>
			<SelectTrigger aria-label="Large select" size="lg">
				<SelectValue placeholder="Large" />
			</SelectTrigger>
			<SelectPopup>
				<SelectItem value="large">Large option</SelectItem>
			</SelectPopup>
		</Select>
	);
}
export function SelectManagedSelect() {
	return (
		<Select disabled readOnly>
			<SelectTrigger aria-label="Managed select">
				<SelectValue placeholder="Managed setting" />
			</SelectTrigger>
			<SelectPopup>
				<SelectItem value="managed">Managed setting</SelectItem>
			</SelectPopup>
		</Select>
	);
}
export function SelectReadonlySelect() {
	return (
		<Select readOnly>
			<SelectTrigger aria-label="Read-only select">
				<SelectValue placeholder="Read-only mode" />
			</SelectTrigger>
			<SelectPopup>
				<SelectItem value="readonly">Read-only mode</SelectItem>
			</SelectPopup>
		</Select>
	);
}
export function SelectRequiredWorkspace() {
	return (
		<Field invalid>
			<Select>
				<SelectLabel>Required workspace</SelectLabel>
				<SelectTrigger invalid>
					<SelectValue placeholder="Choose a workspace" />
				</SelectTrigger>
				<SelectPopup>
					<SelectItem value="personal">Personal</SelectItem>
				</SelectPopup>
			</Select>
		</Field>
	);
}
