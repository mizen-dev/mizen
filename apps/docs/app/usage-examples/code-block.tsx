import {
	CodeBlock,
	CodeBlockContent,
	CodeBlockCopy,
	CodeBlockHeader,
	CodeBlockTitle,
} from "@mizen/ui";

const saveButton = `import { Button } from "@mizen/ui";

// Saves the draft and shows progress while the request runs.
export function SaveButton({ pending }: { pending: boolean }) {
  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}
`;

export function SaveButtonSource() {
	return (
		<CodeBlock>
			<CodeBlockHeader>
				<CodeBlockTitle>save-button.tsx</CodeBlockTitle>
				<CodeBlockCopy code={saveButton} />
			</CodeBlockHeader>
			<CodeBlockContent aria-label="Save button source" language="typescript">
				{saveButton}
			</CodeBlockContent>
		</CodeBlock>
	);
}

const installCommand = "pnpm add @mizen/ui";

export function InstallCommand() {
	return (
		<CodeBlock>
			<CodeBlockCopy code={installCommand} />
			<CodeBlockContent aria-label="Install command" language="shell">
				{installCommand}
			</CodeBlockContent>
		</CodeBlock>
	);
}
