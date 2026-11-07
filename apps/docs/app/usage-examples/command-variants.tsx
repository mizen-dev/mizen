"use client";
import {
	Button,
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
import {
	IconArchive,
	IconArrowDown,
	IconArrowUp,
	IconBook2,
	IconCopy,
	IconCornerDownLeft,
	IconFilePlus,
	IconFolders,
	IconLayoutDashboard,
	IconLink,
	IconSettings,
} from "@tabler/icons-react";
import { type ReactNode, useCallback, useState } from "react";

interface CommandAction {
	readonly icon: ReactNode;
	readonly label: string;
	readonly shortcut?: readonly string[];
	readonly value: string;
}
interface CommandGroupData {
	readonly items: readonly CommandAction[];
	readonly value: string;
}
const actions: readonly CommandAction[] = [
	{
		icon: <IconFilePlus aria-hidden="true" size={16} stroke={1.75} />,
		label: "New document",
		shortcut: ["⌘", "N"],
		value: "new-document",
	},
	{
		icon: <IconLink aria-hidden="true" size={16} stroke={1.75} />,
		label: "Copy link",
		shortcut: ["⌘", "C"],
		value: "copy-link",
	},
	{
		icon: <IconCopy aria-hidden="true" size={16} stroke={1.75} />,
		label: "Duplicate project",
		value: "duplicate-project",
	},
	{
		icon: <IconArchive aria-hidden="true" size={16} stroke={1.75} />,
		label: "Archive item",
		shortcut: ["⌘", "⌫"],
		value: "archive-item",
	},
];
const navigation: readonly CommandAction[] = [
	{
		icon: <IconLayoutDashboard aria-hidden="true" size={16} stroke={1.75} />,
		label: "Dashboard",
		shortcut: ["G", "D"],
		value: "go-dashboard",
	},
	{
		icon: <IconFolders aria-hidden="true" size={16} stroke={1.75} />,
		label: "Projects",
		shortcut: ["G", "P"],
		value: "go-projects",
	},
	{
		icon: <IconSettings aria-hidden="true" size={16} stroke={1.75} />,
		label: "Team settings",
		shortcut: ["G", "S"],
		value: "go-settings",
	},
	{
		icon: <IconBook2 aria-hidden="true" size={16} stroke={1.75} />,
		label: "Documentation",
		value: "go-docs",
	},
];
const groupedItems: readonly CommandGroupData[] = [
	{ items: actions, value: "Actions" },
	{ items: navigation, value: "Navigation" },
];
export function CommandModalCommandPaletteExample1() {
	const [open, setOpen] = useState(false);
	const close = useCallback(() => setOpen(false), []);
	return (
		<Stack gap="4">
			<Inline>
				<CommandDialog onOpenChange={setOpen} open={open}>
					<CommandDialogTrigger
						render={<Button variant="outline">Open Command Palette</Button>}
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
													<CommandItem
														key={item.value}
														onClick={close}
														value={item.value}
													>
														{item.icon}
														{item.label}
														{item.shortcut ? (
															<CommandShortcut>
																{item.shortcut.map((key) => (
																	<Kbd key={key}>{key}</Kbd>
																))}
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
										<Button size="xs" variant="ghost">
											Close
										</Button>
									}
								/>
							</CommandFooter>
						</Command>
					</CommandDialogPopup>
				</CommandDialog>
			</Inline>
		</Stack>
	);
}
export function CommandGroupedPaletteExample2() {
	const [open, setOpen] = useState(false);
	const close = useCallback(() => setOpen(false), []);
	return (
		<Stack gap="4">
			<CommandDialog onOpenChange={setOpen} open={open}>
				<CommandDialogTrigger
					render={<Button variant="outline">Search actions and pages</Button>}
				/>
				<CommandDialogPopup aria-label="Actions and pages">
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
												<CommandItem
													key={item.value}
													onClick={close}
													value={item.value}
												>
													{item.icon}
													{item.label}
													{item.shortcut ? (
														<CommandShortcut>
															{item.shortcut.map((key) => (
																<Kbd key={key}>{key}</Kbd>
															))}
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
							<Inline>
								<Inline>
									<KbdGroup>
										<Kbd>
											<IconArrowUp aria-hidden="true" size={12} />
										</Kbd>
										<Kbd>
											<IconArrowDown aria-hidden="true" size={12} />
										</Kbd>
									</KbdGroup>
									<span>Navigate</span>
								</Inline>
								<Inline>
									<Kbd>
										<IconCornerDownLeft aria-hidden="true" size={12} />
									</Kbd>
									<span>Run</span>
								</Inline>
							</Inline>
							<Inline>
								<Kbd>Esc</Kbd>
								<span>Close</span>
							</Inline>
						</CommandFooter>
					</Command>
				</CommandDialogPopup>
			</CommandDialog>
		</Stack>
	);
}
