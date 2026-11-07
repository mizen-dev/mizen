"use client";

import {
	Button,
	QuestionCard,
	type QuestionCardAnswers,
	type QuestionCardQuestion,
} from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";
import { useCallback, useState } from "react";

const styles = create({
	// Collapsed, the answered card sizes to itself, so it sits centered.
	fit: {
		inlineSize: "fit-content",
		marginInline: "auto",
		maxInlineSize: "34rem",
		minInlineSize: 0,
	},
	frame: {
		display: "flex",
		flexDirection: "column",
		gap: "1rem",
		maxInlineSize: "34rem",
		minInlineSize: 0,
		width: "100%",
	},
	replay: { alignSelf: "flex-start" },
});

const questions: readonly QuestionCardQuestion[] = [
	{
		description: "Below it, the image moves above the text.",
		id: "breakpoint",
		options: [
			{ description: "Matches the settings sidebar.", label: "400px" },
			{ description: "Fits two cards side by side.", label: "480px" },
			{ description: "The current tablet size.", label: "560px" },
		],
		title: "Where should Card switch layout?",
	},
	{
		id: "rollout",
		multiple: true,
		options: [
			{ label: "Settings sidebar" },
			{ label: "Dashboard grid" },
			{ label: "Search results" },
		],
		title: "Which places should get the new Card first?",
	},
	{
		id: "fallback",
		options: [
			{ description: "Older browsers keep working.", label: "Keep them" },
			{ description: "Less CSS to maintain.", label: "Remove them" },
		],
		other: false,
		title: "Keep the media queries as a fallback?",
	},
];

// The agent asks before it starts; answers go back as one object.
export function AgentQuestions() {
	const [answers, setAnswers] = useState<QuestionCardAnswers | null>(null);
	const replay = useCallback(() => setAnswers(null), []);
	return (
		<div {...props(styles.frame)}>
			<QuestionCard
				answers={answers ?? undefined}
				onSubmit={setAnswers}
				questions={questions}
				status={answers ? "answered" : "pending"}
			/>
			{answers ? (
				<span {...props(styles.replay)}>
					<Button onClick={replay} size="sm" variant="outline">
						Replay
					</Button>
				</span>
			) : null}
		</div>
	);
}

// One question from history folds into the question and its answer.
export function AnsweredQuestion() {
	return (
		<div {...props(styles.fit)}>
			<QuestionCard
				answers={{ breakpoint: ["400px"] }}
				questions={questions.slice(0, 1)}
				status="answered"
			/>
		</div>
	);
}
