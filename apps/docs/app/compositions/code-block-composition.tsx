import {
	CodeBlock,
	CodeBlockContent,
	CodeBlockCopy,
	CodeBlockHeader,
	CodeBlockTitle,
	Heading,
	Section,
	Stack,
} from "@mizen/ui";
import { workspaceSettingsSource } from "./code-block-source";

export function CodeBlockExamples() {
	return (
		<Section
			aria-labelledby="code-block-heading"
			data-testid="code-block-example"
		>
			<Stack gap="3">
				<Heading id="code-block-heading" level={2} size="title">
					Code Block
				</Heading>
				<CodeBlock>
					<CodeBlockHeader>
						<CodeBlockTitle>workspace-settings.tsx</CodeBlockTitle>
						<CodeBlockCopy code={workspaceSettingsSource} />
					</CodeBlockHeader>
					<CodeBlockContent aria-label="Workspace settings source">
						{workspaceSettingsSource}
					</CodeBlockContent>
				</CodeBlock>
			</Stack>
		</Section>
	);
}
