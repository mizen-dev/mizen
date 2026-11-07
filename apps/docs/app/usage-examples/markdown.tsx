import { Markdown, markdownComponents } from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownPreviewStyles } from "./markdown-preview.styles";

export function ReleaseNotes() {
	const content = [
		"## Version 0.8",
		"",
		"Reports get exports, and tables get full keyboard support.",
		"",
		"- **Exports.** Any report downloads as CSV or PDF.",
		"- **Keyboard.** Arrow keys move between table cells.",
		"- **Time.** `Timestamp` reads as relative time, such as *2 hours ago*.",
		"",
		"See [Installation](/docs/installation) to update.",
	].join("\n");
	return (
		<div {...props(markdownPreviewStyles.frame)}>
			<Markdown id="release-notes">
				<ReactMarkdown
					components={markdownComponents}
					remarkPlugins={[remarkGfm]}
					remarkRehypeOptions={{ clobberPrefix: "release-notes-" }}
					skipHtml
				>
					{content}
				</ReactMarkdown>
			</Markdown>
		</div>
	);
}
