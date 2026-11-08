import {
	Blockquote,
	BlockquoteAttribution,
	BlockquoteContent,
	Citation,
	Stack,
} from "@mizen-labs/ui";

export function BlockquoteQuotedContentExample1() {
	return (
		<Stack gap="4">
			<Stack gap="3">
				<Blockquote>
					<BlockquoteContent>
						Whenever the system can safely determine a UI decision from context,
						it should determine it instead of exposing another choice.
					</BlockquoteContent>
					<BlockquoteAttribution>
						<Citation>Mizen UI architecture</Citation>
					</BlockquoteAttribution>
				</Blockquote>
			</Stack>
		</Stack>
	);
}
