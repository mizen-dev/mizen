import { Button, Inline } from "@mizen-labs/ui";
import { IconPlus } from "@tabler/icons-react";

export function BrandAction() {
	return (
		<Inline>
			<Button variant="brand">Invite</Button>
			<Button variant="outline">Copy link</Button>
			<Button variant="ghost">Skip</Button>
		</Inline>
	);
}

export function IconAction() {
	return (
		<Button aria-label="Add project" size="icon-sm">
			<IconPlus aria-hidden="true" size="1em" />
		</Button>
	);
}

export function LoadingAction() {
	return (
		<Button loading variant="brand">
			Save changes
		</Button>
	);
}

export function DisabledAction() {
	return <Button disabled>Publish project</Button>;
}
