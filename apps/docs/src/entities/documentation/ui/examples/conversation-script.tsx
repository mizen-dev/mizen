"use client";
import {
	AgentThinking,
	Message,
	StreamingText,
	type StreamingTextState,
	TaskList,
	type TaskListStep,
	Terminal,
	type TerminalStatus,
	ToolCallGroup,
	type ToolCallGroupCall,
} from "@mizen-labs/ui";
import { useCallback, useRef, useState } from "react";

// A scripted agent for the Conversation examples: a scene is the composer's
// draft and the turns so far, and a script is beats that change it in time.

interface UserTurn {
	from: "user";
	id: string;
	text: string;
}

interface AgentTurn {
	from: "agent";
	id: string;
	plan?: { steps: readonly TaskListStep[]; title: string };
	reply?: { status: StreamingTextState; text: string };
	run?: { command: string; output: string; status: TerminalStatus };
	thinking?: { content: string; status: "complete" | "streaming" };
	tools?: readonly ToolCallGroupCall[];
}

export type Turn = AgentTurn | UserTurn;

export interface Scene {
	draft: string;
	turns: readonly Turn[];
	working: boolean;
}

export interface Beat {
	/** Milliseconds to wait before this beat. */
	after: number;
	apply: (scene: Scene) => Scene;
}

export const emptyScene: Scene = { draft: "", turns: [], working: false };

const TYPE_MS = 28;
const WORD_MS = 34;
const LINE_MS = 120;

function patchAgent(
	id: string,
	patch: (turn: AgentTurn) => Partial<AgentTurn>
): Beat["apply"] {
	return (scene) => ({
		...scene,
		turns: scene.turns.map((turn) =>
			turn.from === "agent" && turn.id === id
				? { ...turn, ...patch(turn) }
				: turn
		),
	});
}

/** The person types the prompt into the composer, a few letters at a time. */
export function typing(text: string): Beat[] {
	const beats: Beat[] = [];
	for (let end = 2; end < text.length + 2; end += 2) {
		const draft = text.slice(0, end);
		beats.push({ after: TYPE_MS, apply: (scene) => ({ ...scene, draft }) });
	}
	return beats;
}

/** Sends the draft and starts the agent's turn. */
export function sending(userId: string, agentId: string, after = 450): Beat {
	return {
		after,
		apply: (scene) => ({
			draft: "",
			turns: [
				...scene.turns,
				{ from: "user", id: userId, text: scene.draft },
				{ from: "agent", id: agentId },
			],
			working: true,
		}),
	};
}

function words(text: string) {
	return text
		.split(" ")
		.map((_, index, all) => all.slice(0, index + 1).join(" "));
}

/** The agent's reasoning streams in, then folds. */
export function thinking(id: string, text: string): Beat[] {
	return [
		...words(text).map((content) => ({
			after: WORD_MS,
			apply: patchAgent(id, () => ({
				thinking: { content, status: "streaming" as const },
			})),
		})),
		{
			after: 500,
			apply: patchAgent(id, (turn) => ({
				thinking: {
					content: turn.thinking?.content ?? text,
					status: "complete",
				},
			})),
		},
	];
}

/** Shows the plan, every step still to do. */
export function planning(
	id: string,
	title: string,
	steps: readonly string[]
): Beat {
	return {
		after: 400,
		apply: patchAgent(id, () => ({
			plan: {
				steps: steps.map((label, index) => ({
					id: `step-${index}`,
					status: "pending" as const,
					title: label,
				})),
				title,
			},
		})),
	};
}

/** Moves one step of the plan to a new status. */
export function step(
	id: string,
	index: number,
	status: TaskListStep["status"],
	after = 300
): Beat {
	return {
		after,
		apply: patchAgent(id, (turn) => ({
			plan: turn.plan && {
				...turn.plan,
				steps: turn.plan.steps.map((item, at) =>
					at === index ? { ...item, status } : item
				),
			},
		})),
	};
}

/** Starts a tool call. */
export function calling(
	id: string,
	call: ToolCallGroupCall,
	after = 300
): Beat {
	return {
		after,
		apply: patchAgent(id, (turn) => ({
			tools: [...(turn.tools ?? []), { ...call, status: "running" }],
		})),
	};
}

/** Finishes a tool call with its past-tense title and output. */
export function called(
	id: string,
	callId: string,
	finished: Partial<ToolCallGroupCall>,
	after = 900
): Beat {
	return {
		after,
		apply: patchAgent(id, (turn) => ({
			tools: turn.tools?.map((call) =>
				call.id === callId ? { ...call, ...finished, status: "complete" } : call
			),
		})),
	};
}

/** Runs a command; its output arrives a line at a time, then it exits 0. */
export function running(id: string, command: string, lines: string[]): Beat[] {
	return [
		{
			after: 400,
			apply: patchAgent(id, () => ({
				run: { command, output: "", status: "running" },
			})),
		},
		...lines.map((_, index) => ({
			after: LINE_MS,
			apply: patchAgent(id, () => ({
				run: {
					command,
					output: lines.slice(0, index + 1).join("\n"),
					status: "running" as const,
				},
			})),
		})),
		{
			after: 500,
			apply: patchAgent(id, (turn) => ({
				run: turn.run && { ...turn.run, status: "complete" },
			})),
		},
	];
}

/** The reply streams in, then the turn ends. */
export function replying(id: string, text: string): Beat[] {
	return [
		...words(text).map((sofar) => ({
			after: WORD_MS,
			apply: patchAgent(id, () => ({
				reply: { status: "streaming" as const, text: sofar },
			})),
		})),
		{
			after: 200,
			apply: (scene: Scene) => ({
				...patchAgent(id, (turn) => ({
					reply: { status: "complete", text: turn.reply?.text ?? text },
				}))(scene),
				working: false,
			}),
		},
	];
}

/** Applies a script at once: the finished conversation, as from history. */
export function settle(beats: readonly Beat[], from: Scene = emptyScene) {
	return beats.reduce((scene, beat) => beat.apply(scene), from);
}

function reducedMotion() {
	return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Plays a script once its example scrolls into view. Reduced motion shows
 * the finished conversation at once. `play` starts it over.
 */
export function usePlayer(
	defaultBeats: readonly Beat[],
	start: Scene = emptyScene
) {
	const [scene, setScene] = useState(start);
	const [done, setDone] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const play = useCallback(
		(beats: readonly Beat[] = defaultBeats, from: Scene = start) => {
			clearTimeout(timer.current);
			setDone(false);
			if (reducedMotion()) {
				setScene(settle(beats, from));
				setDone(true);
				return;
			}
			setScene(from);
			let index = 0;
			const next = () => {
				const beat = beats[index];
				if (!beat) {
					setDone(true);
					return;
				}
				index += 1;
				setScene(beat.apply);
				timer.current = setTimeout(next, beats[index]?.after ?? 0);
			};
			timer.current = setTimeout(next, beats[0]?.after ?? 0);
		},
		[defaultBeats, start]
	);
	const watch = useCallback(
		(node: HTMLElement | null) => {
			if (!node) {
				return;
			}
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries.some((entry) => entry.isIntersecting)) {
						observer.disconnect();
						play();
					}
				},
				{ threshold: 0.4 }
			);
			observer.observe(node);
			return () => {
				observer.disconnect();
				clearTimeout(timer.current);
			};
		},
		[play]
	);
	return { done, play, scene, watch };
}

/** One turn, drawn with the parts the agent used. */
export function TurnView({ turn }: { turn: Turn }) {
	if (turn.from === "user") {
		return <Message from="user">{turn.text}</Message>;
	}
	return (
		<Message from="agent">
			{turn.thinking ? (
				<AgentThinking
					content={turn.thinking.content}
					status={turn.thinking.status}
				/>
			) : null}
			{turn.plan ? (
				<TaskList steps={turn.plan.steps} title={turn.plan.title} />
			) : null}
			{turn.tools ? <ToolCallGroup calls={turn.tools} /> : null}
			{turn.run ? (
				<Terminal
					command={turn.run.command}
					output={turn.run.output}
					status={turn.run.status}
				/>
			) : null}
			{turn.reply ? (
				<StreamingText content={turn.reply.text} status={turn.reply.status} />
			) : null}
		</Message>
	);
}
