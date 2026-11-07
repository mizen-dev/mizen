import {
	CodeBlock,
	CodeBlockContent,
	CodeBlockCopy,
	CodeBlockHeader,
	CodeBlockTitle,
} from "@mizen/ui";
import { workspaceSettingsSource } from "../compositions/code-block-source";

export function CodeBlockCodeBlockExample1() {
	return (
		<CodeBlock>
			<CodeBlockHeader>
				<CodeBlockTitle>workspace-settings.tsx</CodeBlockTitle>
				<CodeBlockCopy code={workspaceSettingsSource} />
			</CodeBlockHeader>
			<CodeBlockContent
				aria-label="Workspace settings source"
				language="typescript"
			>
				{workspaceSettingsSource}
			</CodeBlockContent>
		</CodeBlock>
	);
}
