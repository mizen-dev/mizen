import type { Guide } from "./guides";

const usage = `"use client";

import { Button, useCopyToClipboard, VisuallyHidden } from "@mizen-labs/ui";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export function CopyInvite({ link }: { link: string }) {
	const { copy, status } = useCopyToClipboard();
	return (
		<>
			<Button onClick={() => copy(link)} variant="outline">
				{status === "copied" ? (
					<IconCheck aria-hidden="true" size={16} />
				) : (
					<IconCopy aria-hidden="true" size={16} />
				)}
				Copy invite link
			</Button>
			{/* Always rendered, so screen readers announce each change. */}
			<VisuallyHidden aria-live="polite">
				{status === "copied" ? "Copied" : null}
				{status === "failed" ? "Could not copy. Select the link to copy it." : null}
			</VisuallyHidden>
		</>
	);
}`;

const loading = `const { copy } = useCopyToClipboard();

// The promise starts in the click, so the browser still counts it as one.
copy(fetch("/docs/button/markdown").then((response) => response.text()));`;

export const hookGuides: Guide[] = [
	{
		description:
			"Copies text to the clipboard and reports whether it worked, so a button can show a check and screen readers hear the result.",
		group: "Hooks",
		sections: [
			{
				code: { title: "copy-invite.tsx", value: usage },
				id: "usage",
				paragraphs: [
					"Call copy with the text. status is copied after a successful copy and returns to idle after two seconds. It is failed when the browser refuses, and stays failed until the next attempt.",
					"Show the result twice: swap the icon for a check, and put the same news in a status region. The region must exist before its text changes, or screen readers skip it.",
				],
				title: "Usage",
			},
			{
				id: "failure",
				paragraphs: [
					"The clipboard works only on secure pages and after a click or key press. When copying fails, tell the person how to copy by hand, such as by selecting the text.",
				],
				title: "When copying fails",
			},
			{
				code: { title: "copy-page.ts", value: loading },
				id: "loading",
				paragraphs: [
					"Pass a promise when the text has to load first. A failed request counts as a failed copy.",
				],
				title: "Text that is still loading",
			},
			{
				id: "api",
				paragraphs: [
					"useCopyToClipboard(options) takes timeout, the milliseconds before copied returns to idle (2000 by default; 0 keeps it), and onCopy, called with the text after a copy succeeds.",
					"It returns copy, which takes a string or a promise of one and resolves to true when the copy worked, and status: idle, copied, or failed. Only the latest call reports, so quick repeat clicks never show an older result.",
				],
				title: "API",
			},
			{
				id: "in-mizen",
				links: [
					{ href: "/docs/components/code-block", label: "Code Block" },
					{ href: "/docs/components/message", label: "Message" },
					{ href: "/docs/components/streaming-text", label: "Streaming Text" },
				],
				paragraphs: [
					"Code Block, Message, and Streaming Text copy with this hook, so every Copy button in Mizen behaves the same.",
				],
				title: "Used by",
			},
		],
		slug: "use-copy-to-clipboard",
		title: "useCopyToClipboard",
	},
];
