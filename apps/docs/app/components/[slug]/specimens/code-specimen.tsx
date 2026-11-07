import { Code } from "@mizen-labs/ui/code";
import { Text } from "@mizen-labs/ui/text";
import { props } from "@stylexjs/stylex";
import { pageStyles } from "../../../page.styles";
import { SpecimenSection } from "./specimen-section";

export function CodeSpecimen() {
	return (
		<SpecimenSection
			description="A short handoff note for the project team."
			primary
			title="Before the review"
		>
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
		</SpecimenSection>
	);
}
