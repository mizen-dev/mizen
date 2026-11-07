"use client";
import { Badge, Button, Heading, Inline, Stack, Text } from "@mizen-labs/ui";
import { IconPlus } from "@tabler/icons-react";
import { useCallback, useState } from "react";

function PlusIcon() {
	return <IconPlus aria-hidden="true" focusable="false" size="1em" />;
}
export function ButtonReleaseReviewExample1() {
	const [status, setStatus] = useState("Ready for review");
	const publish = useCallback(
		() => setStatus("Release published in this preview."),
		[]
	);
	const save = useCallback(() => setStatus("Draft saved in this preview."), []);
	return (
		<Stack gap="4">
			<Stack gap="1">
				<Inline>
					<Heading level={4}>A calmer workspace</Heading>
					<Badge variant="outline">Draft</Badge>
				</Inline>
				<Text size="ui" tone="muted">
					The release notes are ready. Save your work or publish the update.
				</Text>
			</Stack>
			<Inline>
				<Button onClick={publish} variant="brand">
					Publish update
				</Button>
				<Button onClick={save} variant="outline">
					Save draft
				</Button>
			</Inline>
			<Text aria-live="polite" size="ui" tone="muted">
				{status}
			</Text>
		</Stack>
	);
}
export function ButtonActionHierarchyExample2() {
	return (
		<Stack gap="4">
			<Inline>
				<Button>Default</Button>
				<Button variant="brand">Brand</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="link">Link</Button>
			</Inline>
		</Stack>
	);
}
export function ButtonDestructiveActionsExample3() {
	return (
		<Stack gap="4">
			<Inline>
				<Button variant="destructive">Destructive</Button>
				<Button variant="destructive-outline">Delete</Button>
			</Inline>
		</Stack>
	);
}
export function ButtonActionStatesExample4() {
	return (
		<Stack gap="4">
			<Inline>
				<Button loading>Saving</Button>
				<Button disabled>Disabled</Button>
				<Button aria-label="Add" size="icon-sm">
					<PlusIcon />
				</Button>
			</Inline>
		</Stack>
	);
}
export function ButtonControlSizesExample5() {
	return (
		<Stack gap="4">
			<Inline>
				<Button size="default">Default size</Button>
				<Button size="xs">Extra small</Button>
				<Button size="sm">Small</Button>
				<Button size="lg">Large</Button>
				<Button size="xl">Extra large</Button>
			</Inline>
		</Stack>
	);
}
export function ButtonIconActionsExample6() {
	return (
		<Stack gap="4">
			<Inline>
				<Button aria-label="Icon" size="icon">
					<PlusIcon />
				</Button>
				<Button aria-label="Extra small icon" size="icon-xs">
					<PlusIcon />
				</Button>
				<Button aria-label="Small icon" size="icon-sm">
					<PlusIcon />
				</Button>
				<Button aria-label="Large icon" size="icon-lg">
					<PlusIcon />
				</Button>
				<Button aria-label="Extra large icon" size="icon-xl">
					<PlusIcon />
				</Button>
			</Inline>
		</Stack>
	);
}
