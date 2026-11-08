// The scroll engine behind MessageScroller. It attaches to the viewport, the
// log, and the spacer through ref callbacks, so it needs no effects, and
// React reads its state through useSyncExternalStore.

/** Distance from the end, in px, that still counts as at the end. */
const EDGE = 16;
/** How much of the previous turn stays in view above a new anchor. */
const PEEK = 64;
const LABEL_LENGTH = 80;
const REPLY_LENGTH = 160;

export interface MessageScrollerAnchor {
	id: string;
	/** The anchor's own text, such as the question the person sent. */
	label: string;
	/** The start of the reply that follows it, empty until one arrives. */
	reply: string;
}

export interface MessageScrollerSnapshot {
	anchors: readonly MessageScrollerAnchor[];
	/** True when there is nothing below the view to scroll toward. */
	atEnd: boolean;
	/** The turn being read, for a navigation rail. */
	current: string | null;
}

const ITEM = "[data-message-id]";
// A turn boundary: marked so, or "auto" holding the reader's own Message.
const ANCHOR =
	"[data-scroll-anchor='true'], [data-scroll-anchor='auto']:has([data-slot='message'][data-from='user'][data-align='end'])";
const BACK_KEYS = new Set(["ArrowUp", "Home", "PageUp"]);

function reducedMotion() {
	return (
		typeof matchMedia === "function" &&
		matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

// Where an element sits in the scrolled content, from layout alone, so a
// row still rising into place measures where it will land.
function layoutTop(element: HTMLElement, viewport: HTMLElement) {
	let top = 0;
	let node: Element | null = element;
	while (node instanceof HTMLElement && node !== viewport) {
		top += node.offsetTop;
		node = node.offsetParent;
	}
	if (node === viewport) {
		return top;
	}
	return (
		viewport.scrollTop +
		element.getBoundingClientRect().top -
		viewport.getBoundingClientRect().top
	);
}

const TEXT = "[data-slot='message-text'], [data-slot='streaming-text']";

function clip(text: string, length: number) {
	const line = text.replace(/\s+/gu, " ").trim();
	return line.length > length ? `${line.slice(0, length - 1)}…` : line;
}

function labelOf(item: HTMLElement) {
	const text = item.querySelector(TEXT)?.textContent ?? item.textContent;
	return clip(text ?? "", LABEL_LENGTH);
}

// The first message text among the rows after an anchor, up to the next one.
function replyOf(item: HTMLElement) {
	let row = item.nextElementSibling;
	while (row && !row.matches(ANCHOR)) {
		const text = row.querySelector(TEXT)?.textContent;
		if (text) {
			return clip(text, REPLY_LENGTH);
		}
		row = row.nextElementSibling;
	}
	return "";
}

function anchorsIn(log: HTMLElement): MessageScrollerAnchor[] {
	return [...log.querySelectorAll<HTMLElement>(ANCHOR)].map((item) => ({
		id: item.dataset.messageId ?? "",
		label: labelOf(item),
		reply: replyOf(item),
	}));
}

function sameAnchors(
	a: readonly MessageScrollerAnchor[],
	b: readonly MessageScrollerAnchor[]
) {
	return (
		a.length === b.length &&
		a.every(
			(item, index) =>
				item.id === b[index]?.id &&
				item.label === b[index]?.label &&
				item.reply === b[index]?.reply
		)
	);
}

export class MessageScrollerStore {
	private viewport: HTMLElement | null = null;
	private log: HTMLElement | null = null;
	private spacer: HTMLElement | null = null;
	/** following: growing content keeps the view at the end. started: the view has opened at the end. */
	private readonly mode: { following: boolean; started: boolean } = {
		following: true,
		started: false,
	};
	/** The last turn sent while watching; it settles near the top. */
	private anchor: HTMLElement | null = null;
	/** A scroll position the store set itself, until the view reaches it. */
	private target: number | null = null;
	/** The first item in view and its offset, so the view can hold still. */
	private reference: { item: HTMLElement; top: number } | null = null;
	private snapshot: MessageScrollerSnapshot = {
		anchors: [],
		atEnd: true,
		current: null,
	};
	private readonly listeners = new Set<() => void>();

	readonly subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	readonly getSnapshot = () => this.snapshot;

	/** True once the view is on screen: rows from now on are new arrivals. */
	readonly isLive = () => this.viewport !== null;

	readonly attachLog = (log: HTMLElement | null) => {
		if (!log) {
			return;
		}
		this.log = log;
		const resize = new ResizeObserver(() => this.onLayout());
		const mutation = new MutationObserver((records) =>
			this.onMutation(records)
		);
		resize.observe(log);
		// aria-busy turning off means the reply ended.
		mutation.observe(log, {
			attributeFilter: ["aria-busy"],
			attributes: true,
			childList: true,
		});
		return () => {
			resize.disconnect();
			mutation.disconnect();
			this.log = null;
		};
	};

	readonly attachSpacer = (spacer: HTMLElement | null) => {
		this.spacer = spacer;
	};

	readonly attachViewport = (viewport: HTMLElement | null) => {
		if (!viewport) {
			return;
		}
		this.viewport = viewport;
		const resize = new ResizeObserver(() => this.onLayout());
		resize.observe(viewport);
		viewport.addEventListener("scroll", this.onScroll, { passive: true });
		viewport.addEventListener("wheel", this.onIntent, { passive: true });
		viewport.addEventListener("touchstart", this.onIntent, { passive: true });
		viewport.addEventListener("keydown", this.onKey);
		this.start();
		return () => {
			resize.disconnect();
			viewport.removeEventListener("scroll", this.onScroll);
			viewport.removeEventListener("wheel", this.onIntent);
			viewport.removeEventListener("touchstart", this.onIntent);
			viewport.removeEventListener("keydown", this.onKey);
			this.viewport = null;
		};
	};

	/** Scrolls to the newest content and follows it again. */
	readonly scrollToEnd = (behavior: ScrollBehavior = "smooth") => {
		this.mode.following = true;
		this.scrollTo(Number.POSITIVE_INFINITY, behavior);
	};

	/** Scrolls a message to the top of the view, the previous turn peeking. */
	readonly scrollToMessage = (
		id: string,
		behavior: ScrollBehavior = "smooth"
	) => {
		const item = this.log?.querySelector<HTMLElement>(
			`[data-message-id="${CSS.escape(id)}"]`
		);
		if (!item) {
			return false;
		}
		this.mode.following = false;
		this.scrollTo(this.offsetOf(item) - PEEK, behavior);
		return true;
	};

	// Opens at the end once there is something to show, without motion.
	private start() {
		const { log, viewport } = this;
		if (
			this.mode.started ||
			!(log && viewport) ||
			log.childElementCount === 0
		) {
			return;
		}
		this.mode.started = true;
		this.scrollTo(Number.POSITIVE_INFINITY, "instant");
		this.update();
	}

	private offsetOf(item: HTMLElement) {
		const { viewport } = this;
		if (!viewport) {
			return 0;
		}
		return layoutTop(item, viewport);
	}

	private scrollTo(top: number, behavior: ScrollBehavior) {
		const { viewport } = this;
		if (!viewport) {
			return;
		}
		const end = viewport.scrollHeight - viewport.clientHeight;
		this.target = Math.max(0, Math.min(top, end));
		viewport.scrollTo({
			behavior: reducedMotion() ? "instant" : behavior,
			top: this.target,
		});
	}

	// Wheel, touch, and keys going back mean the reader is taking over.
	private readonly onIntent = () => {
		this.target = null;
	};

	private readonly onKey = (event: KeyboardEvent) => {
		if (BACK_KEYS.has(event.key)) {
			this.target = null;
		}
	};

	private readonly onScroll = () => {
		const { viewport } = this;
		if (!viewport) {
			return;
		}
		if (this.target === null) {
			// The reader scrolled: follow again only from the end.
			this.mode.following = this.distance() <= EDGE;
		} else if (Math.abs(viewport.scrollTop - this.target) < 1) {
			this.target = null;
		}
		this.remember();
		this.update();
	};

	private onLayout() {
		this.start();
		this.sizeSpacer();
		if (this.mode.following) {
			this.scrollTo(Number.POSITIVE_INFINITY, "instant");
		} else {
			this.holdStill();
		}
		this.update();
	}

	private onMutation(records: MutationRecord[]) {
		// Sending often marks the log busy and adds the turn in one update, so
		// both are handled.
		if (records.some((record) => record.type === "attributes")) {
			this.onBusyChange();
		}
		if (!records.some((record) => record.type === "childList")) {
			return;
		}
		const sent = this.mode.started ? this.sentTurn(records) : null;
		if (sent) {
			this.settle(sent);
		} else {
			this.onLayout();
		}
	}

	// The newest anchor among rows just added at the end: a send often adds
	// the person's turn and the reply's first row in one go.
	private sentTurn(records: MutationRecord[]) {
		const added = new Set(records.flatMap((record) => [...record.addedNodes]));
		let node = this.log?.lastElementChild ?? null;
		while (node && added.has(node)) {
			if (node instanceof HTMLElement && node.matches(ANCHOR)) {
				return node;
			}
			node = node.previousElementSibling;
		}
		return null;
	}

	// A turn the person just sent moves near the top; the reply grows under
	// it, and the view stays put until the reader scrolls.
	private settle(item: HTMLElement) {
		this.anchor = item;
		this.mode.following = false;
		this.sizeSpacer();
		this.scrollTo(this.offsetOf(item) - PEEK, "smooth");
		this.update();
	}

	// Once the reply ends, the blank room under it eases away, so a short
	// reply comes to rest just above whatever sits below the transcript.
	private onBusyChange() {
		const { anchor, log, spacer } = this;
		if (!(anchor && log && spacer) || log.hasAttribute("aria-busy")) {
			return;
		}
		this.anchor = null;
		spacer.style.transition = reducedMotion()
			? "none"
			: "height 280ms cubic-bezier(0.16, 1, 0.3, 1)";
		spacer.style.height = "0px";
	}

	// Room under a short reply, so its turn can sit near the top.
	private sizeSpacer() {
		const { anchor, log, spacer, viewport } = this;
		if (!(spacer && log && viewport)) {
			return;
		}
		// Sizing for a new turn is instant; only the release eases.
		if (anchor) {
			spacer.style.transition = "none";
		}
		if (!anchor?.isConnected) {
			spacer.style.height = "0px";
			return;
		}
		const below =
			layoutTop(log, viewport) + log.offsetHeight - layoutTop(anchor, viewport);
		const padding = Number.parseFloat(getComputedStyle(viewport).paddingBottom);
		const room = viewport.clientHeight - PEEK - below - (padding || 0);
		spacer.style.height = `${Math.max(0, room)}px`;
	}

	private distance() {
		const { viewport } = this;
		if (!viewport) {
			return 0;
		}
		return viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
	}

	// How much of the transcript is still below the view. The spacer under a
	// settled turn is blank, so it does not count.
	private unseen() {
		const { log, viewport } = this;
		if (!(log && viewport)) {
			return 0;
		}
		return (
			log.getBoundingClientRect().bottom -
			viewport.getBoundingClientRect().bottom
		);
	}

	// The first item in view, so a change above it can be undone.
	private remember() {
		const { log, viewport } = this;
		if (!(log && viewport)) {
			return;
		}
		const { top } = viewport.getBoundingClientRect();
		const item = [...log.querySelectorAll<HTMLElement>(ITEM)].find(
			(node) => node.getBoundingClientRect().bottom > top
		);
		this.reference = item
			? { item, top: item.getBoundingClientRect().top - top }
			: null;
	}

	// Older messages loaded above, or a turn above grew: keep the reader's line.
	private holdStill() {
		const { reference, viewport } = this;
		if (!(reference?.item.isConnected && viewport) || this.target !== null) {
			return;
		}
		const now =
			reference.item.getBoundingClientRect().top -
			viewport.getBoundingClientRect().top;
		const shift = now - reference.top;
		if (Math.abs(shift) >= 1) {
			viewport.scrollTop += shift;
		}
	}

	private currentAnchor() {
		const { log, viewport } = this;
		if (!(log && viewport)) {
			return null;
		}
		// The turn being read: the last one starting above the middle.
		const box = viewport.getBoundingClientRect();
		const line = box.top + box.height / 2;
		let current: string | null = null;
		for (const item of log.querySelectorAll<HTMLElement>(ANCHOR)) {
			if (item.getBoundingClientRect().top > line) {
				break;
			}
			current = item.dataset.messageId ?? null;
		}
		return current ?? this.snapshot.anchors[0]?.id ?? null;
	}

	private update() {
		const { log } = this;
		if (!log) {
			return;
		}
		const anchors = anchorsIn(log);
		const next: MessageScrollerSnapshot = {
			anchors: sameAnchors(anchors, this.snapshot.anchors)
				? this.snapshot.anchors
				: anchors,
			atEnd: this.unseen() <= EDGE,
			current: this.currentAnchor(),
		};
		const previous = this.snapshot;
		if (
			next.anchors === previous.anchors &&
			next.atEnd === previous.atEnd &&
			next.current === previous.current
		) {
			return;
		}
		this.snapshot = next;
		for (const listener of this.listeners) {
			listener();
		}
	}
}
