import {
	Button,
	Menu,
	MenuCheckboxItem,
	MenuGroup,
	MenuGroupLabel,
	MenuItem,
	MenuLinkItem,
	MenuPopup,
	MenuRadioGroup,
	MenuRadioItem,
	MenuSeparator,
	MenuShortcut,
	MenuSub,
	MenuSubPopup,
	MenuSubTrigger,
	MenuTrigger,
	Stack,
} from "@mizen/ui";
import {
	IconCopy,
	IconExternalLink,
	IconFolder,
	IconTrash,
} from "@tabler/icons-react";

function FolderIcon() {
	return <IconFolder aria-hidden="true" focusable="false" size="16" />;
}
export function MenuNorthstarLaunchExample1() {
	return (
		<Stack gap="4">
			<Menu>
				<MenuTrigger
					render={<Button variant="outline">Project actions</Button>}
				/>
				<MenuPopup>
					<MenuGroup>
						<MenuGroupLabel>Project</MenuGroupLabel>
						<MenuItem>
							<FolderIcon />
							Open project
							<MenuShortcut>⌘O</MenuShortcut>
						</MenuItem>
						<MenuItem disabled>
							<IconCopy aria-hidden="true" size={16} />
							Duplicate project
						</MenuItem>
						<MenuLinkItem href="/components/field">
							<IconExternalLink aria-hidden="true" size={16} />
							Go to fields
						</MenuLinkItem>
					</MenuGroup>
					<MenuSeparator />
					<MenuCheckboxItem defaultChecked>Show archived</MenuCheckboxItem>
					<MenuCheckboxItem variant="switch">Compact view</MenuCheckboxItem>
					<MenuSeparator />
					<MenuGroup>
						<MenuGroupLabel inset>Density</MenuGroupLabel>
						<MenuRadioGroup defaultValue="comfortable">
							<MenuRadioItem value="compact">Compact</MenuRadioItem>
							<MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
						</MenuRadioGroup>
					</MenuGroup>
					<MenuSeparator />
					<MenuSub>
						<MenuSubTrigger inset>Move to</MenuSubTrigger>
						<MenuSubPopup>
							<MenuItem>Personal</MenuItem>
							<MenuItem>Product team</MenuItem>
						</MenuSubPopup>
					</MenuSub>
					<MenuSeparator />
					<MenuItem variant="destructive">
						<IconTrash aria-hidden="true" size={16} />
						Delete project
					</MenuItem>
				</MenuPopup>
			</Menu>
		</Stack>
	);
}
