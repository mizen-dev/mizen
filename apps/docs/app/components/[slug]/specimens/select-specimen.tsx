"use client";

import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "@mizen-labs/ui";

export function SelectSpecimen() {
	return (
		<Select
			items={{ personal: "Personal", team: "Product team" }}
			name="workspace"
		>
			<SelectTrigger aria-label="Workspace">
				<SelectValue placeholder="Choose a workspace" />
			</SelectTrigger>
			<SelectPopup>
				<SelectItem value="personal">Personal</SelectItem>
				<SelectItem value="team">Product team</SelectItem>
			</SelectPopup>
		</Select>
	);
}
