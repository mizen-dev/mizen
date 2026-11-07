// SVG arc paths for ring charts. Angles are in turns: 0 is twelve o'clock and
// values grow clockwise, so 0.25 is three o'clock.

// Server and browser math can differ in the last digit; thousandths keep the
// path identical on both sides, far below a pixel.
const round = (value: number) => Math.round(value * 1000) / 1000;

function point(cx: number, cy: number, radius: number, turn: number) {
	const angle = turn * 2 * Math.PI;
	return [
		round(cx + radius * Math.sin(angle)),
		round(cy - radius * Math.cos(angle)),
	];
}

export function arcPath(
	cx: number,
	cy: number,
	radius: number,
	start: number,
	end: number
): string {
	// A full turn needs two half arcs; one arc cannot start and end on a point.
	// They share one subpath, so a dash runs on across the seam.
	if (end - start >= 1) {
		const [x, y] = point(cx, cy, radius, start);
		return `${arcPath(cx, cy, radius, start, start + 0.5)} A${radius},${radius} 0 0 1 ${x},${y}`;
	}
	const [x1, y1] = point(cx, cy, radius, start);
	const [x2, y2] = point(cx, cy, radius, end);
	const large = end - start > 0.5 ? 1 : 0;
	return `M${x1},${y1} A${radius},${radius} 0 ${large} 1 ${x2},${y2}`;
}
