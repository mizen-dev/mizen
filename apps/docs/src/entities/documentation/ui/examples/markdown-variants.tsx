import { Markdown, markdownComponents, Stack } from "@mizen-labs/ui";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownSource } from "../compositions/rich-content-source";

export function MarkdownMarkdownExample1() {
	return (
		<Stack gap="4">
			<Stack gap="3">
				<Markdown id="release-notes-example">
					<ReactMarkdown
						components={markdownComponents}
						remarkPlugins={[remarkGfm]}
						remarkRehypeOptions={{ clobberPrefix: "release-notes-example-" }}
						skipHtml
					>
						{markdownSource}
					</ReactMarkdown>
				</Markdown>
			</Stack>
		</Stack>
	);
}
