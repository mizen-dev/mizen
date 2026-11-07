import {
	Button,
	ButtonGroup,
	Menu,
	MenuItem,
	MenuPopup,
	MenuTrigger,
} from "@mizen-labs/ui";
import { IconChevronDown } from "@tabler/icons-react";

export function ViewButtonGroup() {
	return (
		<ButtonGroup aria-label="Publish options">
			<Button>Publish</Button>
			<Menu>
				<MenuTrigger
					render={<Button aria-label="More publish options" size="icon" />}
				>
					<IconChevronDown aria-hidden="true" size={16} />
				</MenuTrigger>
				<MenuPopup align="end">
					<MenuItem>Schedule for later</MenuItem>
					<MenuItem>Publish to the team only</MenuItem>
				</MenuPopup>
			</Menu>
		</ButtonGroup>
	);
}
