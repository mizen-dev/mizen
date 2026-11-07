"use client";

import { props } from "@stylexjs/stylex";
import { type ComponentPropsWithRef, type RefCallback, useState } from "react";
import type { Closed } from "../../closed";
import { IconChevronDown, IconTool } from "../../icons";
import { Arrivals, MotionScope, Pop, Rise } from "../../motion";
import { typeRoles } from "../../styles/typography.styles";
import { formatShortSeconds, useElapsed } from "../../use-elapsed";
import { agentThinkingStyles } from "../agent-thinking/agent-thinking.styles";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "../collapsible/collapsible";
import { Spinner } from "../spinner/spinner";
import { ToolCall, type ToolCallProps } from "./tool-call";
import { toolCallStyles as styles } from "./tool-call.styles";

export type ToolCallGroupCall = Omit<ToolCallProps, "ref"> & {
	/** A stable id for the call, such as the SDK's toolCallId. */
	id: string;
};

export type ToolCallGroupProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "role"
> & {
	calls: readonly ToolCallGroupCall[];
	/** Seconds the calls took together, for a turn loaded from history. */
	duration?: number;
};

function Summary({
	active,
	calls,
	markEnd,
	markStart,
	seconds,
}: {
	active: boolean;
	calls: readonly ToolCallGroupCall[];
	markEnd: RefCallback<HTMLElement>;
	markStart: RefCallback<HTMLElement>;
	seconds: number | undefined;
}) {
	if (active) {
		return (
			<span ref={markStart} {...props(agentThinkingStyles.stage)}>
				Using tools…
			</span>
		);
	}
	const failed = calls.filter((call) => call.status === "error").length;
	return (
		<span ref={markEnd}>
			Used {calls.length} {calls.length === 1 ? "tool" : "tools"}
			{failed > 0 ? (
				<span {...props(styles.groupFailed)}> · {failed} failed</span>
			) : null}
			{seconds === undefined ? null : (
				<span {...props(styles.groupMeta)}>
					{" "}
					· {formatShortSeconds(seconds)}
				</span>
			)}
		</span>
	);
}

/**
 * Several tool calls under one header: "Using tools…" while any of them
 * works or waits, then folded into "Used 3 tools · 1 failed · 2.7s".
 */
export function ToolCallGroup({
	calls,
	duration,
	ref: forwardedRef,
	...rest
}: ToolCallGroupProps) {
	const elapsed = useElapsed();
	const active = calls.some(
		(call) => call.status === "running" || call.status === "approval"
	);
	// null until the reader opens or closes it themselves. Until then it
	// stays open while calls work and folds into the summary once they finish.
	const [open, setOpen] = useState<boolean | null>(null);
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	return (
		<div
			{...rest}
			data-slot="tool-call-group"
			data-status={active ? "running" : "complete"}
			ref={forwardedRef}
			{...props(styles.root)}
		>
			<MotionScope>
				<Collapsible
					onOpenChange={setOpen}
					open={open === null ? active : open}
					render={<div {...props(styles.clip)} />}
				>
					<CollapsibleTrigger
						render={
							<button type="button" {...props(typeRoles.ui, styles.row)} />
						}
					>
						{/* The icon keeps its place, so the summary does not shift. */}
						<Pop change={active ? "active" : "done"} look={styles.icon}>
							{active ? (
								<Spinner aria-hidden="true" />
							) : (
								<IconTool aria-hidden="true" size={16} />
							)}
						</Pop>
						<Rise change={active ? "active" : "done"} look={styles.title}>
							<Summary
								active={active}
								calls={calls}
								markEnd={elapsed.markEnd}
								markStart={elapsed.markStart}
								seconds={duration ?? elapsed.seconds}
							/>
						</Rise>
						<IconChevronDown
							aria-hidden="true"
							size={14}
							{...props(styles.chevron)}
						/>
					</CollapsibleTrigger>
					<CollapsiblePanel>
						<div {...props(styles.panel, styles.groupCalls)}>
							{/* Calls added while the group is on screen grow in. */}
							<Arrivals>
								{calls.map(({ id, ...call }) => (
									<ToolCall key={id} {...call} />
								))}
							</Arrivals>
						</div>
					</CollapsiblePanel>
				</Collapsible>
			</MotionScope>
		</div>
	);
}
