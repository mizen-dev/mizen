import { Checkbox, Field, FieldLabel } from "@mizen-labs/ui";
export function ProductUpdatesCheckbox() {
	return (
		<Field>
			<FieldLabel>
				<Checkbox defaultChecked name="productUpdates" value="yes" />
				Receive product updates
			</FieldLabel>
		</Field>
	);
}
