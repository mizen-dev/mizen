"use client";

import { props } from "@stylexjs/stylex";
import { type ComponentPropsWithRef, type RefCallback, useState } from "react";
import type { Closed } from "../../closed";
import {
	IconAlertCircle,
	IconChevronDown,
	IconCircleCheck,
	IconRefresh,
	IconTerminal2,
} from "../../icons";
import { MotionScope, Pop } from "../../motion";
import { typeRoles } from "../../styles/typography.styles";
import { formatShortSeconds, useElapsed } from "../../use-elapsed";
import { agentThinkingStyles } from "../agent-thinking/agent-thinking.styles";
import { Button } from "../button/button";
import {
	CodeBlock,
	CodeBlockCopy,
	CodeBlockHeader,
	CodeBlockTitle,
} from "../code-block/code-block";
import { codeBlockStyles } from "../code-block/code-block.styles";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "../collapsible/collapsible";
import { Spinner } from "../spinner/spinner";
import { toolCallStyles } from "../tool-call/tool-call.styles";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";
import { parseAnsi, plainOutput } from "./ansi";
import { terminalStyles as styles } from "./terminal.styles";

/** `running` while the command runs; then `complete` (exit 0) or `error`. */
export type TerminalStatus = "complete" | "error" | "running";

export type TerminalProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "role"
> & {
	/** The command as typed, such as `pnpm build`. */
	command: string;
	/** Seconds it ran, for a command loaded from history. */
	duration?: number;
	/** The code it exited with; any code but 0 is a failure. */
	exitCode?: number;
	/** Shows Retry under a failed command. */
	onRetry?: () => void;
	/** Everything it printed so far. Terminal colors and redraws are kept. */
	output?: string;
	status: TerminalStatus;
};

// The newest line stays in view while output arrives, unless the reader
// scrolls up to read; scrolling back to the end follows it again.
function followTail(pre: HTMLPreElement | null) {
	if (!pre || typeof MutationObserver === "undefined") {
		return;
	}
	let pinned = true;
	const onScroll = () => {
		pinned = pre.scrollHeight - pre.scrollTop - pre.clientHeight < 8;
	};
	const observer = new MutationObserver(() => {
		if (pinned) {
			pre.scrollTop = pre.scrollHeight;
		}
	});
	pre.addEventListener("scroll", onScroll, { passive: true });
	observer.observe(pre, {
		characterData: true,
		childList: true,
		subtree: true,
	});
	// A finished run opens at its end, where errors usually are.
	pre.scrollTop = pre.scrollHeight;
	return () => {
		observer.disconnect();
		pre.removeEventListener("scroll", onScroll);
	};
}

function Output({ output }: { output: string }) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: pre keeps the output's spacing while naming the scroll region.
		<pre
			aria-label="Output"
			data-slot="terminal-output"
			ref={followTail}
			role="region"
			// biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard focus lets people scroll long output.
			tabIndex={0}
			{...props(typeRoles.mono, codeBlockStyles.content, styles.output)}
		>
			<code {...props(codeBlockStyles.code)}>
				{parseAnsi(output).map((span, index) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: output only grows at the end, so a position is stable.
						key={index}
						{...props(
							span.bold && styles.bold,
							span.muted && styles.muted,
							span.red && styles.red
						)}
					>
						{span.text}
					</span>
				))}
			</code>
		</pre>
	);
}

function Title({
	command,
	exitCode,
	status,
}: Pick<TerminalProps, "command" | "exitCode" | "status">) {
	const code = (
		<code {...props(typeRoles.mono, styles.command)}>{command}</code>
	);
	if (status === "running") {
		return (
			<span {...props(toolCallStyles.title)}>
				<span {...props(agentThinkingStyles.stage)}>Running</span> {code}
			</span>
		);
	}
	if (status === "error" && exitCode !== undefined) {
		return (
			<span {...props(toolCallStyles.title)}>
				{code} <span {...props(styles.verb)}>exited with code {exitCode}</span>
			</span>
		);
	}
	return (
		<span {...props(toolCallStyles.title)}>
			<span {...props(styles.verb)}>
				{status === "error" ? "Failed" : "Ran"}
			</span>{" "}
			{code}
		</span>
	);
}

function Status({
	markEnd,
	markStart,
	seconds,
	status,
}: {
	markEnd: RefCallback<HTMLElement>;
	markStart: RefCallback<HTMLElement>;
	seconds: number | undefined;
	status: TerminalStatus;
}) {
	if (status === "running") {
		return (
			<span ref={markStart} {...props(toolCallStyles.status)}>
				<Spinner aria-hidden="true" />
				<VisuallyHidden>Running</VisuallyHidden>
			</span>
		);
	}
	const failed = status === "error";
	const Icon = failed ? IconAlertCircle : IconCircleCheck;
	return (
		<span ref={markEnd} {...props(typeRoles.ui, toolCallStyles.status)}>
			<Icon
				aria-hidden="true"
				size={16}
				{...props(
					failed ? toolCallStyles.statusError : toolCallStyles.statusComplete
				)}
			/>
			{seconds === undefined ? null : formatShortSeconds(seconds)}
			<VisuallyHidden>{failed ? "Failed" : "Done"}</VisuallyHidden>
		</span>
	);
}

// Outside the fold, so Retry stays in view when the output is folded.
function Failure({ onRetry }: { onRetry: (() => void) | undefined }) {
	if (!onRetry) {
		return null;
	}
	return (
		<div
			data-slot="terminal-retry"
			{...props(
				toolCallStyles.notice,
				toolCallStyles.noticeError,
				toolCallStyles.noticeSlot
			)}
		>
			<p
				{...props(
					typeRoles.ui,
					toolCallStyles.noticeText,
					toolCallStyles.errorText
				)}
			>
				<IconAlertCircle aria-hidden="true" size={16} />
				The command failed.
			</p>
			<Button onClick={onRetry} size="sm" variant="outline">
				<IconRefresh aria-hidden="true" size="1em" />
				Retry
			</Button>
		</div>
	);
}

// The line: what ran, its time, and how it ended. With no output yet there
// is nothing to open, so it is a plain row without a chevron.
function Line({
	command,
	elapsed,
	exitCode,
	seconds,
	status,
	withOutput,
}: Pick<TerminalProps, "command" | "exitCode" | "status"> & {
	elapsed: ReturnType<typeof useElapsed>;
	seconds: number | undefined;
	withOutput: boolean;
}) {
	const content = (
		<>
			<span aria-hidden="true" {...props(toolCallStyles.icon)}>
				<IconTerminal2 size={16} />
			</span>
			<Title command={command} exitCode={exitCode} status={status} />
			<Pop change={status} look={toolCallStyles.statusSlot}>
				<Status
					markEnd={elapsed.markEnd}
					markStart={elapsed.markStart}
					seconds={seconds}
					status={status}
				/>
			</Pop>
		</>
	);
	if (!withOutput) {
		return (
			<div
				data-slot="terminal-line"
				{...props(typeRoles.ui, toolCallStyles.row, styles.plainRow)}
			>
				{content}
			</div>
		);
	}
	return (
		<CollapsibleTrigger
			render={
				<button type="button" {...props(typeRoles.ui, toolCallStyles.row)} />
			}
		>
			{content}
			<IconChevronDown
				aria-hidden="true"
				size={14}
				{...props(toolCallStyles.chevron)}
			/>
		</CollapsibleTrigger>
	);
}

/**
 * A shell command the agent runs, as one line: what it ran, how long it
 * took, and how it ended. It opens to the output, which streams in with
 * the newest line in view; a failure opens on its own.
 */
export function Terminal({
	command,
	duration,
	exitCode,
	onRetry,
	output = "",
	ref: forwardedRef,
	status,
	...rest
}: TerminalProps) {
	const elapsed = useElapsed();
	// null until the reader opens or closes it themselves.
	const [open, setOpen] = useState<boolean | null>(null);
	// The output opens once it starts, and a failure stays open.
	const attention =
		status === "error" || (status === "running" && output !== "");
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	return (
		<div
			{...rest}
			data-slot="terminal"
			data-status={status}
			ref={forwardedRef}
			{...props(toolCallStyles.root)}
		>
			<MotionScope>
				<Collapsible
					onOpenChange={setOpen}
					open={open === null ? attention : open}
					render={<div {...props(toolCallStyles.clip)} />}
				>
					<Line
						command={command}
						elapsed={elapsed}
						exitCode={exitCode}
						seconds={duration ?? elapsed.seconds}
						status={status}
						withOutput={output !== ""}
					/>
					{output === "" ? null : (
						<CollapsiblePanel>
							<div
								data-slot="terminal-details"
								{...props(toolCallStyles.panel, toolCallStyles.details)}
							>
								<CodeBlock>
									<CodeBlockHeader>
										<CodeBlockTitle>Output</CodeBlockTitle>
										<CodeBlockCopy code={plainOutput(output)} />
									</CodeBlockHeader>
									<Output output={output} />
								</CodeBlock>
							</div>
						</CollapsiblePanel>
					)}
					{status === "error" ? <Failure onRetry={onRetry} /> : null}
				</Collapsible>
			</MotionScope>
		</div>
	);
}
