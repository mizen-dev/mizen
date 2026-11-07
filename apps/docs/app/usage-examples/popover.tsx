import {
	Button,
	Inline,
	Popover,
	PopoverClose,
	PopoverDescription,
	PopoverPopup,
	PopoverTitle,
	PopoverTrigger,
} from "@mizen/ui";

export function WorkspacePopover() {
	return (
		<Popover>
			<PopoverTrigger
				render={<Button variant="outline">Workspace information</Button>}
			/>
			<PopoverPopup>
				<PopoverTitle>Northstar workspace</PopoverTitle>
				<PopoverDescription>
					Two members can access this private workspace.
				</PopoverDescription>
				<Inline>
					<PopoverClose
						render={
							<Button size="sm" variant="outline">
								Close information
							</Button>
						}
					/>
				</Inline>
			</PopoverPopup>
		</Popover>
	);
}
