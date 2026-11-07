"use client";

import {
	Button,
	Command,
	CommandDialog,
	CommandDialogPopup,
	CommandDialogTrigger,
	CommandEmpty,
	CommandFooter,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPanel,
	Inline,
	Kbd,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { useCallback, useMemo, useState } from "react";

export function ProjectCommand() {
	const items = useMemo(
		() => ["Northstar launch", "Field notes", "Design review"],
		[]
	);
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<string | null>(null);
	const selectProject = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			setSelected(event.currentTarget.textContent);
			setOpen(false);
		},
		[]
	);
	const renderItem = useCallback(
		(item: string) => (
			<CommandItem key={item} onClick={selectProject} value={item}>
				{item}
			</CommandItem>
		),
		[selectProject]
	);
	return (
		<Stack>
			<CommandDialog onOpenChange={setOpen} open={open}>
				<CommandDialogTrigger
					render={<Button variant="outline">Find a project</Button>}
				/>
				<CommandDialogPopup aria-label="Find a project">
					<Command items={items}>
						<CommandInput
							aria-label="Find a project"
							placeholder="Find a project"
						/>
						<CommandPanel>
							<CommandEmpty>No matching projects.</CommandEmpty>
							<CommandList>{renderItem}</CommandList>
						</CommandPanel>
						<CommandFooter>
							<span>Choose a project</span>
							<Inline>
								<Kbd>Esc</Kbd>
								<span>Close</span>
							</Inline>
						</CommandFooter>
					</Command>
				</CommandDialogPopup>
			</CommandDialog>
			{selected ? (
				<Text aria-live="polite" size="ui" tone="muted">
					Selected: {selected}
				</Text>
			) : null}
		</Stack>
	);
}
