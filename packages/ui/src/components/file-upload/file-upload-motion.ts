// Rows grow open when a file arrives and collapse before it leaves, so the
// list never jumps. Items already in the list on first render stay still.
const OPTIONS = { duration: 240, easing: "cubic-bezier(0.16, 1, 0.3, 1)" };
const settledLists = new WeakSet<Element>();
const seenItems = new WeakSet<Element>();
const leavingItems = new WeakSet<Element>();

// Skips motion when the user asks for less, or the DOM can't animate (jsdom).
function stillMotion(node: HTMLElement): boolean {
	return (
		typeof node.animate !== "function" ||
		window.matchMedia?.("(prefers-reduced-motion: reduce)").matches !== false
	);
}

// The closed frame also takes back the list gap beside the item.
function closedGap(node: HTMLElement, isTile: boolean): Keyframe {
	const parent = node.parentElement;
	const gap = parent
		? getComputedStyle(parent)[isTile ? "columnGap" : "rowGap"]
		: "0px";
	const side = node.previousElementSibling ? "Start" : "End";
	const margin = isTile ? `marginInline${side}` : `marginBlock${side}`;
	return gap === "normal" ? {} : { [margin]: `-${gap}` };
}

function sizeFrames(node: HTMLElement): [Keyframe, Keyframe] {
	const style = getComputedStyle(node);
	const isTile = node.dataset.layout === "tile";
	const open: Keyframe = isTile
		? { width: style.width }
		: {
				height: style.height,
				paddingBlockEnd: style.paddingBlockEnd,
				paddingBlockStart: style.paddingBlockStart,
			};
	const closed: Keyframe = isTile
		? { width: "0px" }
		: { height: "0px", paddingBlockEnd: "0px", paddingBlockStart: "0px" };
	return [
		{ ...closed, ...closedGap(node, isTile), opacity: 0, overflow: "hidden" },
		{ ...open, opacity: 1, overflow: "hidden" },
	];
}

export function settleList(node: HTMLElement | null): void {
	if (node) {
		settledLists.add(node);
	}
}

export function growItem(node: HTMLElement | null): void {
	if (!node || seenItems.has(node)) {
		return;
	}
	seenItems.add(node);
	const list = node.parentElement;
	if (list && settledLists.has(list) && !stillMotion(node)) {
		node.animate(sizeFrames(node), OPTIONS);
	}
}

// Collapses the item, then removes it. A removal the app cancels opens it again.
export function collapseItem(
	node: HTMLElement | null,
	remove: () => void
): void {
	if (!node || stillMotion(node)) {
		remove();
		return;
	}
	if (leavingItems.has(node)) {
		return;
	}
	leavingItems.add(node);
	const animation = node.animate(sizeFrames(node).reverse(), {
		...OPTIONS,
		fill: "forwards",
	});
	animation.onfinish = () => {
		remove();
		leavingItems.delete(node);
		animation.cancel();
	};
}
