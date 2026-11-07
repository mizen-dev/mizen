"use client";

import {
	AgentThinking,
	Button,
	StreamingText,
	type StreamingTextSource,
} from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";
import { useCallback, useRef, useState } from "react";

const styles = create({
	frame: {
		display: "flex",
		flexDirection: "column",
		gap: "1rem",
		maxInlineSize: "34rem",
		minBlockSize: "20rem",
		width: "100%",
	},
	replay: { alignSelf: "flex-start" },
});

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

// One step per paragraph of reasoning.
const stages = [
	"Reading the sources",
	"Checking browser support",
	"Drafting the answer",
];
const reasoning = [
	"The question is whether container queries are ready to ship. MDN explains how they work, so start there.",
	"Support matters more than syntax. The web.dev post says size container queries landed in all stable browsers in February 2023.",
	"That is long enough ago that current browsers all have them, so the answer can lead with how to use them.",
];
const answer =
	"Yes. Size container queries have worked in all stable browsers since February 2023.[2] Give the parent a container-type, then write @container rules for the child.";

const WORD = /(?<= )/;
const reasoningWords = reasoning.join("\n\n").split(WORD);
const answerWords = answer.split(WORD);
const TICK_MS = 120;
const WORDS_PER_TICK = 3;
// Ticks spent reading sources before the reasoning starts.
const READING_TICKS = 8;
const THOUGHT_AT =
	READING_TICKS + Math.ceil(reasoningWords.length / WORDS_PER_TICK);
// A short pause between thinking and answering.
const ANSWER_AT = THOUGHT_AT + 3;
const DONE_AT = ANSWER_AT + Math.ceil(answerWords.length / WORDS_PER_TICK);

// Everything on screen follows from how many ticks have passed.
function turnAt(tick: number) {
	const reasoningText = reasoningWords
		.slice(0, Math.max(0, tick - READING_TICKS) * WORDS_PER_TICK)
		.join("");
	const paragraph = reasoningText ? reasoningText.split("\n\n").length : 0;
	return {
		answerText: answerWords
			.slice(0, Math.max(0, tick - ANSWER_AT) * WORDS_PER_TICK)
			.join(""),
		reasoningText,
		sourcesRead: sources.slice(0, Math.min(2, Math.floor(tick / 3))),
		stage: stages[Math.max(0, paragraph - 1)] ?? stages[0],
	};
}

export function ThinkingThenAnswer() {
	const [tick, setTick] = useState(0);
	const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
	const play = useCallback(() => {
		clearInterval(timer.current);
		setTick(0);
		let current = 0;
		timer.current = setInterval(() => {
			current += 1;
			setTick(current);
			if (current >= DONE_AT) {
				clearInterval(timer.current);
			}
		}, TICK_MS);
	}, []);
	// The demo plays once when it mounts and stops if it unmounts.
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
	const turn = turnAt(tick);

	return (
		<div ref={start} {...props(styles.frame)}>
			<AgentThinking
				content={turn.reasoningText}
				sources={turn.sourcesRead}
				stage={turn.stage}
				status={tick < THOUGHT_AT ? "streaming" : "complete"}
			/>
			{turn.answerText ? (
				<StreamingText
					content={turn.answerText}
					sources={sources}
					status={tick < DONE_AT ? "streaming" : "complete"}
				/>
			) : null}
			<span {...props(styles.replay)}>
				<Button onClick={play} size="sm" variant="outline">
					Replay
				</Button>
			</span>
		</div>
	);
}
