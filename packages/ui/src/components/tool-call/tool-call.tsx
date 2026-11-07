"use client";

import { props } from "@stylexjs/stylex";
import {
	type ComponentPropsWithRef,
	type ReactNode,
	type RefCallback,
	useState,
} from "react";
import type { Closed } from "../../closed";
import {
	IconAlertCircle,
	IconChevronDown,
	IconCircleCheck,
	IconRefresh,
	IconTool,
} from "../../icons";
import { MotionScope, Pop, Rise } from "../../motion";
import { typeRoles } from "../../styles/typography.styles";
import { formatShortSeconds, useElapsed } from "../../use-elapsed";
import { agentThinkingStyles } from "../agent-thinking/agent-thinking.styles";
import { Button } from "../button/button";
import {
	CodeBlock,
	CodeBlockContent,
	CodeBlockCopy,
	CodeBlockHeader,
	CodeBlockTitle,
} from "../code-block/code-block";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "../collapsible/collapsible";
import { Spinner } from "../spinner/spinner";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";
import { toolCallStyles as styles } from "./tool-call.styles";

/**
 * `running` while input streams or the tool works, `approval` while it waits
 * for a person, then `complete`, `error`, or `denied`.
 */
export type ToolCallState =
	| "approval"
	| "complete"
	| "denied"
	| "error"
	| "running";

export type ToolCallProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "role" | "title"
> & {
	/** Seconds the call took, for a call loaded from history. */
	duration?: number;
	/** Why the call failed, shown with Retry. */
	error?: string;
	/** A glyph for the tool. A wrench stands in. */
	icon?: ReactNode;
	/** The arguments the model passed, shown as JSON. */
	input?: unknown;
	/** The tool's id, such as `search_web`. */
	name: string;
	onApprove?: () => void;
	onDeny?: () => void;
	onRetry?: () => void;
	/** What the tool returned: text as is, anything else as JSON. */
	output?: unknown;
	status: ToolCallState;
	/**
	 * What the call does, such as "Searching the web for CRM pricing".
	 * Update it as the status changes, so a finished call reads in past tense.
	 */
	title?: string;
};

function toText(value: unknown) {
	return typeof value === "string" ? value : JSON.stringify(value, null, 2);
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
	status: ToolCallState;
}) {
	if (status === "running") {
		return (
			<span ref={markStart} {...props(styles.status)}>
				<Spinner aria-hidden="true" />
				<VisuallyHidden>Running</VisuallyHidden>
			</span>
		);
	}
	if (status === "approval") {
		return (
			<span {...props(typeRoles.ui, styles.status)}>
				<IconAlertCircle
					aria-hidden="true"
					size={16}
					{...props(styles.statusApproval)}
				/>
				Needs approval
			</span>
		);
	}
	if (status === "denied") {
		return <span {...props(typeRoles.ui, styles.status)}>Denied</span>;
	}
	const failed = status === "error";
	const Icon = failed ? IconAlertCircle : IconCircleCheck;
	return (
		<span ref={markEnd} {...props(typeRoles.ui, styles.status)}>
			<Icon
				aria-hidden="true"
				size={16}
				{...props(failed ? styles.statusError : styles.statusComplete)}
			/>
			{failed ? <span {...props(styles.errorText)}>Failed</span> : null}
			{seconds === undefined ? null : formatShortSeconds(seconds)}
			{/* The check is a picture; say what it means. */}
			{failed ? null : <VisuallyHidden>Done</VisuallyHidden>}
		</span>
	);
}

function Code({ title, value }: { title: string; value: unknown }) {
	const text = toText(value);
	return (
		<CodeBlock>
			<CodeBlockHeader>
				<CodeBlockTitle>{title}</CodeBlockTitle>
				<CodeBlockCopy code={text} />
			</CodeBlockHeader>
			<CodeBlockContent
				aria-label={title}
				language={typeof value === "string" ? undefined : "json"}
			>
				{text}
			</CodeBlockContent>
		</CodeBlock>
	);
}

function Notice({
	error,
	onApprove,
	onDeny,
	onRetry,
	status,
}: Pick<
	ToolCallProps,
	"error" | "onApprove" | "onDeny" | "onRetry" | "status"
>) {
	if (status === "error") {
		return (
			<div
				data-slot="tool-call-error"
				{...props(styles.notice, styles.noticeError, styles.noticeSlot)}
			>
				<p {...props(typeRoles.ui, styles.noticeText, styles.errorText)}>
					<IconAlertCircle aria-hidden="true" size={16} />
					{error ?? "The call failed."}
				</p>
				{onRetry ? (
					<Button onClick={onRetry} size="sm" variant="outline">
						<IconRefresh aria-hidden="true" size="1em" />
						Retry
					</Button>
				) : null}
			</div>
		);
	}
	if (status !== "approval") {
		return null;
	}
	return (
		<div
			data-slot="tool-call-approval"
			{...props(styles.notice, styles.noticeSlot)}
		>
			<p {...props(typeRoles.ui, styles.noticeText)}>
				This call needs your approval to run.
			</p>
			<div {...props(styles.noticeActions)}>
				{onDeny ? (
					<Button onClick={onDeny} size="sm" variant="outline">
						Deny
					</Button>
				) : null}
				{onApprove ? (
					<Button onClick={onApprove} size="sm">
						Approve
					</Button>
				) : null}
			</div>
		</div>
	);
}

// A changed title rises in; a running one shimmers like a thinking step.
function Title({
	status,
	title,
}: {
	status: ToolCallState;
	title: string | undefined;
}) {
	if (!title) {
		return null;
	}
	return (
		<Rise
			change={title}
			look={[styles.title, status === "running" && agentThinkingStyles.stage]}
		>
			{title}
		</Rise>
	);
}

// The arguments and result, folded away until the reader opens the call.
function Details({ input, output }: Pick<ToolCallProps, "input" | "output">) {
	if (input === undefined && output === undefined) {
		return null;
	}
	return (
		<CollapsiblePanel>
			<div
				data-slot="tool-call-details"
				{...props(styles.panel, styles.details)}
			>
				{input === undefined ? null : <Code title="Arguments" value={input} />}
				{output === undefined ? null : <Code title="Result" value={output} />}
			</div>
		</CollapsiblePanel>
	);
}

/**
 * One tool call as a quiet line: what it does, the tool, how long it took,
 * and how it went. It opens to the arguments and result; errors and
 * approvals open on their own, with Retry or Approve and Deny.
 */
export function ToolCall({
	duration,
	error,
	icon,
	input,
	name,
	onApprove,
	onDeny,
	onRetry,
	output,
	ref: forwardedRef,
	status,
	title,
	...rest
}: ToolCallProps) {
	const elapsed = useElapsed();
	// null until the reader opens or closes it themselves.
	const [open, setOpen] = useState<boolean | null>(null);
	// Calls that need the person open until they choose otherwise.
	const attention = status === "error" || status === "approval";
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	return (
		<div
			{...rest}
			data-slot="tool-call"
			data-status={status}
			ref={forwardedRef}
			{...props(styles.root)}
		>
			<MotionScope>
				<Collapsible
					onOpenChange={setOpen}
					open={open === null ? attention : open}
					render={<div {...props(styles.clip)} />}
				>
					<CollapsibleTrigger
						render={
							<button type="button" {...props(typeRoles.ui, styles.row)} />
						}
					>
						<span aria-hidden="true" {...props(styles.icon)}>
							{icon ?? <IconTool size={16} />}
						</span>
						<Title status={status} title={title} />
						<code {...props(typeRoles.mono, styles.name)}>{name}</code>
						<Pop change={status} look={styles.statusSlot}>
							<Status
								markEnd={elapsed.markEnd}
								markStart={elapsed.markStart}
								seconds={duration ?? elapsed.seconds}
								status={status}
							/>
						</Pop>
						<IconChevronDown
							aria-hidden="true"
							size={14}
							{...props(styles.chevron)}
						/>
					</CollapsibleTrigger>
					<Details input={input} output={output} />
					{/* Outside the fold, so what waits on the person stays in view. */}
					<Notice
						error={error}
						onApprove={onApprove}
						onDeny={onDeny}
						onRetry={onRetry}
						status={status}
					/>
				</Collapsible>
			</MotionScope>
		</div>
	);
}
