import { Stack } from "@mizen/ui";
import { Code } from "@mizen/ui/code";
import { Text } from "@mizen/ui/text";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../page.styles";

export function CodeBeforeTheReviewExample1() {
	return (
		<Stack gap="4">
			<div {...props(pageStyles.typographySpecimen)}>
				<Text>
					Run <Code>pnpm typecheck</Code> before opening a review.
				</Text>
				<Text size="ui" tone="muted">
					Use <Code>data-slot</Code> to identify component anatomy.
				</Text>
				<Text>
					Long identifiers such as{" "}
					<Code>agent_execution_result_with_extended_metadata</Code> wrap on
					narrow screens.
				</Text>
			</div>
		</Stack>
	);
}
