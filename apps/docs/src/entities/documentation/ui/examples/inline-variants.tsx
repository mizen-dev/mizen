"use client";
import { Button, Heading, Stack, Text } from "@mizen-labs/ui";
import { Inline } from "@mizen-labs/ui/inline";
import { useCallback, useState } from "react";

export function InlineProductionReleaseExample1() {
	const [status, setStatus] = useState("Build passed · Ready for review");
	const deploy = useCallback(
		() => setStatus("Release deployed in this preview."),
		[]
	);
	const preview = useCallback(
		() => setStatus("Preview ready: A calmer workspace · Autumn release."),
		[]
	);
	const cancel = useCallback(
		() => setStatus("Release cancelled in this preview."),
		[]
	);
	return (
		<Stack gap="4">
			<Heading level={4}>Northstar 2.8.0</Heading>
			<Text size="ui" tone="muted">
				A calmer workspace · Autumn release
			</Text>
			<Inline>
				<Button onClick={deploy} variant="brand">
					Deploy changes
				</Button>
				<Button onClick={preview} variant="secondary">
					Preview release
				</Button>
				<Button onClick={cancel} variant="ghost">
					Cancel
				</Button>
			</Inline>
			<Text aria-live="polite" size="ui" tone="muted">
				{status}
			</Text>
		</Stack>
	);
}

export function InlineBetweenExample2() {
	return (
		<Inline justify="between">
			<Text size="ui" tone="muted">
				3 of 12 members selected
			</Text>
			<Inline gap="2">
				<Button size="sm" variant="outline">
					Change role
				</Button>
				<Button size="sm" variant="destructive-outline">
					Remove
				</Button>
			</Inline>
		</Inline>
	);
}

export function InlineBaselineExample3() {
	return (
		<Inline align="baseline" gap="2">
			<Heading level={3}>$48,290</Heading>
			<Text size="ui" tone="muted">
				this month
			</Text>
		</Inline>
	);
}
