// Layout checks for docs preview frames. checkPreviewLayout runs inside the
// page, so it must stay self-contained: no imports, no outer variables.

export interface PreviewLayoutIssue {
	detail: string;
	frame: string;
	kind: "empty" | "off-center" | "spill" | "wrapped-label";
}

export function checkPreviewLayout(): PreviewLayoutIssue[] {
	const REPLACED = new Set([
		"CANVAS",
		"IFRAME",
		"IMG",
		"INPUT",
		"SELECT",
		"TEXTAREA",
		"VIDEO",
		"svg",
	]);
	const transparent = (color: string) =>
		color === "transparent" || color.endsWith(", 0)");
	const hasBorder = (style: CSSStyleDeclaration) =>
		["top", "right", "bottom", "left"].some(
			(side) =>
				Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
				!transparent(style.getPropertyValue(`border-${side}-color`))
		);
	const fills = (style: CSSStyleDeclaration) =>
		!transparent(style.backgroundColor) ||
		style.boxShadow !== "none" ||
		hasBorder(style);
	// Tracks and dividers often paint on ::before or ::after.
	const pseudoFills = (element: Element) =>
		["::before", "::after"].some((pseudo) => {
			const style = getComputedStyle(element, pseudo);
			return style.content !== "none" && fills(style);
		});
	const paints = (element: Element, style: CSSStyleDeclaration) =>
		REPLACED.has(element.tagName) || fills(style) || pseudoFills(element);
	const visibleRect = (rect: DOMRect) => rect.width > 1 && rect.height > 1;
	const textRects = (node: Node) => {
		const range = document.createRange();
		range.selectNodeContents(node);
		return [...range.getClientRects()].filter(visibleRect);
	};

	// Clip a painted box to every box between it and the frame that clips:
	// scrollers, overflow clips, and visually hidden text (clip-path, clip).
	function clipToAncestors(element: Element, frame: Element, rect: DOMRect) {
		let { bottom, left, right, top } = rect;
		for (let node: Element | null = element; node && node !== frame; ) {
			const style = getComputedStyle(node);
			if (style.clipPath.startsWith("inset(50%")) {
				return null;
			}
			const clips =
				style.clipPath !== "none" ||
				style.clip !== "auto" ||
				style.overflowX !== "visible";
			if (node !== element && clips) {
				const box = node.getBoundingClientRect();
				left = Math.max(left, box.left);
				right = Math.min(right, box.right);
				top = Math.max(top, box.top);
				bottom = Math.min(bottom, box.bottom);
			}
			node = node.parentElement;
		}
		const width = right - left;
		const height = bottom - top;
		return width > 1 && height > 1
			? new DOMRect(left, top, width, height)
			: null;
	}

	function candidateRects(node: Node, element: Element) {
		const style = getComputedStyle(element);
		if (style.visibility !== "visible" || style.opacity === "0") {
			return [];
		}
		if (node instanceof Text) {
			if (!node.textContent?.trim()) {
				return [];
			}
			// Balanced text breaks into shorter lines inside a full-width
			// block; the block, not its lines, is what sits in the stage.
			return style.textWrap === "balance"
				? [element.getBoundingClientRect()]
				: textRects(node);
		}
		return paints(element, style) ? [element.getBoundingClientRect()] : [];
	}

	function paintedRects(frame: Element) {
		const rects: DOMRect[] = [];
		const walker = document.createTreeWalker(
			frame,
			// biome-ignore lint/suspicious/noBitwiseOperators: NodeFilter flags combine bitwise by design.
			NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
		);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const element =
				node instanceof Element ? node : (node.parentElement as Element);
			for (const rect of candidateRects(node, element)) {
				const shown = clipToAncestors(element, frame, rect);
				if (shown) {
					rects.push(shown);
				}
			}
		}
		return rects;
	}

	function spillIssue(f: DOMRect, rects: DOMRect[]) {
		const spill = rects.find(
			(rect) => rect.right > f.right + 1 || rect.left < f.left - 1
		);
		if (!spill) {
			return [];
		}
		const by = Math.max(spill.right - f.right, f.left - spill.left);
		return [{ detail: `${Math.round(by)}px`, kind: "spill" as const }];
	}

	// Small content hugging one side of a large stage reads as misplaced;
	// a centered block with start-aligned text does not.
	function offCenterIssue(f: DOMRect, rects: DOMRect[]) {
		const left = Math.max(f.left, Math.min(...rects.map((r) => r.left)));
		const right = Math.min(f.right, Math.max(...rects.map((r) => r.right)));
		const lean = left - f.left - (f.right - right);
		if (right - left > f.width / 2 || Math.abs(lean) < f.width / 4) {
			return [];
		}
		return [
			{ detail: `leans ${Math.round(lean)}px`, kind: "off-center" as const },
		];
	}

	// One short text run broken across lines means its control was squeezed.
	function wrappedLabelIssues(frame: Element) {
		const issues: { detail: string; kind: "wrapped-label" }[] = [];
		for (const control of frame.querySelectorAll(
			"button, [role='tab'], [role='button']"
		)) {
			const text = control.textContent?.trim() ?? "";
			const walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT);
			let wrapped = false;
			for (let node = walker.nextNode(); node; node = walker.nextNode()) {
				const tops = textRects(node).map((rect) => rect.top);
				wrapped ||= Math.max(...tops) - Math.min(...tops) > 4;
			}
			if (wrapped && text.length <= 20) {
				issues.push({ detail: `"${text}"`, kind: "wrapped-label" });
			}
		}
		return issues;
	}

	function frameIssues(frame: Element): PreviewLayoutIssue[] {
		const name =
			frame.getAttribute("aria-label") ?? frame.getAttribute("data-slot") ?? "";
		const f = frame.getBoundingClientRect();
		const rects = paintedRects(frame);
		const found =
			rects.length === 0
				? [{ detail: "nothing paints", kind: "empty" as const }]
				: [
						...spillIssue(f, rects),
						...offCenterIssue(f, rects),
						...wrappedLabelIssues(frame),
					];
		return found.map((issue) => ({ ...issue, frame: name }));
	}

	return [
		...document.querySelectorAll(
			"main [data-slot='component-preview'], main [data-slot='usage-preview']"
		),
	]
		.filter((frame) => frame.getClientRects().length > 0)
		.flatMap(frameIssues);
}
