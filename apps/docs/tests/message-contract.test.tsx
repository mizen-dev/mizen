// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Message } from "../../../packages/ui/src/components/message/message";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

function noop() {
	// Only whether a handler exists matters here.
}

function render(markup: string) {
	const container = document.createElement("div");
	container.innerHTML = markup;
	return container;
}

describe("Message contract", () => {
	it("shows the person's words in a bubble with Copy, Edit, and the time", () => {
		const root = render(
			renderToStaticMarkup(
				<Message
					dateTime="2026-11-05T16:20:00+05:00"
					from="user"
					onEdit={noop}
					time="4:20 PM"
				>
					Hello
				</Message>
			)
		);
		const message = root.querySelector('[data-slot="message"]');
		expect(message?.getAttribute("data-from")).toBe("user");
		expect(message?.getAttribute("data-align")).toBe("end");
		expect(root.querySelector('[data-slot="message-text"]')?.textContent).toBe(
			"Hello"
		);
		const actions = root.querySelector('[data-slot="message-actions"]');
		expect(actions?.querySelector("time")?.getAttribute("dateTime")).toBe(
			"2026-11-05T16:20:00+05:00"
		);
		expect(
			[...(actions?.querySelectorAll("button") ?? [])].map((button) =>
				button.getAttribute("aria-label")
			)
		).toEqual(["Copy message", "Edit message"]);
	});

	it("keeps a failed message with Not sent and Retry in view", () => {
		const root = render(
			renderToStaticMarkup(
				<Message from="user" onRetry={noop} status="failed" time="4:20 PM">
					Hello
				</Message>
			)
		);
		expect(
			root.querySelector('[data-slot="message"]')?.getAttribute("data-status")
		).toBe("failed");
		const error = root.querySelector('[data-slot="message-error"]');
		expect(error?.getAttribute("role")).toBe("alert");
		expect(error?.textContent).toBe("Not sent");
		const actions = root.querySelector('[data-slot="message-actions"]');
		// The time waits until the message is sent.
		expect(actions?.querySelector("time")).toBeNull();
		expect(
			[...(actions?.querySelectorAll("button") ?? [])].map(
				(button) => button.getAttribute("aria-label") ?? button.textContent
			)
		).toEqual(["Retry", "Copy message"]);
	});

	it("shows sent files as the composer's tiles above the bubble", () => {
		const root = render(
			renderToStaticMarkup(
				<Message
					attachments={[
						{ name: "cover.jpg", preview: "/cover.jpg" },
						{ href: "/report.csv", name: "report.csv" },
					]}
					from="user"
				>
					Summarize this.
				</Message>
			)
		);
		const files = root.querySelector('[data-slot="message-attachments"]');
		expect(files?.getAttribute("aria-label")).toBe("Attachments");
		const tiles = files?.querySelectorAll('[data-slot="composer-attachment"]');
		expect(
			[...(tiles ?? [])].map((tile) => tile.getAttribute("title"))
		).toEqual(["cover.jpg", "report.csv"]);
		// An image opens in place; a file with an href opens as a link.
		expect(tiles?.[0]?.querySelector("button")?.textContent).toBe("cover.jpg");
		expect(tiles?.[1]?.querySelector("a")?.getAttribute("href")).toBe(
			"/report.csv"
		);
	});

	it("shows Edit only with a handler, and names the sender in group chats", () => {
		const root = render(
			renderToStaticMarkup(
				<Message
					align="start"
					author="Maya Chen"
					avatar={<span>MC</span>}
					from="user"
				>
					Hi
				</Message>
			)
		);
		expect(
			root.querySelector('[data-slot="message"]')?.getAttribute("data-align")
		).toBe("start");
		expect(
			root.querySelector('[data-slot="message-author"]')?.textContent
		).toBe("Maya Chen");
		expect(
			root.querySelector('[data-slot="message-avatar"]')?.textContent
		).toBe("MC");
		expect(root.querySelector('[aria-label="Edit message"]')).toBeNull();
	});

	it("holds the agent's parts without a bubble or actions", () => {
		const root = render(
			renderToStaticMarkup(
				<Message from="agent">
					<p>Thinking</p>
					<p>Reply</p>
				</Message>
			)
		);
		expect(
			root.querySelector('[data-slot="message"]')?.getAttribute("data-from")
		).toBe("agent");
		expect(root.querySelector('[data-slot="message-bubble"]')).toBeNull();
		expect(root.querySelector('[data-slot="message-actions"]')).toBeNull();
		expect(root.querySelectorAll("p")).toHaveLength(2);
	});
});
