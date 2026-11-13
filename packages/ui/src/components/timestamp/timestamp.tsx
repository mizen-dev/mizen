import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import type { Closed } from "../../closed";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";
import { timestampStyles } from "./timestamp.styles";

export type TimestampFormat = "date" | "date-time" | "relative" | "time";
export type TimestampProps = Omit<
	Closed<ComponentPropsWithRef<"time">>,
	"children" | "data-slot" | "dateTime" | "lang" | "role"
> & {
	dateTime: string;
	/**
	 * `time` shows the hour and minute only, with no day and no zone. Pass the
	 * `timeZone` the reader expects; the exact time is in the title.
	 */
	format?: TimestampFormat;
	locale?: string;
	/**
	 * The instant `relative` counts from, as an ISO instant with a timezone.
	 * Defaults to the time of render.
	 */
	now?: string;
	timeZone?: string;
};

const DATE = { day: "numeric", month: "short", year: "numeric" } as const;
const TIME = { hour: "numeric", minute: "2-digit" } as const;
// What each format shows. "relative" is counted from now, not formatted.
const FORMATS: Record<
	Exclude<TimestampFormat, "relative">,
	Intl.DateTimeFormatOptions
> = {
	date: DATE,
	"date-time": { ...DATE, ...TIME, timeZoneName: "short" },
	time: TIME,
};

// Each unit is used until the next one fits; weeks stop at a month.
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	["second", 60],
	["minute", 60],
	["hour", 24],
	["day", 7],
	["week", 4.35],
	["month", 12],
	["year", Number.POSITIVE_INFINITY],
];

function formatRelative(date: Date, now: Date, locale: string) {
	const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
	let value = (date.getTime() - now.getTime()) / 1000;
	// Under a minute reads as "now" rather than a ticking count of seconds.
	if (Math.abs(value) < 60) {
		return formatter.format(0, "second");
	}
	for (const [unit, size] of RELATIVE_UNITS) {
		if (Math.abs(value) < size) {
			return formatter.format(Math.round(value), unit);
		}
		value /= size;
	}
	return formatter.format(Math.round(value), "year");
}

const ISO_INSTANT_REGEX =
	/^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:\.\d+)?(?<timezone>Z|[+-]\d{2}:\d{2})$/u;

function parseInstant(value: string): Date {
	const match = ISO_INSTANT_REGEX.exec(value);
	if (!match) {
		throw new RangeError("Timestamp requires an ISO instant with a timezone.");
	}

	const [, yearPart, monthPart, dayPart, hourPart, minutePart, secondPart] =
		match;
	const year = Number(yearPart);
	const month = Number(monthPart);
	const day = Number(dayPart);
	const hour = Number(hourPart);
	const minute = Number(minutePart);
	const second = Number(secondPart);
	const calendarDate = new Date(0);
	calendarDate.setUTCFullYear(year, month - 1, day);
	calendarDate.setUTCHours(hour, minute, second, 0);
	if (
		year === 0 ||
		calendarDate.getUTCFullYear() !== year ||
		calendarDate.getUTCMonth() !== month - 1 ||
		calendarDate.getUTCDate() !== day ||
		hour > 23 ||
		minute > 59 ||
		second > 59
	) {
		throw new RangeError("Timestamp requires a valid calendar date and time.");
	}
	const instant = new Date(Date.parse(value));
	if (!Number.isFinite(instant.getTime())) {
		throw new RangeError(
			"Timestamp requires a valid ISO instant with a timezone."
		);
	}
	return instant;
}

function formatTimestamp(
	date: Date,
	format: keyof typeof FORMATS,
	locale: string,
	timeZone: string
) {
	return new Intl.DateTimeFormat(locale, {
		...FORMATS[format],
		timeZone,
	}).format(date);
}

function assertFormat(format: string) {
	if (format !== "relative" && !Object.hasOwn(FORMATS, format)) {
		throw new RangeError(
			"Timestamp format must be 'date', 'date-time', 'time', or 'relative'."
		);
	}
}

export function Timestamp({
	dateTime,
	format = "date-time",
	locale = "en-US",
	now,
	ref: forwardedRef,
	timeZone = "UTC",
	...rest
}: TimestampProps) {
	assertFormat(format);
	const date = parseInstant(dateTime);
	const relative = format === "relative";
	const exact = formatTimestamp(date, "date-time", locale, timeZone);
	const label =
		format === "relative"
			? formatRelative(date, now ? parseInstant(now) : new Date(), locale)
			: formatTimestamp(date, format, locale, timeZone);
	for (const name of [
		"className",
		"data-slot",
		"dateTime",
		"lang",
		"role",
		"style",
	]) {
		Reflect.deleteProperty(rest, name);
	}

	return (
		<time
			{...rest}
			data-slot="timestamp"
			dateTime={dateTime}
			lang={locale}
			ref={forwardedRef}
			// Server and client render moments apart, so relative text may differ.
			suppressHydrationWarning={relative}
			// A format that leaves out the day or the zone keeps them on hover.
			title={relative || format === "time" ? exact : undefined}
			{...props(timestampStyles.root)}
		>
			{label}
			{relative ? (
				<span {...props(visuallyHiddenStyles.root)}>, {exact}</span>
			) : null}
		</time>
	);
}
