"use client";
import { Group, Stack, Text, Toggle } from "@mizen-labs/ui";
import { space } from "@mizen-labs/ui/spacing.stylex";
import { create, props } from "@stylexjs/stylex";
import { IconBold, IconItalic, IconPin } from "@tabler/icons-react";
import { useState } from "react";
export function ToggleDocumentToolsExample1() {
	return (
		<Stack gap="4">
			<Group>
				<Toggle defaultPressed>
					<IconBold aria-hidden="true" size={18} />
					Bold text
				</Toggle>
				<Toggle variant="outline">
					<IconItalic aria-hidden="true" size={18} />
					Italic text
				</Toggle>
				<Toggle aria-label="Pin item" size="icon">
					<IconPin aria-hidden="true" size={18} />
				</Toggle>
			</Group>
		</Stack>
	);
}
export function ToggleManagedActionExample2() {
	return (
		<Stack gap="4">
			<Group>
				<Toggle disabled>Managed</Toggle>
				<Toggle defaultPressed disabled>
					Selected
				</Toggle>
				<Toggle disabled variant="outline">
					Unavailable
				</Toggle>
				<Toggle defaultPressed disabled variant="outline">
					Enabled by admin
				</Toggle>
			</Group>
		</Stack>
	);
}
const toggleExampleStyles = create({
	sizes: { display: "grid", gap: space["4"], justifyItems: "center" },
});

export function ToggleControlSizesExample3() {
	return (
		<div {...props(toggleExampleStyles.sizes)}>
			<Group>
				<Toggle size="sm" variant="outline">
					Small
				</Toggle>
				<Toggle aria-label="Small bold" size="sm" variant="outline">
					<IconBold aria-hidden="true" size={16} />
				</Toggle>
			</Group>
			<Group>
				<Toggle variant="outline">Default toggle</Toggle>
				<Toggle aria-label="Default bold" variant="outline">
					<IconBold aria-hidden="true" size={18} />
				</Toggle>
			</Group>
			<Group>
				<Toggle size="lg" variant="outline">
					Large
				</Toggle>
				<Toggle aria-label="Large bold" size="lg" variant="outline">
					<IconBold aria-hidden="true" size={20} />
				</Toggle>
			</Group>
		</div>
	);
}

export function ToggleControlledState() {
	const [pressed, setPressed] = useState(false);
	return (
		<Stack gap="3">
			<Toggle onPressedChange={setPressed} pressed={pressed} variant="outline">
				<IconPin aria-hidden="true" size={18} />
				Pin project
			</Toggle>
			<Text aria-live="polite" size="ui" tone="muted">
				{pressed ? "Project pinned" : "Project unpinned"}
			</Text>
		</Stack>
	);
}
