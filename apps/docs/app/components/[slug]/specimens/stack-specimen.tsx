import { Code } from "@mizen/ui/code";
import { Text } from "@mizen/ui/text";
import { SpecimenSection } from "./specimen-section";

export function StackSpecimen() {
	return (
		<SpecimenSection primary title="Deployment">
			<Text>Ship related content in a predictable vertical rhythm.</Text>
			<Text size="ui" tone="muted">
				Run <Code>pnpm deploy</Code> after validation passes.
			</Text>
		</SpecimenSection>
	);
}
