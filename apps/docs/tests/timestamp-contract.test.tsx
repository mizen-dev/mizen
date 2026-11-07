// @vitest-environment happy-dom

import type { ComponentPropsWithRef, ComponentType } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	Timestamp,
	type TimestampFormat,
	type TimestampProps,
} from "../../../packages/ui/src/components/timestamp/timestamp";

const propsSpy = vi.hoisted(() => vi.fn(() => ({})));

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: propsSpy,
	when: { ancestor: () => ":where(*)" },
}));

type Rejects<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [never]
	? true
	: false;
type Required<T, K extends keyof T> =
	Record<string, never> extends Pick<T, K> ? false : true;
type HasRef<T> = "ref" extends keyof T ? true : false;
type TimestampContract = [
	Rejects<
		TimestampProps,
		"children" | "className" | "data-slot" | "lang" | "role" | "style"
	>,
	Required<TimestampProps, "dateTime">,
	HasRef<TimestampProps>,
	"dateTime" extends keyof ComponentPropsWithRef<"time"> ? true : false,
	TimestampFormat extends "date" | "date-time" | "relative" ? true : false,
];
const contract: TimestampContract = [true, true, true, true, true];
const UnsafeTimestamp = Timestamp as ComponentType<Record<string, unknown>>;

function requiredTimestamp(markup: string): HTMLTimeElement {
	const container = document.createElement("div");
	container.innerHTML = markup;
	const time = container.querySelector("time");
	if (!time) {
		throw new Error("Expected a native time element");
	}
	return time;
}

function expectedDateTime(dateTime: string, locale: string, timeZone: string) {
	return new Intl.DateTimeFormat(locale, {
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		month: "short",
		timeZone,
		timeZoneName: "short",
		year: "numeric",
	}).format(new Date(dateTime));
}

describe("Timestamp contract", () => {
	it("renders a deterministic, machine-readable native time", () => {
		const dateTime = "2026-10-07T14:30:00Z";
		const markup = renderToStaticMarkup(
			<Timestamp dateTime={dateTime} locale="en-US" timeZone="UTC" />
		);

		expect(markup).toContain('<time data-slot="timestamp"');
		expect(requiredTimestamp(markup).dateTime).toBe(dateTime);
		expect(requiredTimestamp(markup).lang).toBe("en-US");
		expect(markup).toContain(expectedDateTime(dateTime, "en-US", "UTC"));
		expect(markup).toContain("UTC");
		expect(propsSpy).toHaveBeenCalledWith(
			expect.objectContaining({ color: expect.any(String) }),
			expect.anything()
		);
		expect(contract.every(Boolean)).toBe(true);
	});

	it("formats date-only output in the requested locale and timezone", () => {
		const dateTime = "2026-01-01T00:30:00+10:00";
		const markup = renderToStaticMarkup(
			<Timestamp
				dateTime={dateTime}
				format="date"
				locale="en-US"
				timeZone="UTC"
			/>
		);
		const expected = new Intl.DateTimeFormat("en-US", {
			day: "numeric",
			month: "short",
			timeZone: "UTC",
			year: "numeric",
		}).format(new Date(dateTime));

		expect(markup).toContain(expected);
		expect(markup).not.toContain("UTC");
		expect(requiredTimestamp(markup).dateTime).toBe(dateTime);
	});

	it("accepts ISO instants with microsecond precision", () => {
		const dateTime = "2026-10-07T14:30:00.123456Z";
		const markup = renderToStaticMarkup(<Timestamp dateTime={dateTime} />);

		expect(requiredTimestamp(markup).dateTime).toBe(dateTime);
		expect(markup).toContain(expectedDateTime(dateTime, "en-US", "UTC"));
	});

	it("formats relative time from a given instant and keeps the exact time", () => {
		const cases: [string, string][] = [
			["2026-10-07T14:29:40Z", "now"],
			["2026-10-07T14:25:00Z", "5 minutes ago"],
			["2026-10-07T12:30:00Z", "2 hours ago"],
			["2026-10-06T14:30:00Z", "yesterday"],
			["2026-09-23T14:30:00Z", "2 weeks ago"],
			["2026-07-07T14:30:00Z", "3 months ago"],
			["2026-10-07T17:30:00Z", "in 3 hours"],
		];
		for (const [dateTime, expected] of cases) {
			const time = requiredTimestamp(
				renderToStaticMarkup(
					<Timestamp
						dateTime={dateTime}
						format="relative"
						now="2026-10-07T14:30:00Z"
					/>
				)
			);
			const exact = expectedDateTime(dateTime, "en-US", "UTC");
			expect(time.firstChild?.textContent).toBe(expected);
			expect(time.title).toBe(exact);
			// Screen readers hear the exact time after the relative phrase.
			expect(time.textContent).toBe(`${expected}, ${exact}`);
		}
	});

	it("rejects an invalid reference instant", () => {
		expect(() =>
			renderToStaticMarkup(
				<Timestamp
					dateTime="2026-10-07T14:30:00Z"
					format="relative"
					now="today"
				/>
			)
		).toThrow(RangeError);
	});

	it("rejects malformed, timezone-free, and rollover dates", () => {
		for (const dateTime of [
			"2026-10-07T14:30:00",
			"2026-02-30T14:30:00Z",
			"2026-13-07T14:30:00Z",
			"2026-10-07T24:30:00Z",
			"not a date",
		]) {
			expect(() =>
				renderToStaticMarkup(<Timestamp dateTime={dateTime} />)
			).toThrow(RangeError);
		}
	});

	it("protects the native time value, language, role, slot, and styles", () => {
		const dateTime = "2026-10-07T14:30:00Z";
		const markup = renderToStaticMarkup(
			h(UnsafeTimestamp, {
				className: "unsafe",
				"data-slot": "unsafe",
				dateTime,
				lang: "unsafe",
				locale: "fr-FR",
				role: "button",
				style: { color: "red" },
				timeZone: "UTC",
			})
		);

		expect(markup).toContain('data-slot="timestamp"');
		expect(requiredTimestamp(markup).dateTime).toBe(dateTime);
		expect(requiredTimestamp(markup).lang).toBe("fr-FR");
		expect(markup).not.toContain("unsafe");
		expect(markup).not.toContain("role=");
		expect(markup).not.toContain("style=");
	});
});
