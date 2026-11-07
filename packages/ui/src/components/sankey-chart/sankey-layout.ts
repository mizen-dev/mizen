// A two-column Sankey layout: sources on the left, targets on the right, and
// one ribbon per link. Positions are in pixels along a fixed plot height.

export interface SankeyNode {
	id: string;
	label: string;
}

export interface SankeyLink {
	source: string;
	target: string;
	value: number;
}

export interface PlacedNode extends SankeyNode {
	height: number;
	top: number;
	value: number;
}

export interface PlacedLink extends SankeyLink {
	sourceTop: number;
	targetTop: number;
	thickness: number;
}

function placeColumn(
	nodes: readonly SankeyNode[],
	totals: Map<string, number>,
	height: number,
	padding: number,
	scale: number
): PlacedNode[] {
	const used = nodes.reduce(
		(sum, { id }) => sum + (totals.get(id) ?? 0) * scale,
		0
	);
	const free = height - used - padding * (nodes.length - 1);
	let top = Math.max(0, free / 2);
	return nodes.map((node) => {
		const value = totals.get(node.id) ?? 0;
		const placed = { ...node, height: value * scale, top, value };
		top += placed.height + padding;
		return placed;
	});
}

function sumBy(links: readonly SankeyLink[], key: "source" | "target") {
	const totals = new Map<string, number>();
	for (const link of links) {
		totals.set(link[key], (totals.get(link[key]) ?? 0) + link.value);
	}
	return totals;
}

export function layoutSankey(
	sources: readonly SankeyNode[],
	targets: readonly SankeyNode[],
	links: readonly SankeyLink[],
	height: number,
	padding: number
) {
	const sourceTotals = sumBy(links, "source");
	const targetTotals = sumBy(links, "target");
	const total = links.reduce((sum, { value }) => sum + value, 0);
	const gaps = padding * Math.max(sources.length, targets.length) - padding;
	const scale = total > 0 ? (height - gaps) / total : 0;
	const left = placeColumn(sources, sourceTotals, height, padding, scale);
	const right = placeColumn(targets, targetTotals, height, padding, scale);
	// Links stack inside each node in the order of the opposite column, so
	// ribbons cross as little as a two-column layout allows.
	const sourceOffset = new Map(left.map(({ id, top }) => [id, top]));
	const targetOffset = new Map(right.map(({ id, top }) => [id, top]));
	const sourceOrder = new Map(sources.map(({ id }, index) => [id, index]));
	const targetOrder = new Map(targets.map(({ id }, index) => [id, index]));
	const ordered = [...links].sort(
		(a, b) =>
			(sourceOrder.get(a.source) ?? 0) - (sourceOrder.get(b.source) ?? 0) ||
			(targetOrder.get(a.target) ?? 0) - (targetOrder.get(b.target) ?? 0)
	);
	const placed = ordered.map((link) => {
		const thickness = link.value * scale;
		const sourceTop = sourceOffset.get(link.source) ?? 0;
		sourceOffset.set(link.source, sourceTop + thickness);
		return { ...link, sourceTop, targetTop: 0, thickness };
	});
	const byTarget = [...placed].sort(
		(a, b) =>
			(targetOrder.get(a.target) ?? 0) - (targetOrder.get(b.target) ?? 0) ||
			(sourceOrder.get(a.source) ?? 0) - (sourceOrder.get(b.source) ?? 0)
	);
	for (const link of byTarget) {
		const top = targetOffset.get(link.target) ?? 0;
		link.targetTop = top;
		targetOffset.set(link.target, top + link.thickness);
	}
	return { left, links: placed, right, total };
}

/** A ribbon from x 0 to `width` with an S-curve through the middle. */
export function ribbonPath(link: PlacedLink, width: number) {
	const { sourceTop: s0, targetTop: t0, thickness } = link;
	const mid = width / 2;
	const s1 = s0 + thickness;
	const t1 = t0 + thickness;
	return `M0,${s0} C${mid},${s0} ${mid},${t0} ${width},${t0} L${width},${t1} C${mid},${t1} ${mid},${s1} 0,${s1} Z`;
}
