import { d3Curve } from "@tanstack/charts/d3/shape";
import { curveMonotoneX } from "d3-shape";

// Shared by TimeSeries and AreaChart: point validation, date formatting, and
// tick density for a UTC time axis.

export interface TimeSeriesPoint {
	time: number;
	value: number | null;
}

export interface TimeSeriesDatum {
	time: number;
	value: number | null;
	x: Date;
}

const DATE_LIMIT = 8_640_000_000_000_000;
// TanStack measures this gap in SVG pixels; 12px matches the space["3"] rhythm.
export const AXIS_TICK_MIN_GAP = 12;

export function preparePoints(
	points: readonly TimeSeriesPoint[],
	name = "TimeSeries"
): TimeSeriesDatum[] {
	if (!Array.isArray(points)) {
		throw new TypeError(`${name} points must be an array.`);
	}
	const sorted = points.map(({ time, value }) => {
		if (
			typeof time !== "number" ||
			!Number.isSafeInteger(time) ||
			Math.abs(time) > DATE_LIMIT
		) {
			throw new RangeError(
				`${name} times must be valid integer epoch milliseconds.`
			);
		}
		if (
			value !== null &&
			(typeof value !== "number" || !Number.isFinite(value))
		) {
			throw new RangeError(`${name} values must be finite numbers or null.`);
		}
		return { time, value, x: new Date(time) };
	});
	sorted.sort((left, right) => left.time - right.time);
	for (let index = 1; index < sorted.length; index += 1) {
		if (sorted[index - 1].time === sorted[index].time) {
			throw new RangeError(`${name} times must be unique.`);
		}
	}
	return sorted;
}

// Monotone curves stay smooth without overshooting the data.
export const SMOOTH = d3Curve(curveMonotoneX);

const DAY = 86_400_000;

// The smallest gap between points sets how precise dates need to be.
function getResolution(points: readonly TimeSeriesDatum[]): number {
	return points.slice(1).reduce((resolution, point, index) => {
		const gap = point.time - points[index].time;
		return gap > 0 && gap < resolution ? gap : resolution;
	}, Number.POSITIVE_INFINITY);
}

function getTooltipPrecision(resolution: number): Intl.DateTimeFormatOptions {
	const time: Intl.DateTimeFormatOptions = {
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short",
	};
	if (resolution >= DAY && Number.isFinite(resolution)) {
		return {};
	}
	if (resolution >= 60_000) {
		return time;
	}
	if (resolution >= 1000) {
		return { ...time, second: "2-digit" };
	}
	return { ...time, fractionalSecondDigits: 3, second: "2-digit" };
}

export function makeDateFormatter(
	locale: string,
	timeZone: string,
	points: readonly TimeSeriesDatum[] = []
) {
	return new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "short",
		timeZone,
		year: "numeric",
		...getTooltipPrecision(getResolution(points)),
	});
}

// At most one tick per data interval, so labels never repeat.
export function getTickCount(points: readonly TimeSeriesDatum[]): number {
	const duration = (points.at(-1)?.time ?? 0) - (points.at(0)?.time ?? 0);
	const resolution = getResolution(points);
	if (!(duration > 0 && Number.isFinite(resolution))) {
		return 5;
	}
	// Up to twelve ticks, such as every month of a year; thinning drops
	// labels that would collide.
	return Math.min(12, Math.max(1, Math.round(duration / resolution)));
}

export function makeAxisFormatter(
	locale: string,
	timeZone: string,
	points: readonly TimeSeriesDatum[]
) {
	const firstTime = points.at(0)?.time ?? 0;
	const lastTime = points.at(-1)?.time ?? firstTime;
	const duration = lastTime - firstTime;
	const precision = getAxisPrecision(duration);
	return new Intl.DateTimeFormat(locale, {
		...precision,
		...(duration < 90 * 86_400_000 ? { month: "short" } : {}),
		timeZone,
		...(duration < 86_400_000 ? { timeZoneName: "short" } : {}),
	});
}

function getAxisPrecision(duration: number): Intl.DateTimeFormatOptions {
	if (duration < 1000) {
		return {
			day: "numeric",
			fractionalSecondDigits: 3,
			hour: "numeric",
			minute: "2-digit",
			second: "2-digit",
		};
	}
	if (duration < 60_000) {
		return {
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			second: "2-digit",
		};
	}
	if (duration < 86_400_000) {
		return { day: "numeric", hour: "numeric", minute: "2-digit" };
	}
	if (duration < 90 * 86_400_000) {
		return { day: "numeric" };
	}
	// A two-digit year reads as a day ("Jan 26"), so show it in full or not at all.
	return duration < 366 * 86_400_000
		? { month: "short" }
		: { month: "short", year: "numeric" };
}

export function formatNumber(
	value: number,
	formatter: ((value: number) => string) | undefined,
	numberFormat: Intl.NumberFormat,
	formatterName = "formatValue",
	name = "TimeSeries"
) {
	const formatted = formatter ? formatter(value) : numberFormat.format(value);
	if (typeof formatted !== "string") {
		throw new TypeError(`${name} ${formatterName} must return a string.`);
	}
	return formatted;
}
