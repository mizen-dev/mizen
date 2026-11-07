"use client";

import { props } from "@stylexjs/stylex";
import {
	type ChangeEvent,
	type ComponentPropsWithRef,
	type FormEvent,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import type { Closed } from "../../closed";
import {
	IconChevronDown,
	IconCircleCheck,
	IconCircleX,
	IconShieldCheck,
} from "../../icons";
import { typeRoles } from "../../styles/typography.styles";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "../collapsible/collapsible";
import { Field, FieldLabel } from "../field/field";
import { Input } from "../input/input";
import { toolCallStyles } from "../tool-call/tool-call.styles";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";
import { approvalCardStyles as styles } from "./approval-card.styles";

/** `pending` while it waits for the person; then the decision. */
export type ApprovalCardStatus = "approved" | "denied" | "pending";

export interface ApprovalCardDetail {
	label: string;
	value: ReactNode;
}

export type ApprovalCardProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "role" | "title"
> & {
	/** Shows "Always allow this action"; onApprove receives the choice. */
	allowAlways?: boolean;
	/** The decision came from a rule, not from the person. */
	automatic?: boolean;
	/** Why the agent asks, such as the AI SDK's requestReason. */
	description?: string;
	/** What will happen, such as To, Subject, and Send at. */
	details?: readonly ApprovalCardDetail[];
	/** A glyph for the action. A shield stands in. */
	icon?: ReactNode;
	/** The note that came with the decision, for a card from history. */
	note?: string;
	onApprove?: (decision: { always: boolean }) => void;
	/** Called with the person's note for the agent, if they wrote one. */
	onDeny?: (decision: { note?: string }) => void;
	status: ApprovalCardStatus;
	/** The action, such as "Send campaign email". */
	title: string;
};

function Details({ details }: { details: readonly ApprovalCardDetail[] }) {
	if (details.length === 0) {
		return null;
	}
	return (
		<dl data-slot="approval-card-details" {...props(styles.details)}>
			{details.map(({ label, value }) => (
				<div key={label} {...props(styles.detailRow)}>
					<dt {...props(typeRoles.caption, styles.detailLabel)}>{label}</dt>
					<dd {...props(typeRoles.ui, styles.detailValue)}>{value}</dd>
				</div>
			))}
		</dl>
	);
}

// Denying asks what to do instead; the note reaches the agent.
function DenyNote({
	onBack,
	onDeny,
}: {
	onBack: () => void;
	onDeny: (note: string) => void;
}) {
	const id = useId();
	const [note, setNote] = useState("");
	const change = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			setNote(event.currentTarget.value),
		[]
	);
	const submit = useCallback(
		(event: FormEvent) => {
			event.preventDefault();
			onDeny(note.trim());
		},
		[note, onDeny]
	);
	const keys = useCallback(
		(event: KeyboardEvent<HTMLInputElement>) => {
			if (event.key === "Escape") {
				onBack();
			}
		},
		[onBack]
	);
	return (
		<form
			data-slot="approval-card-note"
			onSubmit={submit}
			{...props(styles.note)}
		>
			<label htmlFor={id} {...props(typeRoles.caption, styles.noteLabel)}>
				What should the agent do instead? Optional.
			</label>
			<Input
				autoFocus
				id={id}
				onChange={change}
				onKeyDown={keys}
				size="sm"
				value={note}
			/>
			<div {...props(styles.actions)}>
				<Button onClick={onBack} size="sm" type="button" variant="ghost">
					Back
				</Button>
				<Button size="sm" type="submit" variant="outline">
					Deny
				</Button>
			</div>
		</form>
	);
}

function Pending({
	allowAlways,
	description,
	details,
	icon,
	onApprove,
	onDeny,
	onDecide,
	title,
	titleId,
}: Pick<
	ApprovalCardProps,
	"allowAlways" | "description" | "icon" | "onApprove" | "onDeny" | "title"
> & {
	details: readonly ApprovalCardDetail[];
	onDecide: () => void;
	titleId: string;
}) {
	const [always, setAlways] = useState(false);
	const [denying, setDenying] = useState(false);
	const approve = useCallback(() => {
		onDecide();
		onApprove?.({ always });
	}, [always, onApprove, onDecide]);
	const deny = useCallback(
		(note: string) => {
			onDecide();
			onDeny?.(note ? { note } : {});
		},
		[onDecide, onDeny]
	);
	const startDeny = useCallback(() => setDenying(true), []);
	const back = useCallback(() => setDenying(false), []);
	return (
		<fieldset aria-labelledby={titleId} {...props(styles.card)}>
			<div {...props(styles.head)}>
				<p {...props(typeRoles.caption, styles.kind)}>
					<span aria-hidden="true" {...props(styles.kindIcon)}>
						{icon ?? <IconShieldCheck size={16} />}
					</span>
					Needs your approval
				</p>
				<p id={titleId} {...props(typeRoles.subheading, styles.title)}>
					{title}
				</p>
				{description ? (
					<p {...props(typeRoles.ui, styles.description)}>{description}</p>
				) : null}
			</div>
			<Details details={details} />
			{denying ? (
				<DenyNote onBack={back} onDeny={deny} />
			) : (
				<div {...props(styles.footer)}>
					{allowAlways ? (
						<Field>
							<FieldLabel>
								<Checkbox
									checked={always}
									onCheckedChange={setAlways}
									size="sm"
								/>
								Always allow this action
							</FieldLabel>
						</Field>
					) : null}
					<div {...props(styles.actions)}>
						{onDeny ? (
							<Button onClick={startDeny} size="sm" variant="outline">
								Deny
							</Button>
						) : null}
						{onApprove ? (
							<Button onClick={approve} size="sm">
								Approve
							</Button>
						) : null}
					</div>
				</div>
			)}
		</fieldset>
	);
}

function verdictOf(status: ApprovalCardStatus, automatic: boolean) {
	const verdict = status === "approved" ? "Approved" : "Denied";
	return automatic ? `${verdict} automatically` : verdict;
}

// Once decided, the card folds into one line that opens to what was asked.
function Resolved({
	automatic,
	description,
	details,
	focusRef,
	note,
	status,
	title,
}: Pick<ApprovalCardProps, "description" | "note" | "title"> & {
	automatic: boolean;
	details: readonly ApprovalCardDetail[];
	focusRef: (node: HTMLButtonElement | null) => void;
	status: "approved" | "denied";
}) {
	const approved = status === "approved";
	const Icon = approved ? IconCircleCheck : IconCircleX;
	return (
		<div {...props(toolCallStyles.root)}>
			<Collapsible render={<div {...props(toolCallStyles.clip)} />}>
				<CollapsibleTrigger
					ref={focusRef}
					render={
						<button
							type="button"
							{...props(typeRoles.ui, toolCallStyles.row)}
						/>
					}
				>
					<span
						aria-hidden="true"
						{...props(
							toolCallStyles.icon,
							approved ? styles.resolvedApproved : styles.resolvedDenied
						)}
					>
						<Icon size={16} />
					</span>
					<span {...props(toolCallStyles.title)}>
						{verdictOf(status, automatic)}{" "}
						<span {...props(toolCallStyles.name)}>· {title}</span>
					</span>
					<IconChevronDown
						aria-hidden="true"
						size={14}
						{...props(toolCallStyles.chevron)}
					/>
				</CollapsibleTrigger>
				<CollapsiblePanel>
					<div
						data-slot="approval-card-record"
						{...props(toolCallStyles.panel, toolCallStyles.details)}
					>
						{description ? (
							<p {...props(typeRoles.caption, styles.description)}>
								{description}
							</p>
						) : null}
						<Details details={details} />
						{note ? (
							<p {...props(typeRoles.caption, styles.description)}>
								Note: {note}
							</p>
						) : null}
					</div>
				</CollapsiblePanel>
			</Collapsible>
		</div>
	);
}

/**
 * The agent asks before it acts: what it will do, why, and the details,
 * with Deny and Approve. Denying can tell the agent what to do instead.
 * Once decided, the card folds into one line.
 */
export function ApprovalCard({
	allowAlways = false,
	automatic = false,
	description,
	details = [],
	icon,
	note,
	onApprove,
	onDeny,
	ref: forwardedRef,
	status,
	title,
	...rest
}: ApprovalCardProps) {
	const titleId = useId();
	// Focus follows a decision made here to the folded line.
	const decidedHere = useRef(false);
	const onDecide = useCallback(() => {
		decidedHere.current = true;
	}, []);
	const focusRef = useCallback((node: HTMLButtonElement | null) => {
		if (node && decidedHere.current) {
			decidedHere.current = false;
			node.focus();
		}
	}, []);
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	const pending = status === "pending";
	return (
		<div
			{...rest}
			data-slot="approval-card"
			data-status={status}
			ref={forwardedRef}
		>
			{/* Always present, so the decision is announced when it lands. */}
			<span
				aria-live="polite"
				data-slot="approval-card-status"
				role="status"
				{...props(visuallyHiddenStyles.root)}
			>
				{pending ? "" : `${verdictOf(status, automatic)}: ${title}`}
			</span>
			{pending ? (
				<Pending
					allowAlways={allowAlways}
					description={description}
					details={details}
					icon={icon}
					onApprove={onApprove}
					onDecide={onDecide}
					onDeny={onDeny}
					title={title}
					titleId={titleId}
				/>
			) : (
				<Resolved
					automatic={automatic}
					description={description}
					details={details}
					focusRef={focusRef}
					note={note}
					status={status}
					title={title}
				/>
			)}
		</div>
	);
}
