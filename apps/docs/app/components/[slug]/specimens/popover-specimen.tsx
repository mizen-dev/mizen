import {
	Button,
	Field,
	FieldLabel,
	Group,
	Input,
	Popover,
	PopoverClose,
	PopoverDescription,
	PopoverPopup,
	PopoverTitle,
	PopoverTrigger,
	Stack,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { specimenStyles as previewStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function PopoverSpecimen() {
	return (
		<div {...props(previewStyles.examples)}>
			<SpecimenSection
				description="Edit the name teammates see in the workspace."
				primary
				title="Project identity"
			>
				<Popover>
					<PopoverTrigger
						render={<Button variant="outline">Edit project</Button>}
					/>
					<PopoverPopup>
						<Stack gap="1">
							<PopoverTitle>Edit project</PopoverTitle>
							<PopoverDescription>
								Choose a short name that is easy to recognize.
							</PopoverDescription>
						</Stack>
						<Field>
							<FieldLabel>Project name</FieldLabel>
							<Input defaultValue="Mizen" />
						</Field>
						<Group>
							<PopoverClose render={<Button size="sm">Done</Button>} />
						</Group>
					</PopoverPopup>
				</Popover>
			</SpecimenSection>
		</div>
	);
}
