import {
	Button,
	Drawer,
	DrawerClose,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerPanel,
	DrawerPopup,
	DrawerTitle,
	DrawerTrigger,
	Text,
} from "@mizen/ui";

export function ActivityDrawer() {
	return (
		<Drawer position="bottom">
			<DrawerTrigger
				render={<Button variant="outline">Review project activity</Button>}
			/>
			<DrawerPopup showBar variant="inset">
				<DrawerHeader>
					<DrawerTitle>Recent activity</DrawerTitle>
					<DrawerDescription>
						Updates from this project's members.
					</DrawerDescription>
				</DrawerHeader>
				<DrawerPanel allowSelection scrollable>
					<Text>Mara Chen added Field notes to the workspace.</Text>
				</DrawerPanel>
				<DrawerFooter>
					<DrawerClose
						render={<Button variant="outline">Close activity</Button>}
					/>
				</DrawerFooter>
			</DrawerPopup>
		</Drawer>
	);
}
