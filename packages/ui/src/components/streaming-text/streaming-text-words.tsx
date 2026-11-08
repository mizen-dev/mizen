import { props } from "@stylexjs/stylex";
import { type AnimationEvent, useCallback, useState } from "react";
import { typeRoles } from "../../styles/typography.styles";
import type { CitationSource } from "../inline-citation/citation-source";
import { CitationChip } from "../inline-citation/inline-citation";
import {
	streamingTextDynamic,
	streamingTextStyles as styles,
} from "./streaming-text.styles";

/** A cited source; see CitationSource. */
export type StreamingTextSource = CitationSource;

/** Plain text, or a citation of `sources[source]` placed at that point. */
export type StreamingTextPart = string | { source: number };

type Token =
	| { kind: "word"; text: string }
	| { kind: "citation"; sources: number[] };

// A burst spreads across at most this long, however many words it brings.
const BURST_MS = 400;
const WORD_STAGGER_MS = 30;
// A word with the space after it, or a run of leading space.
const WORD_PATTERN = /\S+\s*|\s+/gu;
const TRAILING_SPACE = /\s$/u;
// A numbered citation marker such as [1], as some providers write them.
const CITATION_MARKER = /\[(?<citation>\d{1,3})\]/gu;

// Turns [n] markers into citations of sources[n - 1]. A marker with no
// matching source stays text, so stray brackets in prose survive.
function splitMarkers(text: string, sourceCount: number) {
	const parts: StreamingTextPart[] = [];
	let rest = 0;
	for (const match of text.matchAll(CITATION_MARKER)) {
		const source = Number(match[1]) - 1;
		if (source < 0 || source >= sourceCount) {
			continue;
		}
		parts.push(text.slice(rest, match.index), { source });
		rest = match.index + match[0].length;
	}
	parts.push(text.slice(rest));
	return parts.filter((part) => part !== "");
}

function toParts(
	content: string | readonly StreamingTextPart[],
	sourceCount: number
) {
	const parts = typeof content === "string" ? [content] : content;
	return parts.flatMap((part) =>
		typeof part === "string" ? splitMarkers(part, sourceCount) : [part]
	);
}

const BLANK = /^\s*$/u;

// Citations at one point, such as [1][2] or [1] [2], become one group, so
// they show as one chip.
function pushCitation(tokens: Token[], source: number) {
	const last = tokens.at(-1);
	const beforeLast = tokens.at(-2);
	if (last === undefined) {
		tokens.push({ kind: "citation", sources: [source] });
		return;
	}
	if (last.kind === "citation") {
		last.sources.push(source);
		return;
	}
	if (
		last.kind === "word" &&
		BLANK.test(last.text) &&
		beforeLast?.kind === "citation"
	) {
		tokens.pop();
		beforeLast.sources.push(source);
		return;
	}
	tokens.push({ kind: "citation", sources: [source] });
}

export function toTokens(
	content: string | readonly StreamingTextPart[],
	sourceCount = 0
) {
	const tokens: Token[] = [];
	for (const part of toParts(content, sourceCount)) {
		if (typeof part !== "string") {
			pushCitation(tokens, part.source);
			continue;
		}
		// Each word keeps the space after it, so line breaks survive.
		for (const text of part.match(WORD_PATTERN) ?? []) {
			tokens.push({ kind: "word", text });
		}
	}
	return tokens;
}

/** The sources the reply has cited so far, in their original order. */
export function citedSources(
	content: string | readonly StreamingTextPart[],
	sources: readonly StreamingTextSource[]
) {
	const cited = new Set(
		toParts(content, sources.length).flatMap((part) =>
			typeof part === "string" ? [] : [part.source]
		)
	);
	return sources.filter((_, index) => cited.has(index));
}

/** The reply as plain text, without citations, for copying. */
export function plainText(
	content: string | readonly StreamingTextPart[],
	sourceCount = 0
) {
	return toParts(content, sourceCount)
		.filter((part) => typeof part === "string")
		.join("");
}

interface Arrival {
	count: number;
	/** Tokens from here arrived in the latest update. */
	from: number;
	/**
	 * Tokens below this never animate: they were there at mount, or their
	 * reveal has ended. A finished reveal drops its animation, so showing the
	 * text again, such as when a hidden tab comes back, replays nothing.
	 */
	settled: number;
}

// Tracks which tokens are new since the last render, adjusting state during
// render rather than in an effect.
function useArrival(count: number) {
	const [arrival, setArrival] = useState<Arrival>(() => ({
		count,
		from: count,
		settled: count,
	}));
	// A token's reveal ended: it and every token before it are settled.
	const settle = useCallback((index: number) => {
		setArrival((current) =>
			index < current.settled
				? current
				: { ...current, settled: Math.min(index + 1, current.count) }
		);
	}, []);
	if (arrival.count === count) {
		return { arrival, settle };
	}
	const next = {
		count,
		from: Math.min(arrival.count, count),
		settled: Math.min(arrival.settled, count),
	};
	setArrival(next);
	return { arrival: next, settle };
}

// The token whose reveal just ended: the paragraph's direct child it sits in.
function tokenIndex(paragraph: Element, target: EventTarget | null) {
	let node = target instanceof Element ? target : null;
	while (node && node.parentElement !== paragraph) {
		node = node.parentElement;
	}
	return node ? Array.prototype.indexOf.call(paragraph.children, node) : -1;
}

/** `reply` runs the color trail; `reasoning` stays muted and only resolves. */
export type StreamedTone = "reasoning" | "reply";

function arrivalStyle(index: number, arrival: Arrival, trail: boolean) {
	if (index < arrival.settled) {
		return null;
	}
	const burst = arrival.count - arrival.from;
	const step = Math.min(WORD_STAGGER_MS, BURST_MS / Math.max(burst, 1));
	const delay = index >= arrival.from ? (index - arrival.from) * step : 0;
	return [
		trail ? styles.word : styles.resolveArrive,
		streamingTextDynamic.delay(`${Math.round(delay)}ms`),
	];
}

// While streaming, a last word with no space after it may still be growing
// ("Contai" before "Container"), so it waits until the stream confirms it.
function settledTokens(tokens: Token[], streaming: boolean) {
	const last = tokens.at(-1);
	const partial =
		streaming && last?.kind === "word" && !TRAILING_SPACE.test(last.text);
	return partial ? tokens.slice(0, -1) : tokens;
}

// The reply's height eases to each new line instead of jumping, so whatever
// sits below it moves smoothly. The observer sets the height directly.
function easeHeight(frame: HTMLDivElement | null) {
	const content = frame?.firstElementChild;
	if (!(frame && content) || typeof ResizeObserver === "undefined") {
		return;
	}
	const observer = new ResizeObserver(() => {
		frame.style.height = `${content.getBoundingClientRect().height}px`;
	});
	observer.observe(content);
	return () => observer.disconnect();
}

export function StreamedWords({
	content,
	slot = "streaming-text-content",
	sources,
	streaming,
	tone = "reply",
}: {
	content: string | readonly StreamingTextPart[];
	slot?: string;
	sources: readonly StreamingTextSource[];
	streaming: boolean;
	tone?: StreamedTone;
}) {
	const tokens = settledTokens(toTokens(content, sources.length), streaming);
	const { arrival, settle } = useArrival(tokens.length);
	const ended = useCallback(
		(event: AnimationEvent<HTMLParagraphElement>) => {
			const index = tokenIndex(event.currentTarget, event.target);
			if (index >= 0) {
				settle(index);
			}
		},
		[settle]
	);
	return (
		<div ref={easeHeight} {...props(styles.textFrame)}>
			<p
				aria-busy={streaming || undefined}
				data-slot={slot}
				onAnimationEnd={ended}
				{...props(
					tone === "reply" ? typeRoles.body : typeRoles.ui,
					styles.text,
					tone === "reasoning" && styles.reasoningText
				)}
			>
				{tokens.map((token, index) => {
					const style = arrivalStyle(
						index,
						arrival,
						tone === "reply" && token.kind === "word"
					);
					if (token.kind === "citation") {
						return (
							<CitationChip
								arrival={style}
								// biome-ignore lint/suspicious/noArrayIndexKey: tokens only append, so a position is stable.
								key={index}
								sources={token.sources.flatMap((at) => sources[at] ?? [])}
							/>
						);
					}
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: tokens only append, so a position is stable.
						<span key={index} {...props(style)}>
							{token.text}
						</span>
					);
				})}
			</p>
		</div>
	);
}
