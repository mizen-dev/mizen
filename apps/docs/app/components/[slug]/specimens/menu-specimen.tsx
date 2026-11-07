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
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { IconFolder } from "@tabler/icons-react";
import { specimenStyles as previewStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

function FolderIcon() {
	return <IconFolder aria-hidden="true" focusable="false" size="16" />;
}

export function MenuSpecimen() {
	return (
		<div {...props(previewStyles.examples)}>
			<SpecimenSection
				description="Product team · Project actions"
				primary
				title="Northstar launch"
			>
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
							<MenuItem disabled>Duplicate project</MenuItem>
							<MenuLinkItem href="/components/field">Go to fields</MenuLinkItem>
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
							<MenuSubTrigger>Move to</MenuSubTrigger>
							<MenuSubPopup>
								<MenuItem>Personal</MenuItem>
								<MenuItem>Product team</MenuItem>
							</MenuSubPopup>
						</MenuSub>
						<MenuSeparator />
						<MenuItem variant="destructive">Delete project</MenuItem>
					</MenuPopup>
				</Menu>
			</SpecimenSection>
		</div>
	);
}
