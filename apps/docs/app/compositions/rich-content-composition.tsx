import {
	Inline,
	Markdown,
	markdownComponents,
	Stack,
	Text,
	Thumbnail,
	Timestamp,
} from "@mizen-labs/ui";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PreviewWorkspace } from "../components/preview-workspace";
import {
	markdownSource,
	richContentDateTime,
	richContentImage,
} from "./rich-content-source";

export function MarkdownExamples() {
	return (
		<PreviewWorkspace
			testId="markdown-example"
			title="Markdown"
			titleId="markdown-heading"
		>
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
		</PreviewWorkspace>
	);
}

export function ThumbnailExamples() {
	return (
		<PreviewWorkspace
			testId="thumbnail-example"
			title="Design assets"
			titleId="thumbnail-heading"
		>
			<Stack gap="3">
				<Inline>
					<Stack gap="1">
						<Text>Small · 2rem</Text>
						<Thumbnail {...richContentImage} size="sm" />
					</Stack>
					<Stack gap="1">
						<Text>Default · 3rem</Text>
						<Thumbnail {...richContentImage} />
					</Stack>
					<Stack gap="1">
						<Text>Large · 4rem</Text>
						<Thumbnail {...richContentImage} size="lg" />
					</Stack>
				</Inline>
			</Stack>
		</PreviewWorkspace>
	);
}

export function TimestampExamples() {
	return (
		<PreviewWorkspace
			testId="timestamp-example"
			title="Document history"
			titleId="timestamp-heading"
		>
			<Stack gap="3">
				<Stack gap="1">
					<Text>Published</Text>
					<Timestamp
						dateTime={richContentDateTime}
						format="date"
						locale="en-US"
						timeZone="UTC"
					/>
					<Text>Updated</Text>
					<Timestamp
						dateTime={richContentDateTime}
						format="date-time"
						locale="en-US"
						timeZone="UTC"
					/>
				</Stack>
			</Stack>
		</PreviewWorkspace>
	);
}

export function RichContentComposition() {
	return (
		<Stack data-testid="rich-content-example" gap="4">
			<MarkdownExamples />
			<ThumbnailExamples />
			<TimestampExamples />
		</Stack>
	);
}
