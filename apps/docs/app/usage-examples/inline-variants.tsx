"use client";
import { Button, Heading, Stack, Text } from "@mizen/ui";
import { Inline } from "@mizen/ui/inline";
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
