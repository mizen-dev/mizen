import { Button, Group, Inline, Spacer } from "@mizen-labs/ui";

export function SplitActions() {
	return (
		<Inline>
			<Button variant="destructive-outline">Delete</Button>
			<Spacer />
			<Group>
				<Button variant="ghost">Cancel</Button>
				<Button>Save</Button>
			</Group>
		</Inline>
	);
}
