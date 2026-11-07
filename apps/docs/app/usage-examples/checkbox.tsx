import { Checkbox, Field, FieldLabel } from "@mizen/ui";
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
