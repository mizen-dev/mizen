"use client";

import {
	Button,
	ToolCall,
	ToolCallGroup,
	type ToolCallGroupCall,
} from "@mizen/ui";
import { create, props } from "@stylexjs/stylex";
import {
	IconFileText,
	IconGitPullRequest,
	IconSearch,
} from "@tabler/icons-react";
import { useCallback, useRef, useState } from "react";

const styles = create({
	frame: {
		display: "flex",
		flexDirection: "column",
		gap: "1rem",
		maxInlineSize: "34rem",
		minBlockSize: "16rem",
		minInlineSize: 0,
		width: "100%",
	},
	replay: { alignSelf: "flex-start" },
});

const TICK_MS = 120;
// When each call settles, in ticks; the last one then waits for approval.
const SEARCHED_AT = 6;
const FETCHED_AT = 12;
const APPROVAL_MS = 1400;

type Decision = "approved" | "denied" | "done" | null;

const search = {
	icon: <IconSearch size={16} />,
	id: "call-1",
	input: { query: "container queries browser support" },
	name: "search_docs",
	output: {
		results: [
			"developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries",
			"web.dev/blog/cq-stable",
		],
	},
};
const fetchPage = {
	icon: <IconFileText size={16} />,
	id: "call-2",
	input: { url: "https://web.dev/blog/cq-stable" },
	name: "fetch_page",
	output: "Container queries land in stable browsers",
};
const createIssue = {
	icon: <IconGitPullRequest size={16} />,
	id: "call-3",
	input: {
		labels: ["css"],
		title: "Replace media queries in Card with container queries",
	},
	name: "create_issue",
};

// Each call's state follows from the tick and the person's decision.
function callsAt(
	tick: number,
	decision: Decision,
	decide: (next: "approved" | "denied") => void
): ToolCallGroupCall[] {
	const calls: ToolCallGroupCall[] = [
		tick < SEARCHED_AT
			? { ...search, status: "running", title: "Searching the docs" }
			: { ...search, status: "complete", title: "Searched the docs" },
	];
	if (tick >= SEARCHED_AT) {
		calls.push(
			tick < FETCHED_AT
				? { ...fetchPage, status: "running", title: "Reading web.dev" }
				: { ...fetchPage, status: "complete", title: "Read web.dev" }
		);
	}
	if (tick >= FETCHED_AT) {
		calls.push(issueAt(decision, decide));
	}
	return calls;
}

function issueAt(
	decision: Decision,
	decide: (next: "approved" | "denied") => void
): ToolCallGroupCall {
	if (decision === "approved") {
		return { ...createIssue, status: "running", title: "Creating an issue" };
	}
	if (decision === "done") {
		return {
			...createIssue,
			output: {
				number: 482,
				url: "https://github.example/acme/site/issues/482",
			},
			status: "complete",
			title: "Created an issue",
		};
	}
	if (decision === "denied") {
		return { ...createIssue, status: "denied", title: "Create an issue" };
	}
	return {
		...createIssue,
		onApprove: () => decide("approved"),
		onDeny: () => decide("denied"),
		status: "approval",
		title: "Create an issue",
	};
}

export function AgentToolCalls() {
	const [tick, setTick] = useState(0);
	// Each replay is a new run, so a late timer from an old run is ignored.
	const [decision, setDecision] = useState<{ run: number; value: Decision }>({
		run: 0,
		value: null,
	});
	const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
	const play = useCallback(() => {
		clearInterval(timer.current);
		setTick(0);
		setDecision((previous) => ({ run: previous.run + 1, value: null }));
		let current = 0;
		timer.current = setInterval(() => {
			current += 1;
			setTick(current);
			if (current >= FETCHED_AT) {
				clearInterval(timer.current);
			}
		}, TICK_MS);
	}, []);
	// Approving runs the call; it finishes a moment later.
	const decide = (next: "approved" | "denied") => {
		const { run } = decision;
		setDecision({ run, value: next });
		if (next === "approved") {
			setTimeout(() => {
				setDecision((current) =>
					current.run === run ? { run, value: "done" } : current
				);
			}, APPROVAL_MS);
		}
	};
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

	return (
		<div ref={start} {...props(styles.frame)}>
			<ToolCallGroup calls={callsAt(tick, decision.value, decide)} />
			<span {...props(styles.replay)}>
				<Button onClick={play} size="sm" variant="outline">
					Replay
				</Button>
			</span>
		</div>
	);
}

// A call that failed: its error shows with Retry, and retrying runs it again.
export function FailedToolCall() {
	const [attempt, setAttempt] = useState<"error" | "running" | "complete">(
		"error"
	);
	const retry = useCallback(() => {
		setAttempt("running");
		setTimeout(() => setAttempt("complete"), APPROVAL_MS);
	}, []);
	return (
		<div {...props(styles.frame)}>
			<ToolCall
				duration={attempt === "error" ? 8 : undefined}
				error="The request timed out after 8s. web.dev did not respond."
				icon={<IconFileText size={16} />}
				input={{ timeoutMs: 8000, url: "https://web.dev/blog/cq-stable" }}
				name="fetch_page"
				onRetry={retry}
				output={attempt === "complete" ? fetchPage.output : undefined}
				status={attempt}
				title={attempt === "complete" ? "Read web.dev" : "Reading web.dev"}
			/>
		</div>
	);
}
