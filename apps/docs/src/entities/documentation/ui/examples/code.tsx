import { Code, Stack, Text } from "@mizen-labs/ui";

export function InlineCommand() {
	return (
		<Stack gap="3">
			<Text>
				Install the package with <Code>pnpm add @mizen-labs/ui</Code>.
			</Text>
			<Text>
				Render <Code>ThemeScript</Code> and <Code>ThemeProvider</Code> in{" "}
				<Code>app/layout.tsx</Code>.
			</Text>
			<Text>
				Run <Code>pnpm typecheck</Code> before you open a review.
			</Text>
		</Stack>
	);
}
