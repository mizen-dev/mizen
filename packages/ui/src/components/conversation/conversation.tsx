"use client";

import { props } from "@stylexjs/stylex";
import {
	Children,
	type ComponentPropsWithRef,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";
import type { Closed } from "../../closed";
import { typeRoles } from "../../styles/typography.styles";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerNavigation,
	MessageScrollerViewport,
} from "../message-scroller/message-scroller";
import { conversationStyles as styles } from "./conversation.styles";

type Part = Omit<Closed<ComponentPropsWithRef<"div">>, "data-slot">;

export type ConversationProps = Part & { children: ReactNode };

/**
 * The thread with the agent: turns that scroll, an empty state before the
 * first one, and the composer docked under them. It fills a parent with a
 * bounded height.
 */
export function Conversation({ children, ...rest }: ConversationProps) {
	return <MessageScroller {...rest}>{children}</MessageScroller>;
}

export interface ConversationEmptyStateProps {
	/** Starters, such as Suggestions, under the words. */
	children?: ReactNode;
	description?: ReactNode;
	title: ReactNode;
}

/** The start screen, shown in place of the thread before the first turn. */
export function ConversationEmptyState({
	children,
	description,
	title,
}: ConversationEmptyStateProps) {
	return (
		<div data-slot="conversation-empty-state" {...props(styles.emptyState)}>
			<div {...props(styles.emptyText)}>
				<h2 {...props(typeRoles.subheading, styles.emptyTitle)}>{title}</h2>
				{description ? (
					<p {...props(typeRoles.body, styles.emptyDescription)}>
						{description}
					</p>
				) : null}
			</div>
			{children}
		</div>
	);
}

// React prefixes keys from Children.toArray; the id is the key as written.
const KEY_PREFIX = /^\.\$/;

function idOf(turn: ReactElement) {
	return String(turn.key).replace(KEY_PREFIX, "");
}

function split(children: ReactNode) {
	const empty: ReactNode[] = [];
	const turns: ReactElement[] = [];
	for (const child of Children.toArray(children)) {
		if (isValidElement(child) && child.type === ConversationEmptyState) {
			empty.push(child);
		} else if (isValidElement(child)) {
			turns.push(child);
		}
	}
	return { empty, turns };
}

export interface ConversationContentProps {
	"aria-label"?: string;
	/** True while a reply streams, so assistive tech waits for it. */
	busy?: boolean;
	/**
	 * The turns, each with a key that is its id, and an optional
	 * ConversationEmptyState. A turn holding the person's own Message
	 * settles near the top when sent, and the rail lists it.
	 */
	children: ReactNode;
	/** Adds a MessageScrollerNavigation rail, one tick per turn the person sent. */
	navigation?: boolean;
}

/** The scrolling thread, with the jump button floating over its end. */
export function ConversationContent({
	"aria-label": ariaLabel = "Conversation",
	busy = false,
	children,
	navigation = false,
}: ConversationContentProps) {
	const { empty, turns } = split(children);
	return (
		<div data-slot="conversation-content" {...props(styles.body)}>
			<MessageScrollerViewport aria-label={ariaLabel}>
				<div {...props(styles.column, navigation && styles.columnWithRail)}>
					{turns.length === 0 ? empty : null}
					<MessageScrollerContent busy={busy}>
						{turns.map((turn) => (
							<MessageScrollerItem
								key={turn.key}
								messageId={idOf(turn)}
								scrollAnchor="auto"
							>
								{turn}
							</MessageScrollerItem>
						))}
					</MessageScrollerContent>
				</div>
			</MessageScrollerViewport>
			{navigation ? <MessageScrollerNavigation /> : null}
			<MessageScrollerButton />
		</div>
	);
}

export type ConversationFooterProps = Part & { children: ReactNode };

/** Holds the composer under the thread, in the thread's column. */
export function ConversationFooter({
	children,
	...rest
}: ConversationFooterProps) {
	return (
		<div {...rest} data-slot="conversation-footer" {...props(styles.footer)}>
			{children}
		</div>
	);
}
