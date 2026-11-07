import {
	Button,
	Sheet,
	SheetClose,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetPanel,
	SheetPopup,
	SheetTitle,
	SheetTrigger,
	Text,
} from "@mizen/ui";

export function ProjectSheet() {
	return (
		<Sheet>
			<SheetTrigger
				render={<Button variant="outline">Review project details</Button>}
			/>
			<SheetPopup side="right" variant="inset">
				<SheetHeader>
					<SheetTitle>Northstar launch</SheetTitle>
					<SheetDescription>
						Project details remain beside the current page.
					</SheetDescription>
				</SheetHeader>
				<SheetPanel>
					<Text>Owner: Mara Chen. Status: Active.</Text>
				</SheetPanel>
				<SheetFooter>
					<SheetClose
						render={<Button variant="outline">Close details</Button>}
					/>
				</SheetFooter>
			</SheetPopup>
		</Sheet>
	);
}
