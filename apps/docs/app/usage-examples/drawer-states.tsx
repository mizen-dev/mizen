"use client";

import {
	Button,
	Drawer,
	DrawerClose,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerMenu,
	DrawerMenuCheckboxItem,
	DrawerMenuGroup,
	DrawerMenuGroupLabel,
	DrawerMenuItem,
	DrawerMenuRadioGroup,
	DrawerMenuRadioItem,
	DrawerMenuSeparator,
	DrawerMenuTrigger,
	DrawerPanel,
	DrawerPopup,
	DrawerTitle,
	DrawerTrigger,
	Inline,
	Text,
} from "@mizen/ui";

export function DrawerInsetPositions() {
	return (
		<Inline>
			{(["bottom", "top", "left", "right"] as const).map((position) => (
				<Drawer key={position} position={position}>
					<DrawerTrigger render={<Button variant="outline" />}>
						Inset {position}
					</DrawerTrigger>
					<DrawerPopup showBar showCloseButton variant="inset">
						<DrawerHeader>
							<DrawerTitle>Project details</DrawerTitle>
							<DrawerDescription>
								A panel from the {position} edge.
							</DrawerDescription>
						</DrawerHeader>
						<DrawerPanel>
							<Text size="ui" tone="muted">
								Keep the current page in view while reviewing project details.
							</Text>
						</DrawerPanel>
						<DrawerFooter>
							<DrawerClose render={<Button variant="outline" />}>
								Done
							</DrawerClose>
						</DrawerFooter>
					</DrawerPopup>
				</Drawer>
			))}
		</Inline>
	);
}

export function DrawerStraightPositions() {
	return (
		<Inline>
			{(["bottom", "top", "left", "right"] as const).map((position) => (
				<Drawer key={position} position={position}>
					<DrawerTrigger render={<Button variant="outline" />}>
						Straight {position}
					</DrawerTrigger>
					<DrawerPopup showCloseButton variant="straight">
						<DrawerHeader>
							<DrawerTitle>Workspace activity</DrawerTitle>
							<DrawerDescription>
								Latest updates from your team.
							</DrawerDescription>
						</DrawerHeader>
						<DrawerPanel>
							<Text size="ui" tone="muted">
								Mara added Field notes to the workspace.
							</Text>
						</DrawerPanel>
						<DrawerFooter variant="bare">
							<DrawerClose render={<Button variant="outline" />}>
								Done
							</DrawerClose>
						</DrawerFooter>
					</DrawerPopup>
				</Drawer>
			))}
		</Inline>
	);
}

export function DrawerScrollableContent() {
	return (
		<Drawer position="right">
			<DrawerTrigger render={<Button variant="outline" />}>
				Review release history
			</DrawerTrigger>
			<DrawerPopup showCloseButton variant="inset">
				<DrawerHeader>
					<DrawerTitle>Release history</DrawerTitle>
					<DrawerDescription>
						Scroll through the recent releases.
					</DrawerDescription>
				</DrawerHeader>
				<DrawerPanel>
					{Array.from({ length: 24 }, (_, index) => 24 - index).map(
						(release) => (
							<Text key={`release-${release}`} size="ui" tone="muted">
								Release 2.{release} — documentation, reliability, and workspace
								updates.
							</Text>
						)
					)}
				</DrawerPanel>
				<DrawerFooter>
					<Button disabled>Restore release</Button>
					<DrawerClose render={<Button variant="outline" />}>Done</DrawerClose>
				</DrawerFooter>
			</DrawerPopup>
		</Drawer>
	);
}

export function DrawerNestedMenus() {
	return (
		<Drawer>
			<DrawerTrigger render={<Button variant="outline" />}>
				Open project actions
			</DrawerTrigger>
			<DrawerPopup showBar variant="inset">
				<DrawerHeader>
					<DrawerTitle>Project actions</DrawerTitle>
					<DrawerDescription>
						Manage your workspace preferences.
					</DrawerDescription>
				</DrawerHeader>
				<DrawerPanel>
					<DrawerMenu>
						<DrawerMenuGroup>
							<DrawerMenuGroupLabel>Actions</DrawerMenuGroupLabel>
							<DrawerClose render={<DrawerMenuItem />}>
								Edit project
							</DrawerClose>
							<DrawerMenuItem disabled>Archive project</DrawerMenuItem>
						</DrawerMenuGroup>
						<DrawerMenuSeparator />
						<DrawerMenuCheckboxItem defaultChecked>
							Notifications
						</DrawerMenuCheckboxItem>
						<DrawerMenuCheckboxItem variant="switch">
							Auto save
						</DrawerMenuCheckboxItem>
						<DrawerMenuSeparator />
						<DrawerMenuGroup>
							<DrawerMenuGroupLabel>Sort by</DrawerMenuGroupLabel>
							<DrawerMenuRadioGroup defaultValue="recent">
								<DrawerMenuRadioItem value="recent">
									Most recent
								</DrawerMenuRadioItem>
								<DrawerMenuRadioItem value="name">Name</DrawerMenuRadioItem>
							</DrawerMenuRadioGroup>
						</DrawerMenuGroup>
						<DrawerMenuSeparator />
						<Drawer>
							<DrawerMenuTrigger>Move to workspace</DrawerMenuTrigger>
							<DrawerPopup showBar variant="inset">
								<DrawerHeader>
									<DrawerTitle>Move project</DrawerTitle>
									<DrawerDescription>
										Choose the destination workspace.
									</DrawerDescription>
								</DrawerHeader>
								<DrawerPanel>
									<DrawerMenu>
										<DrawerClose render={<DrawerMenuItem />}>
											Design studio
										</DrawerClose>
										<DrawerClose render={<DrawerMenuItem />}>
											Research team
										</DrawerClose>
									</DrawerMenu>
								</DrawerPanel>
								<DrawerFooter variant="bare">
									<DrawerClose render={<Button variant="outline" />}>
										Back
									</DrawerClose>
								</DrawerFooter>
							</DrawerPopup>
						</Drawer>
						<DrawerMenuSeparator />
						<DrawerMenuItem variant="destructive">
							Delete project
						</DrawerMenuItem>
					</DrawerMenu>
				</DrawerPanel>
				<DrawerFooter>
					<DrawerClose render={<Button variant="outline" />}>Done</DrawerClose>
				</DrawerFooter>
			</DrawerPopup>
		</Drawer>
	);
}

export function DrawerSnapPoints() {
	return (
		<Drawer
			defaultSnapPoint={0.4}
			snapPoints={[0.4, 0.7, 1]}
			snapToSequentialPoints
		>
			<DrawerTrigger render={<Button variant="outline" />}>
				Explore snap points
			</DrawerTrigger>
			<DrawerPopup showBar>
				<DrawerHeader>
					<DrawerTitle>Project timeline</DrawerTitle>
					<DrawerDescription>
						Drag the handle to reveal more of the timeline.
					</DrawerDescription>
				</DrawerHeader>
				<DrawerPanel>
					{Array.from({ length: 20 }, (_, index) => index + 1).map(
						(milestone) => (
							<Text key={`event-${milestone}`} size="ui" tone="muted">
								Milestone {milestone} — review and publish workspace updates.
							</Text>
						)
					)}
				</DrawerPanel>
				<DrawerFooter>
					<DrawerClose render={<Button variant="outline" />}>Done</DrawerClose>
				</DrawerFooter>
			</DrawerPopup>
		</Drawer>
	);
}

export function DrawerDisabledTrigger() {
	return (
		<Drawer>
			<DrawerTrigger disabled render={<Button disabled variant="outline" />}>
				Activity unavailable
			</DrawerTrigger>
			<DrawerPopup>
				<DrawerHeader>
					<DrawerTitle>Activity</DrawerTitle>
				</DrawerHeader>
			</DrawerPopup>
		</Drawer>
	);
}
