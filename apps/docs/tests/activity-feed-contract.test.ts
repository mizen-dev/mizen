// @vitest-environment happy-dom

import type { ComponentPropsWithRef } from "react";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	ActivityFeed,
	ActivityFeedContent,
	type ActivityFeedContentProps,
	ActivityFeedDescription,
	ActivityFeedDetails,
	ActivityFeedHeader,
	ActivityFeedItem,
	type ActivityFeedItemProps,
	ActivityFeedMedia,
	type ActivityFeedProps,
	ActivityFeedSummary,
	ActivityFeedTime,
	type ActivityFeedTimeProps,
} from "../../../packages/ui/src/components/activity-feed/activity-feed";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Closed<P, E extends "ol" | "li" | "div" | "time"> = Exact<
	Exclude<keyof ComponentPropsWithRef<E>, keyof P>,
	"className" | "role" | "style"
>;
type RequiredProps<P, K extends keyof P> = K extends keyof P
	? Record<string, never> extends Pick<P, K>
		? false
		: true
	: false;
type Rejects<P, K extends PropertyKey> = K extends keyof P ? false : true;
type FeedContract = [
	Closed<ActivityFeedProps, "ol">,
	Closed<ActivityFeedItemProps, "li">,
	Closed<ActivityFeedContentProps, "div">,
	Closed<ActivityFeedTimeProps, "time">,
	Exact<ActivityFeedTimeProps["dateTime"], string>,
	RequiredProps<ActivityFeedTimeProps, "children" | "dateTime">,
	Rejects<ActivityFeedTimeProps, "className" | "data-slot" | "role" | "style">,
];
const feedContract: FeedContract = [true, true, true, true, true, true, true];

function requiredElement(root: ParentNode, selector: string): Element {
	const element = root.querySelector(selector);
	if (!element) {
		throw new Error(`Expected ${selector} in rendered ActivityFeed`);
	}
	return element;
}

describe("ActivityFeed contract and semantics", () => {
	it("keeps rich event parts semantic and protects their slots", () => {
		const markup = renderToStaticMarkup(
			h(
				ActivityFeed,
				{ variant: "timeline" },
				h(
					ActivityFeedItem,
					null,
					h(ActivityFeedMedia, { "aria-hidden": true }, "MC"),
					h(
						ActivityFeedContent,
						null,
						h(
							ActivityFeedHeader,
							null,
							h(ActivityFeedSummary, null, "Maya commented")
						),
						h(ActivityFeedDescription, null, "Design review"),
						h(
							ActivityFeedDetails,
							{
								"data-slot": "injected",
								style: { display: "none" },
							} as unknown as Parameters<typeof ActivityFeedDetails>[0],
							h("a", { href: "/review" }, "Open review")
						)
					)
				)
			)
		);
		const container = document.createElement("div");
		container.innerHTML = markup;
		expect(container.querySelector("ol")?.dataset.variant).toBe("timeline");
		expect(
			container
				.querySelector('[data-slot="activity-feed-media"]')
				?.getAttribute("aria-hidden")
		).toBe("true");
		expect(
			container.querySelector(
				'[data-slot="activity-feed-header"] [data-slot="activity-feed-summary"]'
			)
		).not.toBeNull();
		expect(
			container.querySelector('[data-slot="activity-feed-summary"]')?.tagName
		).toBe("P");
		expect(
			container.querySelector('[data-slot="activity-feed-description"]')
				?.textContent
		).toBe("Design review");
		expect(
			container
				.querySelector('[data-slot="activity-feed-details"] a')
				?.getAttribute("href")
		).toBe("/review");
		expect(markup).not.toContain("injected");
		expect(markup).not.toContain("display:none");
	});

	it("keeps native props closed and requires a machine-readable time", () => {
		expect(feedContract.every(Boolean)).toBe(true);
	});

	it("renders an ordered native list with list items and time elements", () => {
		const markup = renderToStaticMarkup(
			h(
				ActivityFeed,
				{
					"aria-label": "Recent activity",
					className: "injected-class",
					"data-slot": "injected-feed",
					id: "activity-feed",
					role: "menu",
					style: { color: "red" },
				} as unknown as ActivityFeedProps,
				h(
					ActivityFeedItem,
					{ id: "activity-item" },
					h(ActivityFeedContent, null, "Sam deployed release 4.2"),
					h(
						ActivityFeedTime,
						{
							className: "injected-class",
							"data-slot": "injected-time",
							dateTime: "2026-10-07T14:30:00Z",
							role: "presentation",
							style: { color: "red" },
						} as unknown as ActivityFeedTimeProps,
						"A few minutes ago"
					)
				)
			)
		);
		const container = document.createElement("div");
		container.innerHTML = markup;
		const feed = requiredElement(container, "ol[data-slot='activity-feed']");
		const item = requiredElement(feed, "li[data-slot='activity-feed-item']");
		const content = requiredElement(
			item,
			"[data-slot='activity-feed-content']"
		);
		const time = requiredElement(item, "time[data-slot='activity-feed-time']");

		expect(feed.getAttribute("role")).toBe("list");
		expect(feed.getAttribute("data-slot")).toBe("activity-feed");
		expect(feed.className).toBe("");
		expect(feed.hasAttribute("style")).toBe(false);
		expect(feed.getAttribute("aria-label")).toBe("Recent activity");
		expect(feed.id).toBe("activity-feed");
		expect(item.id).toBe("activity-item");
		expect(content.textContent).toBe("Sam deployed release 4.2");
		expect(time.getAttribute("datetime")).toBe("2026-10-07T14:30:00Z");
		expect(time.getAttribute("data-slot")).toBe("activity-feed-time");
		expect(time.className).toBe("");
		expect(time.hasAttribute("style")).toBe(false);
		expect(time.textContent).toBe("A few minutes ago");
		expect(time.hasAttribute("role")).toBe(false);
	});
});
