"use client";

import { props } from "@stylexjs/stylex";
import { AnimatePresence, m } from "motion/react";
import { type ComponentPropsWithRef, useCallback } from "react";
import type { Closed } from "../../closed";
import { CopyButton } from "../../copy-button";
import {
	IconAlertCircle,
	IconArrowBackUp,
	IconRefresh,
	IconThumbDown,
	IconThumbUp,
} from "../../icons";
import { disclosure, MotionScope } from "../../motion";
import { typeRoles } from "../../styles/typography.styles";
import { Button } from "../button/button";
import { Sources } from "../sources/sources";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";
import { streamingTextStyles as styles } from "./streaming-text.styles";
import {
	citedSources,
	plainText,
	StreamedWords,
	type StreamingTextPart,
	type StreamingTextSource,
} from "./streaming-text-words";

export type {
	StreamingTextPart,
	StreamingTextSource,
} from "./streaming-text-words";
/**
 * `streaming` while words arrive, `complete` once the reply has ended, and
 * `error` when it stopped early; the partial reply stays.
 */
export type StreamingTextState = "complete" | "error" | "streaming";
export type StreamingTextFeedback = "down" | "up";

export type StreamingTextProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "content" | "data-slot" | "role"
> & {
	/**
	 * The reply so far: text, or text with citations placed where the model
	 * cites them. Pass the growing value as it streams; only new words animate.
	 */
	content: string | readonly StreamingTextPart[];
	/** The rating the person gave, if any. */
	feedback?: StreamingTextFeedback | null;
	/** Prompts offered once the reply is complete. */
	followUps?: readonly string[];
	/** Shows Good and Bad response buttons. */
	onFeedback?: (feedback: StreamingTextFeedback | null) => void;
	onFollowUp?: (prompt: string, index: number) => void;
	/** Shows a Retry button. */
	onRetry?: () => void;
	/** Sources cited in `content`, listed under the reply. */
	sources?: readonly StreamingTextSource[];
	status: StreamingTextState;
};

function FeedbackButtons({
	feedback,
	onFeedback,
}: {
	feedback: StreamingTextFeedback | null | undefined;
	onFeedback: (feedback: StreamingTextFeedback | null) => void;
}) {
	const up = useCallback(
		() => onFeedback(feedback === "up" ? null : "up"),
		[feedback, onFeedback]
	);
	const down = useCallback(
		() => onFeedback(feedback === "down" ? null : "down"),
		[feedback, onFeedback]
	);
	return (
		<>
			<Button
				aria-label="Good response"
				aria-pressed={feedback === "up"}
				onClick={up}
				size="icon-xs"
				variant="ghost"
			>
				<IconThumbUp aria-hidden="true" size="1em" />
			</Button>
			<Button
				aria-label="Bad response"
				aria-pressed={feedback === "down"}
				onClick={down}
				size="icon-xs"
				variant="ghost"
			>
				<IconThumbDown aria-hidden="true" size="1em" />
			</Button>
		</>
	);
}

// Follow-ups rise in one after another when a reply finishes on screen; a
// reply that loads complete shows them at once.
const staggered = {
	hidden: {},
	shown: { transition: { staggerChildren: 0.09 } },
};
const rising = {
	hidden: { opacity: 0, y: 4 },
	shown: { opacity: 1, transition: disclosure, y: 0 },
};

function FollowUp({
	index,
	onFollowUp,
	prompt,
}: {
	index: number;
	onFollowUp: StreamingTextProps["onFollowUp"];
	prompt: string;
}) {
	const choose = useCallback(
		() => onFollowUp?.(prompt, index),
		[index, onFollowUp, prompt]
	);
	return (
		<m.li variants={rising}>
			<button
				onClick={choose}
				type="button"
				{...props(typeRoles.ui, styles.followUp)}
			>
				<IconArrowBackUp
					aria-hidden="true"
					size={14}
					{...props(styles.followUpIcon)}
				/>
				{prompt}
			</button>
		</m.li>
	);
}

function FollowUps({
	followUps,
	onFollowUp,
}: {
	followUps: readonly string[];
	onFollowUp: StreamingTextProps["onFollowUp"];
}) {
	return (
		<div data-slot="streaming-text-follow-ups" {...props(styles.followUps)}>
			<p {...props(typeRoles.label, styles.followUpsTitle)}>Follow-ups</p>
			<m.ul
				animate="shown"
				initial="hidden"
				variants={staggered}
				{...props(styles.followUpsList)}
			>
				{followUps.map((prompt, index) => (
					<FollowUp
						index={index}
						key={prompt}
						onFollowUp={onFollowUp}
						prompt={prompt}
					/>
				))}
			</m.ul>
		</div>
	);
}

const STOPPED = "The reply stopped before it finished.";

// The visible note shows only on error; the live region is always present so
// the announcement is not lost.
function ErrorNote({ error }: { error: boolean }) {
	return (
		<>
			{error ? (
				<p
					data-slot="streaming-text-error"
					{...props(typeRoles.ui, styles.error)}
				>
					<IconAlertCircle aria-hidden="true" size={16} />
					{STOPPED}
				</p>
			) : null}
			<span
				aria-live="polite"
				role="status"
				{...props(visuallyHiddenStyles.root)}
			>
				{error ? STOPPED : null}
			</span>
		</>
	);
}

function Actions({
	content,
	feedback,
	onFeedback,
	onRetry,
	sources,
	streaming,
}: Pick<
	StreamingTextProps,
	"content" | "feedback" | "onFeedback" | "onRetry"
> & { sources: readonly StreamingTextSource[]; streaming: boolean }) {
	// Present while streaming so the reply never jumps, but inert.
	return (
		<div
			data-slot="streaming-text-actions"
			inert={streaming}
			{...props(styles.actions)}
		>
			<div {...props(styles.actionsGroup)}>
				<CopyButton
					label="Copy response"
					text={plainText(content, sources.length)}
				/>
				{onRetry ? (
					<Button
						aria-label="Retry"
						onClick={onRetry}
						size="icon-xs"
						variant="ghost"
					>
						<IconRefresh aria-hidden="true" size="1em" />
					</Button>
				) : null}
				{onFeedback ? (
					<FeedbackButtons feedback={feedback} onFeedback={onFeedback} />
				) : null}
			</div>
		</div>
	);
}

/**
 * A reply that arrives a word at a time. Words resolve out of a soft blur,
 * citations sit where the model cites them, and once the reply is complete
 * its actions, sources, and follow-ups become available.
 */
export function StreamingText({
	content,
	feedback,
	followUps = [],
	onFeedback,
	onFollowUp,
	onRetry,
	ref: forwardedRef,
	sources = [],
	status,
	...rest
}: StreamingTextProps) {
	const streaming = status === "streaming";
	for (const name of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	return (
		<div
			{...rest}
			data-slot="streaming-text"
			data-status={status}
			ref={forwardedRef}
			{...props(styles.root)}
		>
			<StreamedWords
				content={content}
				sources={sources}
				streaming={streaming}
			/>
			<ErrorNote error={status === "error"} />
			{/* While words arrive, a source shows once the reply cites it. */}
			<Sources sources={streaming ? citedSources(content, sources) : sources} />
			<Actions
				content={content}
				feedback={feedback}
				onFeedback={onFeedback}
				onRetry={onRetry}
				sources={sources}
				streaming={streaming}
			/>
			<MotionScope>
				<AnimatePresence initial={false}>
					{status === "complete" && followUps.length > 0 ? (
						<FollowUps
							followUps={followUps}
							key="follow-ups"
							onFollowUp={onFollowUp}
						/>
					) : null}
				</AnimatePresence>
			</MotionScope>
		</div>
	);
}
