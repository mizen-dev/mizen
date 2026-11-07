import { Group, Toggle } from "@mizen-labs/ui";
import { IconBell, IconPin } from "@tabler/icons-react";

export function BoldToggle() {
	return (
		<Group>
			<Toggle defaultPressed variant="outline">
				<IconBell aria-hidden="true" size={16} />
				Subscribe
			</Toggle>
			<Toggle variant="outline">
				<IconPin aria-hidden="true" size={16} />
				Pin
			</Toggle>
		</Group>
	);
}
