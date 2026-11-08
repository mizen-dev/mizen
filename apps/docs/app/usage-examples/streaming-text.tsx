"use client";

import {
	Button,
	StreamingText,
	type StreamingTextFeedback,
	type StreamingTextPart,
	type StreamingTextSource,
	type StreamingTextState,
} from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";
import { useCallback, useRef, useState } from "react";

const styles = create({
	frame: {
		display: "flex",
		flexDirection: "column",
		gap: "1rem",
		maxInlineSize: "34rem",
		minBlockSize: "17rem",
		width: "100%",
	},
	replay: { alignSelf: "flex-start" },
});

// Real pages that back each claim. MDN serves /favicon.ico; web.dev does
// not, so its declared icon is passed in.
const sources: readonly StreamingTextSource[] = [
	{
		href: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries",
		title: "CSS container queries",
	},
	{
		href: "https://web.dev/blog/cq-stable",
		icon: "https://www.gstatic.com/devrel-devsite/prod/veed85ba0e3651062c793a40796e84fb34afbf8489308d45f92d5448e587e3f03/web/images/favicon.png",
		title: "Container queries land in stable browsers",
	},
];

// The reply as a model would stream it: text, with citations where it cites.
const reply: readonly StreamingTextPart[] = [
	"Container queries style an element by the size of its container, where media queries look at the viewport.",
	{ source: 0 },
	" Size container queries reached all stable browsers in February 2023.",
	{ source: 1 },
	" Give the parent a container-type, then write @container rules for the child.",
];

// Words and citations in order, the units a stream delivers.
const WORD_BREAK = /(?<= )/u;
const units: readonly StreamingTextPart[] = reply.flatMap(
	(part): StreamingTextPart[] =>
		typeof part === "string" ? part.split(WORD_BREAK) : [part]
);
// Real streams arrive in uneven bursts; this rhythm repeats.
const BURSTS = [2, 4, 1, 3, 5, 2];
const CHUNK_MS = 160;

// The reply as it stands after the first `count` units, text merged back.
function contentAt(count: number) {
	const parts: StreamingTextPart[] = [];
	for (const unit of units.slice(0, count)) {
		const last = parts.at(-1);
		if (typeof unit === "string" && typeof last === "string") {
			parts[parts.length - 1] = last + unit;
		} else {
			parts.push(unit);
		}
	}
	return parts;
}

export function StreamingAnswer() {
	const [count, setCount] = useState(0);
	const [feedback, setFeedback] = useState<StreamingTextFeedback | null>(null);
	const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
	const status: StreamingTextState =
		count >= units.length ? "complete" : "streaming";

	const play = useCallback(() => {
		clearInterval(timer.current);
		setCount(0);
		setFeedback(null);
		let burst = 0;
		let sent = 0;
		timer.current = setInterval(() => {
			sent = Math.min(
				sent + (BURSTS[burst % BURSTS.length] ?? 1),
				units.length
			);
			burst += 1;
			setCount(sent);
			if (sent >= units.length) {
				clearInterval(timer.current);
			}
		}, CHUNK_MS);
	}, []);
	// The demo streams once when it mounts and stops if it unmounts.
	const start = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) {
				return;
			}
			play();
			return () => clearInterval(timer.current);
		},
		[play]
	);

	return (
		<div ref={start} {...props(styles.frame)}>
			<StreamingText
				content={contentAt(count)}
				feedback={feedback}
				followUps={[
					"Show a card that switches layout at 400px",
					"When should I still use media queries?",
				]}
				onFeedback={setFeedback}
				onRetry={play}
				sources={sources}
				status={status}
			/>
			<span {...props(styles.replay)}>
				<Button onClick={play} size="sm" variant="outline">
					Replay
				</Button>
			</span>
		</div>
	);
}

// A stream that failed partway: the partial reply stays, with Retry.
export function InterruptedAnswer() {
	const [attempt, setAttempt] = useState(0);
	const retry = useCallback(() => setAttempt((current) => current + 1), []);
	return (
		<div {...props(styles.frame)}>
			<StreamingText
				content={contentAt(attempt % 2 === 0 ? 14 : units.length)}
				onRetry={retry}
				sources={sources}
				status={attempt % 2 === 0 ? "error" : "complete"}
			/>
		</div>
	);
}
