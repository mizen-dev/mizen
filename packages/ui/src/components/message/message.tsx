"use client";

import { props } from "@stylexjs/stylex";
import {
	type ChangeEvent,
	type ComponentPropsWithRef,
	type FormEvent,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useRef,
	useState,
} from "react";
import type { Closed } from "../../closed";
import { CopyButton } from "../../copy-button";
import { IconAlertCircle, IconPencil, IconRefresh } from "../../icons";
import { Arrivals, MotionScope } from "../../motion";
import { typeRoles } from "../../styles/typography.styles";
import { Button } from "../button/button";
import { ComposerAttachment } from "../composer/composer-parts";
import { Lightbox } from "../lightbox/lightbox";
import { GalleryPopup } from "../lightbox/lightbox-gallery";
import { Textarea } from "../textarea/textarea";
import { messageStyles as styles } from "./message.styles";

type MessageBase = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "role"
> & {
	/** The sender's name, shown above the message. Use it in group chats. */
	author?: string;
	/** The sender's picture, such as an Avatar. */
	avatar?: ReactNode;
};

export interface MessageAttachment {
	/** The file itself. Images open it in a lightbox; other files in a new tab. */
	href?: string;
	name: string;
	/** An image URL; files without one show their type. */
	preview?: string;
}

export type MessageUserProps = MessageBase & {
	/** `end` for the person reading, `start` for others in a group chat. */
	align?: "end" | "start";
	/** Files the person sent, shown above as the composer showed them. */
	attachments?: readonly MessageAttachment[];
	/** What the person wrote. */
	children: string;
	/** The machine-readable send time for `time`, such as an ISO instant. */
	dateTime?: string;
	from: "user";
	/** Shows Edit, which opens the text in place; called with the new text. */
	onEdit?: (text: string) => void;
	/** Shows Retry beside "Not sent" when the message failed to send. */
	onRetry?: () => void;
	/** `failed` when the message did not reach the agent. */
	status?: "failed" | "sent";
	/** When it was sent, formatted for the reader, such as "4:20 PM". */
	time?: string;
};

export type MessageAgentProps = MessageBase & {
	/** The agent's parts in order, such as AgentThinking, ToolCallGroup, and StreamingText. */
	children: ReactNode;
	from: "agent";
};

export type MessageProps = MessageAgentProps | MessageUserProps;

function Author({ name }: { name: string | undefined }) {
	if (!name) {
		return null;
	}
	return (
		<span
			data-slot="message-author"
			{...props(typeRoles.caption, styles.author)}
		>
			{name}
		</span>
	);
}

function Frame({
	align,
	author,
	avatar,
	children,
	from,
	rest,
	status,
}: {
	align: "end" | "start";
	author: string | undefined;
	avatar: ReactNode;
	children: ReactNode;
	from: "agent" | "user";
	rest: Omit<MessageBase, "author" | "avatar">;
	status?: "failed" | "sent";
}) {
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	const end = align === "end";
	return (
		<div
			{...rest}
			data-align={align}
			data-from={from}
			data-slot="message"
			data-status={status}
			{...props(styles.root, end && styles.reverse)}
		>
			{avatar ? (
				<span data-slot="message-avatar" {...props(styles.avatar)}>
					{avatar}
				</span>
			) : null}
			<div
				{...props(
					styles.body,
					end ? styles.end : styles.start,
					from === "agent" && styles.agentBody
				)}
			>
				<Author name={author} />
				{children}
			</div>
		</div>
	);
}

// A file's place among the message's images, for the lightbox.
function imagesBefore(files: readonly MessageAttachment[], index: number) {
	return files.slice(0, index).filter((file) => file.preview).length;
}

function Tile({
	file,
	onOpen,
	position,
}: {
	file: MessageAttachment;
	onOpen: (position: number) => void;
	position: number;
}) {
	const open = useCallback(() => onOpen(position), [onOpen, position]);
	return (
		<ComposerAttachment
			href={file.preview ? undefined : file.href}
			name={file.name}
			onOpen={file.preview ? open : undefined}
			preview={file.preview}
		/>
	);
}

// The same tiles the composer showed before the message was sent. Images
// open together in a lightbox; other files open in a new tab.
function Attachments({
	align,
	attachments,
}: {
	align: "end" | "start";
	attachments: readonly MessageAttachment[] | undefined;
}) {
	const [index, setIndex] = useState<number | null>(null);
	const images = (attachments ?? []).flatMap((file) =>
		file.preview ? [{ alt: file.name, src: file.href ?? file.preview }] : []
	);
	const count = images.length;
	const step = useCallback(
		(delta: number) =>
			setIndex((current) => ((current ?? 0) + delta + count) % count),
		[count]
	);
	const close = useCallback((open: boolean) => {
		if (!open) {
			setIndex(null);
		}
	}, []);
	if (!attachments?.length) {
		return null;
	}
	return (
		<>
			<ul
				aria-label="Attachments"
				data-slot="message-attachments"
				{...props(styles.attachments, align === "end" && styles.attachmentsEnd)}
			>
				{attachments.map((file, key) => (
					<Tile
						file={file}
						// biome-ignore lint/suspicious/noArrayIndexKey: a sent message's files never change, and two may share a name.
						key={key}
						onOpen={setIndex}
						position={imagesBefore(attachments, key)}
					/>
				))}
			</ul>
			{count > 0 ? (
				<Lightbox onOpenChange={close} open={index !== null}>
					<GalleryPopup
						images={images}
						index={index ?? 0}
						onStep={step}
						title={images[index ?? 0]?.alt ?? "Attachment"}
					/>
				</Lightbox>
			) : null}
		</>
	);
}

// Long text folds after eight lines; the last one fades out above Show more.
// The button appears only once the text is measured to overflow.
function watchLength(text: HTMLParagraphElement | null) {
	const bubble = text?.parentElement;
	if (!(text && bubble) || typeof ResizeObserver === "undefined") {
		return;
	}
	const observer = new ResizeObserver(() => {
		// While open, the text is whole, so keep the last answer.
		if (!bubble.hasAttribute("data-expanded")) {
			bubble.toggleAttribute(
				"data-long",
				text.scrollHeight > text.clientHeight + 1
			);
		}
	});
	observer.observe(text);
	return () => observer.disconnect();
}

function Bubble({ text }: { text: string }) {
	const [expanded, setExpanded] = useState(false);
	const toggle = useCallback(() => setExpanded((open) => !open), []);
	return (
		<div
			data-expanded={expanded || undefined}
			data-slot="message-bubble"
			{...props(typeRoles.body, styles.bubble)}
		>
			<p
				data-slot="message-text"
				ref={watchLength}
				{...props(styles.text, !expanded && styles.folded)}
			>
				{text}
			</p>
			<button
				aria-expanded={expanded}
				onClick={toggle}
				type="button"
				{...props(typeRoles.ui, styles.more)}
			>
				{expanded ? "Show less" : "Show more"}
			</button>
		</div>
	);
}

// Stays in view with the bubble, so the person sees what did not go out.
function Failure({ onRetry }: { onRetry: (() => void) | undefined }) {
	return (
		<>
			<span
				data-slot="message-error"
				role="alert"
				{...props(typeRoles.caption, styles.error)}
			>
				<IconAlertCircle aria-hidden="true" size={14} />
				Not sent
			</span>
			{onRetry ? (
				<Button onClick={onRetry} size="xs" variant="ghost">
					<IconRefresh aria-hidden="true" size="1em" />
					Retry
				</Button>
			) : null}
		</>
	);
}

function Editor({
	onCancel,
	onSave,
	text,
}: {
	onCancel: () => void;
	onSave: (text: string) => void;
	text: string;
}) {
	const [draft, setDraft] = useState(text);
	const empty = draft.trim() === "";
	const change = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>) =>
			setDraft(event.currentTarget.value),
		[]
	);
	const save = useCallback(
		(event: FormEvent) => {
			event.preventDefault();
			if (!empty) {
				onSave(draft.trim());
			}
		},
		[draft, empty, onSave]
	);
	// Enter sends and Shift+Enter starts a new line, as in the composer.
	const keys = useCallback(
		(event: KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key === "Escape") {
				onCancel();
			} else if (
				event.key === "Enter" &&
				!event.shiftKey &&
				!event.nativeEvent.isComposing
			) {
				save(event);
			}
		},
		[onCancel, save]
	);
	return (
		<form data-slot="message-editor" onSubmit={save} {...props(styles.editor)}>
			<Textarea
				aria-label="Edit message"
				onChange={change}
				onKeyDown={keys}
				ref={focusAtEnd}
				rows={Math.min(8, draft.split("\n").length + 1)}
				value={draft}
			/>
			<div {...props(styles.editorActions)}>
				<Button onClick={onCancel} size="sm" variant="ghost">
					Cancel
				</Button>
				<Button disabled={empty} size="sm" type="submit">
					Send
				</Button>
			</div>
		</form>
	);
}

// Opens the editor with the caret after the text.
function focusAtEnd(node: HTMLTextAreaElement | null) {
	if (node) {
		node.focus();
		node.setSelectionRange(node.value.length, node.value.length);
	}
}

function Actions({
	align,
	dateTime,
	editRef,
	failed,
	onEdit,
	onRetry,
	text,
	time,
}: {
	align: "end" | "start";
	dateTime: string | undefined;
	editRef: (node: HTMLButtonElement | null) => void;
	failed: boolean;
	onEdit: (() => void) | undefined;
	onRetry: (() => void) | undefined;
	text: string;
	time: string | undefined;
}) {
	return (
		<div
			data-slot="message-actions"
			{...props(
				styles.actions,
				align === "end" ? styles.actionsEnd : styles.actionsStart,
				failed && styles.actionsShown
			)}
		>
			{failed ? <Failure onRetry={onRetry} /> : null}
			{time && !failed ? (
				<time dateTime={dateTime} {...props(typeRoles.caption, styles.time)}>
					{time}
				</time>
			) : null}
			<CopyButton label="Copy message" text={text} />
			{onEdit ? (
				<Button
					aria-label="Edit message"
					onClick={onEdit}
					ref={editRef}
					size="icon-xs"
					variant="ghost"
				>
					<IconPencil aria-hidden="true" size="1em" />
				</Button>
			) : null}
		</div>
	);
}

function UserMessage({
	align = "end",
	attachments,
	author,
	avatar,
	children,
	dateTime,
	from,
	onEdit,
	onRetry,
	status = "sent",
	time,
	...rest
}: MessageUserProps) {
	const [editing, setEditing] = useState(false);
	// Focus returns to Edit when the editor closes.
	const closing = useRef(false);
	const editRef = useCallback((node: HTMLButtonElement | null) => {
		if (node && closing.current) {
			closing.current = false;
			node.focus();
		}
	}, []);
	const open = useCallback(() => setEditing(true), []);
	const cancel = useCallback(() => {
		closing.current = true;
		setEditing(false);
	}, []);
	const save = useCallback(
		(text: string) => {
			cancel();
			if (text !== children) {
				onEdit?.(text);
			}
		},
		[cancel, children, onEdit]
	);
	return (
		<Frame
			align={align}
			author={author}
			avatar={avatar}
			from={from}
			rest={rest}
			status={status}
		>
			<Attachments align={align} attachments={attachments} />
			{editing ? (
				<Editor onCancel={cancel} onSave={save} text={children} />
			) : (
				<Bubble text={children} />
			)}
			{editing ? null : (
				<Actions
					align={align}
					dateTime={dateTime}
					editRef={editRef}
					failed={status === "failed"}
					onEdit={onEdit ? open : undefined}
					onRetry={onRetry}
					text={children}
					time={time}
				/>
			)}
		</Frame>
	);
}

/**
 * One turn in a conversation. The person's message is a bubble with Copy,
 * Edit, and the time under it; the agent's turn holds its parts in a column,
 * without a bubble.
 */
export function Message(messageProps: MessageProps) {
	if (messageProps.from === "user") {
		return <UserMessage {...messageProps} />;
	}
	const { author, avatar, children, from, ...rest } = messageProps;
	return (
		<Frame
			align="start"
			author={author}
			avatar={avatar}
			from={from}
			rest={rest}
		>
			{/* Parts added while the turn is on screen, such as a tool call
			    after the thinking, grow in; a turn from history shows still. */}
			<MotionScope>
				<Arrivals>{children}</Arrivals>
			</MotionScope>
		</Frame>
	);
}
