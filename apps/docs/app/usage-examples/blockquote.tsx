import {
	Blockquote,
	BlockquoteAttribution,
	BlockquoteContent,
} from "@mizen-labs/ui";

export function ArchitectureQuote() {
	return (
		<Blockquote>
			<BlockquoteContent>
				We stopped planning around release day. Shipping became the boring part
				of the week.
			</BlockquoteContent>
			<BlockquoteAttribution>Maya Chen, head of platform</BlockquoteAttribution>
		</Blockquote>
	);
}
