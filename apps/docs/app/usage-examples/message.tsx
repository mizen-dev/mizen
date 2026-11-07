"use client";

import {
	AgentThinking,
	Avatar,
	AvatarFallback,
	AvatarImage,
	Message,
	StreamingText,
	type StreamingTextSource,
} from "@mizen/ui";
import { create, props } from "@stylexjs/stylex";
import { useCallback, useState } from "react";

const styles = create({
	frame: {
		display: "flex",
		flexDirection: "column",
		gap: "1.5rem",
		maxInlineSize: "34rem",
		minInlineSize: 0,
		width: "100%",
	},
	// Each message keeps room for its actions, so the thread needs little gap.
	thread: { gap: "0.5rem" },
});

const sources: readonly StreamingTextSource[] = [
	{
		href: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries",
		title: "CSS container queries",
	},
	{
		href: "https://web.dev/blog/cq-stable",
		title: "Container queries land in stable browsers",
	},
];

const reply = [
	"Give the card's wrapper container-type: inline-size, then replace its media queries with @container rules. The card now responds to the space it gets, not the viewport. ",
	{ source: 0 },
	" Container queries work in every current browser.",
	{ source: 1 },
] as const;

// One turn: the person's question, then the agent's thinking and reply.
export function MessageTurn() {
	const [question, setQuestion] = useState(
		"How do I make Card respond to its container instead of the viewport?"
	);
	return (
		<div {...props(styles.frame)}>
			<Message
				dateTime="2026-11-05T16:20:00+05:00"
				from="user"
				onEdit={setQuestion}
				time="4:20 PM"
			>
				{question}
			</Message>
			<Message from="agent">
				<AgentThinking
					content="The card sits in a sidebar and a grid, so the viewport says nothing about its width."
					duration={4}
					status="complete"
				/>
				<StreamingText content={reply} sources={sources} status="complete" />
			</Message>
		</div>
	);
}

function Person({ name, src }: { name: string; src: string }) {
	const initials = name
		.split(" ")
		.map((part) => part[0])
		.join("");
	return (
		<Avatar size="sm">
			<AvatarImage alt={name} src={src} />
			<AvatarFallback aria-label={name} role="img">
				{initials}
			</AvatarFallback>
		</Avatar>
	);
}

// Others in a group chat sit on the left with their name and picture.
export function GroupChat() {
	return (
		<div {...props(styles.frame, styles.thread)}>
			<Message
				align="start"
				author="Maya Chen"
				avatar={<Person name="Maya Chen" src="/media/portrait-maya.jpg" />}
				from="user"
				time="9:41 AM"
			>
				Card breaks in the sidebar again. Can someone look before the release?
			</Message>
			<Message
				align="start"
				author="Alex Rivera"
				avatar={<Person name="Alex Rivera" src="/media/portrait-alex.jpg" />}
				from="user"
				time="9:43 AM"
			>
				It uses media queries, so it only knows the viewport width.
			</Message>
			<Message from="user" time="9:44 AM">
				I'll move it to container queries today.
			</Message>
		</div>
	);
}

// Files the person sent sit above their words. Images open in a lightbox,
// and other files open in a new tab.
export function MessageWithAttachments() {
	return (
		<div {...props(styles.frame)}>
			<Message
				attachments={[
					{ name: "report-cover.jpg", preview: "/media/report-cover.jpg" },
					{ name: "palette.jpg", preview: "/media/palette-swatches.jpg" },
					{ href: "/media/monthly-report.csv", name: "monthly-report.csv" },
				]}
				from="user"
				time="2:05 PM"
			>
				Summarize the trends in this report, and check that the charts use our
				palette.
			</Message>
		</div>
	);
}

// A message that did not go out stays, with Retry beside "Not sent".
export function FailedMessage() {
	const [status, setStatus] = useState<"failed" | "sent">("failed");
	const retry = useCallback(() => setStatus("sent"), []);
	return (
		<div {...props(styles.frame)}>
			<Message
				from="user"
				onRetry={retry}
				status={status}
				time={status === "sent" ? "4:22 PM" : undefined}
			>
				Can you also check the Card in the settings sidebar?
			</Message>
		</div>
	);
}

const log = `Card overflows in the settings sidebar. Here is the build output:

> mizen-docs@0.0.0 build
> next build

  ▲ Next.js 16.0.0
  Creating an optimized production build ...
  Compiled with warnings

./app/settings/sidebar.tsx
Card: min-width 320px exceeds container (288px)
  at Card (packages/ui/src/components/card/card.tsx:42:7)
  at SettingsSidebar (app/settings/sidebar.tsx:18:5)

  Generating static pages (24/24)
  Finalizing page optimization ...`;

// Long pasted text folds after eight lines, with Show more.
export function LongMessage() {
	return (
		<div {...props(styles.frame)}>
			<Message from="user" time="4:31 PM">
				{log}
			</Message>
		</div>
	);
}
