"use client";

import { props } from "@stylexjs/stylex";
import { type ComponentPropsWithRef, type RefCallback, useState } from "react";
import type { Closed } from "../../closed";
import { IconChevronDown } from "../../icons";
import { typeRoles } from "../../styles/typography.styles";
import { formatSeconds, useElapsed } from "../../use-elapsed";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "../collapsible/collapsible";
import { CitationChip } from "../inline-citation/inline-citation";
import { Spinner } from "../spinner/spinner";
import { streamingTextStyles } from "../streaming-text/streaming-text.styles";
import {
	StreamedWords,
	type StreamingTextSource,
} from "../streaming-text/streaming-text-words";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";
import { agentThinkingStyles as styles } from "./agent-thinking.styles";

/** `streaming` while the model reasons; `complete` once it starts to answer. */
export type AgentThinkingState = "complete" | "streaming";

export type AgentThinkingProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "content" | "data-slot" | "role"
> & {
	/** The reasoning so far. Paragraphs are separated by blank lines. */
	content?: string;
	/**
	 * Seconds spent thinking, for a reply loaded from history. While the
	 * component watches the reasoning stream, it measures this itself.
	 */
	duration?: number;
	/** Sources the model is reading, shown as they arrive. */
	sources?: readonly StreamingTextSource[];
	/** What the model is doing now, such as "Reviewing the incident call". */
	stage?: string;
	status: AgentThinkingState;
};

// The fade at the top appears only once older lines are out of view, so a
// short reasoning never loses its first line. The inner wrapper is always
// present, so its growth is seen even after the window stops growing.
function watchOverflow(frame: HTMLDivElement | null) {
	const inner = frame?.firstElementChild;
	if (!(frame && inner) || typeof ResizeObserver === "undefined") {
		return;
	}
	// Content anchored to the bottom spills upward, which scrollHeight does not
	// count, so compare the wrapper with the window's content box directly.
	const observer = new ResizeObserver(() => {
		const room =
			frame.clientHeight -
			Number.parseFloat(getComputedStyle(frame).paddingTop);
		frame.toggleAttribute(
			"data-overflowing",
			inner.getBoundingClientRect().height > room + 1
		);
	});
	observer.observe(inner);
	observer.observe(frame);
	return () => observer.disconnect();
}

function Sources({
	sources,
	streaming,
}: {
	sources: readonly StreamingTextSource[];
	streaming: boolean;
}) {
	if (sources.length === 0) {
		return null;
	}
	return (
		<div data-slot="agent-thinking-sources" {...props(styles.sources)}>
			{sources.map((source, index) => (
				<CitationChip
					arrival={streaming ? streamingTextStyles.resolveArrive : undefined}
					// biome-ignore lint/suspicious/noArrayIndexKey: sources only append, so a position is stable.
					key={index}
					sources={[source]}
				/>
			))}
		</div>
	);
}

function Header({
	expandable,
	markEnd,
	markStart,
	seconds,
	stage,
	streaming,
}: {
	expandable: boolean;
	markEnd: RefCallback<HTMLElement>;
	markStart: RefCallback<HTMLElement>;
	seconds: number | undefined;
	stage: string;
	streaming: boolean;
}) {
	if (streaming) {
		return (
			<p
				data-slot="agent-thinking-stage"
				ref={markStart}
				{...props(typeRoles.ui, styles.header)}
			>
				<span {...props(styles.indicator)}>
					<Spinner aria-hidden="true" variant="thinking" />
				</span>
				<span {...props(styles.stage)}>{stage}</span>
			</p>
		);
	}
	const label = (
		<>
			Thought
			{seconds === undefined ? null : (
				<span {...props(styles.duration)}>for {formatSeconds(seconds)}</span>
			)}
		</>
	);
	if (!expandable) {
		return (
			<p ref={markEnd} {...props(typeRoles.ui, styles.summary)}>
				{label}
			</p>
		);
	}
	return (
		<CollapsibleTrigger
			ref={markEnd}
			render={<button type="button" {...props(typeRoles.ui, styles.toggle)} />}
		>
			{label}
			<IconChevronDown
				aria-hidden="true"
				size={14}
				{...props(styles.chevron)}
			/>
		</CollapsibleTrigger>
	);
}

// One region, always present, announces each step and then the time spent;
// a region that appears with text already in it is often not read.
function Announcement({
	seconds,
	stage,
	streaming,
}: {
	seconds: number | undefined;
	stage: string;
	streaming: boolean;
}) {
	let message = stage;
	if (!streaming) {
		message =
			seconds === undefined
				? "Thought"
				: `Thought for ${formatSeconds(seconds)}`;
	}
	return (
		<span
			aria-live="polite"
			data-slot="agent-thinking-status"
			role="status"
			{...props(visuallyHiddenStyles.root)}
		>
			{message}
		</span>
	);
}

// The sources and reasoning, capped to a rolling window until opened.
function Body({
	capped,
	content,
	sources,
	streaming,
}: {
	capped: boolean;
	content: string;
	sources: readonly StreamingTextSource[];
	streaming: boolean;
}) {
	return (
		<CollapsiblePanel>
			<div
				data-slot="agent-thinking-content"
				ref={capped ? watchOverflow : undefined}
				{...props(styles.content, capped && styles.window)}
			>
				<div {...props(styles.inner)}>
					<Sources sources={sources} streaming={streaming} />
					{content ? (
						<StreamedWords
							content={content}
							slot="agent-thinking-reasoning"
							sources={[]}
							streaming={streaming}
							tone="reasoning"
						/>
					) : null}
				</div>
			</div>
		</CollapsiblePanel>
	);
}

/**
 * The model working before it answers. While it reasons, the current step
 * shimmers beside a thinking indicator, with the sources it reads and the
 * newest lines of its reasoning; once done, it folds into "Thought for 7s".
 */
export function AgentThinking({
	content = "",
	duration,
	ref: forwardedRef,
	sources = [],
	stage = "Thinking",
	status,
	...rest
}: AgentThinkingProps) {
	const streaming = status === "streaming";
	const time = useElapsed();
	const [open, setOpen] = useState(false);
	const seconds = duration ?? time.seconds;
	const expandable = content !== "" || sources.length > 0;
	// The window stays capped until the reader opens it, so the fold closes
	// from what was on screen.
	const capped = streaming || !open;
	for (const name of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, name);
	}
	return (
		<div
			{...rest}
			data-slot="agent-thinking"
			data-status={status}
			ref={forwardedRef}
		>
			<Collapsible
				onOpenChange={setOpen}
				open={streaming || open}
				render={<div {...props(styles.root)} />}
			>
				<Announcement seconds={seconds} stage={stage} streaming={streaming} />
				<Header
					expandable={expandable}
					markEnd={time.markEnd}
					markStart={time.markStart}
					seconds={seconds}
					stage={stage}
					streaming={streaming}
				/>
				{expandable ? (
					<Body
						capped={capped}
						content={content}
						sources={sources}
						streaming={streaming}
					/>
				) : null}
			</Collapsible>
		</div>
	);
}
