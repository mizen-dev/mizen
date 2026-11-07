import {
	Button,
	Dialog,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPanel,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
	Field,
	FieldDescription,
	FieldLabel,
	Group,
	Input,
	Menu,
	MenuItem,
	MenuPopup,
	MenuSub,
	MenuSubPopup,
	MenuSubTrigger,
	MenuTrigger,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles as previewStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function DialogSpecimen() {
	return (
		<div {...props(previewStyles.examples)}>
			<SpecimenSection
				description="Review and edit the details of this project."
				primary
				title="Northstar launch"
			>
				<Dialog>
					<DialogTrigger
						render={<Button variant="brand">Edit project details</Button>}
					/>
					<DialogPopup size="sm">
						<DialogHeader>
							<DialogTitle>Edit project</DialogTitle>
							<DialogDescription>
								Update the details your team sees across Mizen.
							</DialogDescription>
						</DialogHeader>
						<DialogPanel>
							<Field>
								<FieldLabel>Project name</FieldLabel>
								<Input defaultValue="Mizen" />
								<FieldDescription>
									Use a short name that is easy to recognize.
								</FieldDescription>
							</Field>
							<Field>
								<FieldLabel>Project key</FieldLabel>
								<Input defaultValue="MIZ" />
							</Field>
							<Group>
								<Menu>
									<MenuTrigger
										render={<Button variant="outline">More actions</Button>}
									/>
									<MenuPopup>
										<MenuItem>Duplicate project</MenuItem>
										<MenuSub>
											<MenuSubTrigger>Export project</MenuSubTrigger>
											<MenuSubPopup>
												<MenuItem>Download archive</MenuItem>
											</MenuSubPopup>
										</MenuSub>
									</MenuPopup>
								</Menu>
								<Dialog>
									<DialogTrigger
										render={
											<Button variant="outline">Open nested dialog</Button>
										}
									/>
									<DialogPopup size="sm">
										<DialogHeader>
											<DialogTitle>Nested permissions</DialogTitle>
										</DialogHeader>
										<DialogPanel>
											<Text size="ui" tone="muted">
												Manage access for this project.
											</Text>
										</DialogPanel>
									</DialogPopup>
								</Dialog>
							</Group>
						</DialogPanel>
						<DialogFooter>
							<DialogClose render={<Button variant="outline">Cancel</Button>} />
							<DialogClose
								render={<Button variant="brand">Save changes</Button>}
							/>
						</DialogFooter>
					</DialogPopup>
				</Dialog>
			</SpecimenSection>
		</div>
	);
}
