import {
	CodeBlock,
	CodeBlockContent,
	CodeBlockCopy,
	CodeBlockHeader,
	CodeBlockTitle,
} from "@mizen/ui";
import { ScrollArea } from "@mizen/ui/scroll-area";
import { props } from "@stylexjs/stylex";
import { docsStyles } from "./docs.styles";

export function SourceCode({
	code,
	label,
	title,
}: {
	code: string;
	label: string;
	/** A file name. Without one, Copy floats in the corner. */
	title?: string;
}) {
	// Code Block hides a file's final newline; Copy takes what it shows.
	const shown = code.endsWith("\n") ? code.slice(0, -1) : code;
	const lineCount = shown.split("\n").length;
	return (
		<CodeBlock>
			{title ? (
				<CodeBlockHeader>
					<CodeBlockTitle>{title}</CodeBlockTitle>
					<CodeBlockCopy code={shown} />
				</CodeBlockHeader>
			) : (
				<CodeBlockCopy code={shown} />
			)}
			<div {...props(docsStyles.sourceBody(lineCount))}>
				<ScrollArea clampContentMinWidth={false} overscrollContain>
					<CodeBlockContent aria-label={label} language="typescript">
						{code}
					</CodeBlockContent>
				</ScrollArea>
			</div>
		</CodeBlock>
	);
}
