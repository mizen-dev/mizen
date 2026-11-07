import { Link, Stack, Text } from "@mizen/ui";

export function LinkWorkspaceResourcesExample1() {
	return (
		<Stack gap="4">
			<Stack gap="2">
				<Text>
					Browse the <Link href="/docs">component index</Link> to find reusable
					patterns.
				</Text>
			</Stack>
		</Stack>
	);
}
