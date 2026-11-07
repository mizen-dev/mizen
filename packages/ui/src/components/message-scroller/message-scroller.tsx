"use client";

import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { props } from "@stylexjs/stylex";
import { domAnimation, LazyMotion, MotionConfig, m } from "motion/react";
import {
	type ComponentPropsWithRef,
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
	useSyncExternalStore,
} from "react";
import type { Closed } from "../../closed";
import { IconArrowDown } from "../../icons";
import { buttonStyles } from "../button/button.styles";
import { scrollAreaStyles } from "../scroll-area/scroll-area.styles";
import {
	Tooltip,
	TooltipCreateHandle,
	TooltipPrimitive,
	TooltipTrigger,
} from "../tooltip/tooltip";
import { tooltipStyles } from "../tooltip/tooltip.styles";
import { messageScrollerStyles as styles } from "./message-scroller.styles";
import {
	type MessageScrollerAnchor,
	type MessageScrollerSnapshot,
	MessageScrollerStore,
} from "./message-scroller-store";

export type {
	MessageScrollerAnchor,
	MessageScrollerSnapshot,
} from "./message-scroller-store";

const StoreContext = createContext<MessageScrollerStore | null>(null);

function useStore() {
	const store = useContext(StoreContext);
	if (!store) {
		throw new Error("MessageScroller parts must sit inside MessageScroller.");
	}
	return store;
}

/** The scroller's state: whether the view is at the end, and the turns. */
export function useMessageScrollerState(): MessageScrollerSnapshot {
	const store = useStore();
	return useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot
	);
}

/** Commands for custom controls: jump to the end, or to a message. */
export function useMessageScroller() {
	const store = useStore();
	return {
		scrollToEnd: store.scrollToEnd,
		scrollToMessage: store.scrollToMessage,
	};
}

type Part<Element extends "div" | "button"> = Omit<
	Closed<ComponentPropsWithRef<Element>>,
	"data-slot"
>;

export type MessageScrollerProps = Part<"div"> & { children: ReactNode };

/**
 * A scrolling transcript. It opens at the end and follows new content while
 * the reader is there; a turn the person sends settles near the top with the
 * reply growing under it; and the reader's place holds when older messages
 * load above. It fills a parent with a bounded height.
 */
export function MessageScroller({ children, ...rest }: MessageScrollerProps) {
	const [store] = useState(() => new MessageScrollerStore());
	return (
		<StoreContext.Provider value={store}>
			<LazyMotion features={domAnimation} strict>
				<MotionConfig reducedMotion="user">
					<div {...rest} data-slot="message-scroller" {...props(styles.root)}>
						{children}
					</div>
				</MotionConfig>
			</LazyMotion>
		</StoreContext.Provider>
	);
}

export type MessageScrollerViewportProps = Part<"div"> & {
	/** Names the scrolling region. */
	"aria-label"?: string;
	children: ReactNode;
};

// Base UI sizes the content to fit its widest row; a transcript wraps
// instead, so its minimum width is cleared as Scroll Area does.
const scrolled = props(scrollAreaStyles.content, styles.scrollContent);
const contentProps = {
	...scrolled,
	style: { ...scrolled.style, minWidth: 0 },
};

/**
 * The scrolling region, a Scroll Area: a thin thumb shows on hover and
 * while scrolling, and the edges fade where more waits. It is focusable,
 * so the keyboard can scroll it.
 */
export function MessageScrollerViewport({
	"aria-label": ariaLabel = "Messages",
	children,
	...rest
}: MessageScrollerViewportProps) {
	const { attachViewport } = useStore();
	return (
		<BaseScrollArea.Root {...props(scrollAreaStyles.root, styles.area)}>
			<BaseScrollArea.Viewport
				{...rest}
				aria-label={ariaLabel}
				data-slot="message-scroller-viewport"
				ref={attachViewport}
				role="region"
				tabIndex={0}
				{...props(
					scrollAreaStyles.viewport,
					scrollAreaStyles.viewportFade,
					styles.viewport
				)}
			>
				<BaseScrollArea.Content {...contentProps}>
					{children}
				</BaseScrollArea.Content>
			</BaseScrollArea.Viewport>
			<BaseScrollArea.Scrollbar
				orientation="vertical"
				{...props(
					scrollAreaStyles.scrollbar,
					scrollAreaStyles.scrollbarVertical
				)}
			>
				<BaseScrollArea.Thumb {...props(scrollAreaStyles.thumb)} />
			</BaseScrollArea.Scrollbar>
		</BaseScrollArea.Root>
	);
}

export type MessageScrollerContentProps = Part<"div"> & {
	/** True while a reply streams, so assistive tech waits for it. */
	busy?: boolean;
	children: ReactNode;
};

/**
 * The transcript itself, a live log that announces new turns. Every direct
 * child is a MessageScrollerItem.
 */
export function MessageScrollerContent({
	busy = false,
	children,
	...rest
}: MessageScrollerContentProps) {
	const { attachLog, attachSpacer } = useStore();
	return (
		<>
			<div
				{...rest}
				aria-busy={busy || undefined}
				aria-relevant="additions"
				data-slot="message-scroller-content"
				ref={attachLog}
				role="log"
				{...props(styles.content)}
			>
				{children}
			</div>
			{/* Room under a short reply, so its turn can sit near the top. */}
			<div aria-hidden="true" ref={attachSpacer} />
		</>
	);
}

export type MessageScrollerItemProps = Part<"div"> & {
	children: ReactNode;
	/** A stable id, for jumping to it and for holding the reader's place. */
	messageId: string;
	/**
	 * Marks a turn boundary, usually the person's message: once sent, it
	 * settles near the top, and a navigation rail lists it. `auto` anchors
	 * the item when it holds the reader's own Message (from the user,
	 * aligned to the end).
	 */
	scrollAnchor?: boolean | "auto";
};

// A new row fades in and rises 8px: duration.overlayEnter with
// easing.expoOut. Rows from the first load stay still.
const ARRIVAL = {
	animate: { opacity: 1, y: 0 },
	initial: { opacity: 0, y: 8 },
	transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
} as const;

export function MessageScrollerItem({
	children,
	messageId,
	scrollAnchor = false,
	...rest
}: MessageScrollerItemProps) {
	const { isLive } = useStore();
	// Decided once, when the row first renders.
	const [arriving] = useState(isLive);
	return (
		<div
			{...rest}
			data-message-id={messageId}
			data-scroll-anchor={String(scrollAnchor)}
			data-slot="message-scroller-item"
		>
			<m.div
				animate={ARRIVAL.animate}
				initial={arriving ? ARRIVAL.initial : false}
				transition={ARRIVAL.transition}
			>
				{children}
			</m.div>
		</div>
	);
}

export type MessageScrollerButtonProps = Omit<
	Part<"button">,
	"children" | "onClick" | "type"
> & {
	/** Read by screen readers; the button shows an arrow. */
	"aria-label"?: string;
};

/**
 * A round arrow that jumps to the newest content. It fades in when there is
 * something below the view and leaves the tab order when there is not.
 */
export function MessageScrollerButton({
	"aria-label": ariaLabel = "Jump to latest",
	...rest
}: MessageScrollerButtonProps) {
	const store = useStore();
	const { atEnd } = useMessageScrollerState();
	const jump = useCallback(() => store.scrollToEnd(), [store]);
	return (
		<button
			{...rest}
			aria-label={ariaLabel}
			data-active={atEnd ? undefined : ""}
			data-slot="message-scroller-button"
			inert={atEnd}
			onClick={jump}
			type="button"
			{...props(
				buttonStyles.base,
				buttonStyles["icon-sm"],
				buttonStyles.press,
				buttonStyles.interactionGhost,
				styles.button
			)}
		>
			<IconArrowDown aria-hidden="true" size={16} />
		</button>
	);
}

// How far a tick is from the one in focus, for its length: the focused
// tick is full length and its neighbors step down, like a dock.
function nearness(index: number, focus: number) {
	return String(Math.min(Math.abs(index - focus), 3));
}

type Preview = MessageScrollerAnchor;

function NavigationTick({
	anchor,
	current,
	handle,
	index,
	near,
	onFocusTick,
	onLeaveTick,
	total,
}: {
	anchor: MessageScrollerAnchor;
	current: boolean;
	handle: ReturnType<typeof TooltipCreateHandle<Preview>>;
	index: number;
	near: string;
	onFocusTick: (index: number) => void;
	onLeaveTick: () => void;
	total: number;
}) {
	const { scrollToMessage } = useStore();
	const jump = useCallback(
		() => scrollToMessage(anchor.id),
		[anchor.id, scrollToMessage]
	);
	const focusTick = useCallback(() => onFocusTick(index), [index, onFocusTick]);
	return (
		<li>
			<TooltipTrigger
				delay={0}
				handle={handle}
				payload={anchor}
				render={
					<button
						aria-current={current ? "true" : undefined}
						aria-label={`Turn ${index + 1} of ${total}: ${anchor.label}`}
						data-near={near}
						onBlur={onLeaveTick}
						onClick={jump}
						onFocus={focusTick}
						onPointerEnter={focusTick}
						onPointerLeave={onLeaveTick}
						type="button"
						{...props(styles.tick)}
					/>
				}
			>
				<span aria-hidden="true" {...props(styles.tickLine)} />
			</TooltipTrigger>
		</li>
	);
}

// A tooltip surface that shows and moves at once: the rail's ticks carry
// the motion, so the preview only follows them.
function NavigationPreview({ payload }: { payload: Preview | undefined }) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Positioner
				side="left"
				sideOffset={8}
				{...props(tooltipStyles.positioner, styles.still)}
			>
				<TooltipPrimitive.Popup
					data-slot="tooltip-popup"
					{...props(tooltipStyles.popup, styles.still)}
				>
					{payload ? (
						<span {...props(styles.preview)}>
							<span {...props(styles.previewTitle)}>{payload.label}</span>
							{payload.reply ? (
								<span {...props(styles.previewReply)}>{payload.reply}</span>
							) : null}
						</span>
					) : null}
				</TooltipPrimitive.Popup>
			</TooltipPrimitive.Positioner>
		</TooltipPrimitive.Portal>
	);
}

export interface MessageScrollerNavigationProps {
	/** Names the rail for assistive tech. */
	"aria-label"?: string;
}

/**
 * A rail of ticks along the end edge, one per turn boundary. Hover or focus
 * a tick to preview the turn and the start of its reply; press it to jump
 * there. It shows from two turns, and floats over the nearest positioned
 * box, so keep the thread's end edge clear of it.
 */
export function MessageScrollerNavigation({
	"aria-label": ariaLabel = "Turns",
}: MessageScrollerNavigationProps) {
	const { anchors, current } = useMessageScrollerState();
	const [handle] = useState(() => TooltipCreateHandle<Preview>());
	const [pointed, setPointed] = useState<number | null>(null);
	const leave = useCallback(() => setPointed(null), []);
	if (anchors.length < 2) {
		return null;
	}
	const focus =
		pointed ??
		Math.max(
			0,
			anchors.findIndex((anchor) => anchor.id === current)
		);
	return (
		<nav
			aria-label={ariaLabel}
			data-slot="message-scroller-navigation"
			{...props(styles.navigation)}
		>
			<ol {...props(styles.ticks)}>
				{anchors.map((anchor, index) => (
					<NavigationTick
						anchor={anchor}
						current={anchor.id === current}
						handle={handle}
						index={index}
						key={anchor.id}
						near={nearness(index, focus)}
						onFocusTick={setPointed}
						onLeaveTick={leave}
						total={anchors.length}
					/>
				))}
			</ol>
			<Tooltip handle={handle}>
				{({ payload }) => <NavigationPreview payload={payload} />}
			</Tooltip>
		</nav>
	);
}
