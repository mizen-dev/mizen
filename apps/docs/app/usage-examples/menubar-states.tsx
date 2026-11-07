"use client";

import {
	Menu,
	Menubar,
	MenubarTrigger,
	MenuCheckboxItem,
	MenuItem,
	MenuPopup,
	MenuRadioGroup,
	MenuRadioItem,
	MenuSeparator,
	MenuShortcut,
	MenuSub,
	MenuSubPopup,
	MenuSubTrigger,
	Stack,
	Text,
} from "@mizen/ui";
import { IconFile, IconSettings } from "@tabler/icons-react";
import { useState } from "react";

export function MenubarWithOptions() {
	const [autosave, setAutosave] = useState(true);
	const [density, setDensity] = useState("comfortable");
	return (
		<Stack gap="2">
			<Menubar aria-label="Document settings">
				<Menu>
					<MenubarTrigger>
						<IconFile aria-hidden="true" />
						Document
					</MenubarTrigger>
					<MenuPopup>
						<MenuItem>
							New document
							<MenuShortcut>⌘N</MenuShortcut>
						</MenuItem>
						<MenuItem disabled>Export document</MenuItem>
						<MenuSeparator />
						<MenuSub>
							<MenuSubTrigger>Recent documents</MenuSubTrigger>
							<MenuSubPopup>
								<MenuItem>Release notes</MenuItem>
								<MenuItem>Design review</MenuItem>
							</MenuSubPopup>
						</MenuSub>
					</MenuPopup>
				</Menu>
				<Menu>
					<MenubarTrigger>
						<IconSettings aria-hidden="true" />
						Preferences
					</MenubarTrigger>
					<MenuPopup>
						<MenuCheckboxItem checked={autosave} onCheckedChange={setAutosave}>
							Autosave
						</MenuCheckboxItem>
						<MenuSeparator />
						<MenuRadioGroup onValueChange={setDensity} value={density}>
							<MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
							<MenuRadioItem value="compact">Compact</MenuRadioItem>
						</MenuRadioGroup>
					</MenuPopup>
				</Menu>
			</Menubar>
			<Text aria-live="polite" size="ui" tone="muted">
				Autosave {autosave ? "on" : "off"}. Density: {density}.
			</Text>
		</Stack>
	);
}

export function MenubarDisabled() {
	return (
		<Menubar aria-label="Disabled commands" disabled>
			<Menu>
				<MenubarTrigger>File unavailable</MenubarTrigger>
				<MenuPopup>
					<MenuItem>New file</MenuItem>
				</MenuPopup>
			</Menu>
			<Menu>
				<MenubarTrigger>Edit unavailable</MenubarTrigger>
				<MenuPopup>
					<MenuItem>Undo</MenuItem>
				</MenuPopup>
			</Menu>
		</Menubar>
	);
}
