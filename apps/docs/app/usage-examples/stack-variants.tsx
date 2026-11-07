import { Stack } from "@mizen-labs/ui";
import { Code } from "@mizen-labs/ui/code";
import { Text } from "@mizen-labs/ui/text";

export function StackDeploymentExample1() {
	return (
		<Stack gap="4">
			<Text>Ship related content in a predictable vertical rhythm.</Text>
			<Text size="ui" tone="muted">
				Run <Code>pnpm deploy</Code> after validation passes.
			</Text>
		</Stack>
	);
}
