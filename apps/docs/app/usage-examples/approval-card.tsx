"use client";

import { ApprovalCard, type ApprovalCardStatus, Button } from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";
import { IconMail, IconTrash } from "@tabler/icons-react";
import { useCallback, useState } from "react";

const styles = create({
	frame: {
		display: "flex",
		flexDirection: "column",
		gap: "1rem",
		maxInlineSize: "34rem",
		minInlineSize: 0,
		width: "100%",
	},
	// Folded decisions are lines; they sit close, like Tool Call Group.
	lines: { gap: 2 },
	replay: { alignSelf: "flex-start" },
});

const email = [
	{ label: "To", value: "Product updates · 42 people" },
	{ label: "Subject", value: "What's new in October" },
	{ label: "Send", value: "Today, 9:00 AM" },
];

// The agent asks before it sends; Deny can tell it what to do instead.
export function SendEmailApproval() {
	const [status, setStatus] = useState<ApprovalCardStatus>("pending");
	const [note, setNote] = useState<string>();
	const approve = useCallback(() => setStatus("approved"), []);
	const deny = useCallback((decision: { note?: string }) => {
		setNote(decision.note);
		setStatus("denied");
	}, []);
	const replay = useCallback(() => {
		setNote(undefined);
		setStatus("pending");
	}, []);
	return (
		<div {...props(styles.frame)}>
			<ApprovalCard
				allowAlways
				description="It goes to everyone on the list and can't be unsent."
				details={email}
				icon={<IconMail size={16} />}
				note={note}
				onApprove={approve}
				onDeny={deny}
				status={status}
				title="Send the October newsletter"
			/>
			{status === "pending" ? null : (
				<span {...props(styles.replay)}>
					<Button onClick={replay} size="sm" variant="outline">
						Replay
					</Button>
				</span>
			)}
		</div>
	);
}

// Decisions from history: a rule approved one, and the person denied one.
export function AnsweredApprovals() {
	return (
		<div {...props(styles.frame, styles.lines)}>
			<ApprovalCard
				automatic
				description="Reading the calendar is allowed for this workspace."
				status="approved"
				title="Read your calendar for next week"
			/>
			<ApprovalCard
				details={[{ label: "Folder", value: "dist/" }]}
				icon={<IconTrash size={16} />}
				note="Keep dist; clean the cache folder instead."
				status="denied"
				title="Delete the build folder"
			/>
		</div>
	);
}
