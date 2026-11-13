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
import { IconInfoCircle } from "@tabler/icons-react";

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

export function PopoverHelpTextExample2() {
	return (
		<Popover>
			<PopoverTrigger
				openOnHover
				render={
					<Button
						aria-label="About the shared bank"
						size="icon-sm"
						variant="ghost"
					/>
				}
			>
				<IconInfoCircle aria-hidden size={16} />
			</PopoverTrigger>
			<PopoverPopup align="start">
				<PopoverDescription>
					Income and expense of the shared bank for the selected day. The
					difference is income minus expense. Data arrives with a delay of up to
					a few minutes.
				</PopoverDescription>
			</PopoverPopup>
		</Popover>
	);
}
