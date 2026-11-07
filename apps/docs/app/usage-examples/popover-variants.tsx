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
} from "@mizen/ui";

export function PopoverProjectIdentityExample1() {
	return (
		<Stack gap="4">
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
		</Stack>
	);
}
