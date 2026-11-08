"use client";

import {
	Button,
	Card,
	Command,
	CommandCollection,
	CommandDialog,
	CommandDialogPopup,
	CommandDialogPrimitive,
	CommandDialogTrigger,
	CommandEmpty,
	CommandFooter,
	CommandGroup,
	CommandGroupLabel,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPanel,
	CommandShortcut,
	Inline,
	Kbd,
	KbdGroup,
	Stack,
} from "@mizen-labs/ui";
import { SpecimenSection } from "./specimen-section";

interface CommandAction {
	readonly label: string;
	readonly shortcut?: string;
	readonly value: string;
}

interface CommandGroupData {
	readonly items: readonly CommandAction[];
	readonly value: string;
}

const actions: readonly CommandAction[] = [
	{ label: "New document", shortcut: "⌘N", value: "new-document" },
	{ label: "Copy link", shortcut: "⌘C", value: "copy-link" },
	{ label: "Duplicate project", value: "duplicate-project" },
	{ label: "Archive item", shortcut: "⌘⌫", value: "archive-item" },
];

const navigation: readonly CommandAction[] = [
	{ label: "Dashboard", shortcut: "G D", value: "go-dashboard" },
	{ label: "Projects", shortcut: "G P", value: "go-projects" },
	{ label: "Team settings", shortcut: "G S", value: "go-settings" },
	{ label: "Documentation", value: "go-docs" },
];

const groupedItems: readonly CommandGroupData[] = [
	{ items: actions, value: "Actions" },
	{ items: navigation, value: "Navigation" },
];

export function CommandSpecimen() {
	return (
		<Stack gap="8">
			<SpecimenSection
				description="Opens an accessible command palette dialog with backdrop, search input, and keyboard navigation."
				primary
				title="Modal command palette"
			>
				<Inline>
					<CommandDialog>
						<CommandDialogTrigger
							render={
								<Button variant="outline">
									Open Command Palette
									<KbdGroup>
										<Kbd>⌘</Kbd>
										<Kbd>K</Kbd>
									</KbdGroup>
								</Button>
							}
						/>
						<CommandDialogPopup aria-label="Command palette">
							<Command items={groupedItems}>
								<CommandInput placeholder="Type a command or search..." />
								<CommandPanel>
									<CommandEmpty>No results found.</CommandEmpty>
									<CommandList>
										{(group: CommandGroupData) => (
											<CommandGroup items={group.items} key={group.value}>
												<CommandGroupLabel>{group.value}</CommandGroupLabel>
												<CommandCollection>
													{(item: CommandAction) => (
														<CommandItem key={item.value} value={item.value}>
															{item.label}
															{item.shortcut ? (
																<CommandShortcut>
																	{item.shortcut}
																</CommandShortcut>
															) : null}
														</CommandItem>
													)}
												</CommandCollection>
											</CommandGroup>
										)}
									</CommandList>
								</CommandPanel>
								<CommandFooter>
									<span>Navigation</span>
									<Inline>
										<Kbd>Esc</Kbd>
										<span>to close</span>
									</Inline>
									<CommandDialogPrimitive.Close
										render={
											<Button size="sm" variant="outline">
												Close
											</Button>
										}
									/>
								</CommandFooter>
							</Command>
						</CommandDialogPopup>
					</CommandDialog>
				</Inline>
			</SpecimenSection>

			<SpecimenSection
				canvas={false}
				description="Embeds an inline command palette within any panel, sheet, or page layout."
				title="Standalone command palette"
			>
				<Card>
					<Command items={groupedItems}>
						<CommandInput placeholder="Filter actions and pages..." />
						<CommandPanel>
							<CommandEmpty>No matching results.</CommandEmpty>
							<CommandList>
								{(group: CommandGroupData) => (
									<CommandGroup items={group.items} key={group.value}>
										<CommandGroupLabel>{group.value}</CommandGroupLabel>
										<CommandCollection>
											{(item: CommandAction) => (
												<CommandItem key={item.value} value={item.value}>
													{item.label}
													{item.shortcut ? (
														<CommandShortcut>{item.shortcut}</CommandShortcut>
													) : null}
												</CommandItem>
											)}
										</CommandCollection>
									</CommandGroup>
								)}
							</CommandList>
						</CommandPanel>
						<CommandFooter>
							<span>Standalone mode</span>
							<Inline>
								<Kbd>↑</Kbd>
								<Kbd>↓</Kbd>
								<span>to select</span>
							</Inline>
						</CommandFooter>
					</Command>
				</Card>
			</SpecimenSection>
		</Stack>
	);
}
