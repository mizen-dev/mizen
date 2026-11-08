// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationFooter,
} from "../../../packages/ui/src/components/conversation/conversation";
import { Message } from "../../../packages/ui/src/components/message/message";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerViewport,
} from "../../../packages/ui/src/components/message-scroller/message-scroller";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

function render(markup: string) {
	const container = document.createElement("div");
	container.innerHTML = markup;
	return container;
}

describe("Message Scroller", () => {
	it("is a focusable region around a live log, with a jump button", () => {
		const root = render(
			renderToStaticMarkup(
				<MessageScroller>
					<MessageScrollerViewport>
						<MessageScrollerContent busy>
							<MessageScrollerItem messageId="a" scrollAnchor>
								Hi
							</MessageScrollerItem>
							<MessageScrollerItem messageId="b">Hello</MessageScrollerItem>
						</MessageScrollerContent>
					</MessageScrollerViewport>
					<MessageScrollerButton />
				</MessageScroller>
			)
		);
		const region = root.querySelector("[role=region]");
		expect(region?.getAttribute("aria-label")).toBe("Messages");
		expect(region?.getAttribute("tabindex")).toBe("0");
		const log = root.querySelector('[role="log"]');
		expect(log?.getAttribute("aria-relevant")).toBe("additions");
		expect(log?.getAttribute("aria-busy")).toBe("true");
		const items = root.querySelectorAll("[data-message-id]");
		expect(
			[...items].map((item) => item.getAttribute("data-scroll-anchor"))
		).toEqual(["true", "false"]);
		// At the end there is nothing to jump to, so the button is inert.
		const button = root.querySelector("button");
		expect(button?.getAttribute("aria-label")).toBe("Jump to latest");
		expect(button?.hasAttribute("inert")).toBe(true);
	});
});

describe("Conversation", () => {
	it("wraps keyed turns as items and anchors the person's own messages", () => {
		const root = render(
			renderToStaticMarkup(
				<Conversation>
					<ConversationContent>
						<Message from="user" key="q1">
							Why does Card break?
						</Message>
						<Message from="agent" key="a1">
							It reads the viewport.
						</Message>
					</ConversationContent>
					<ConversationFooter>composer</ConversationFooter>
				</Conversation>
			)
		);
		const items = [...root.querySelectorAll("[data-message-id]")];
		expect(items.map((item) => item.getAttribute("data-message-id"))).toEqual([
			"q1",
			"a1",
		]);
		expect(
			items.every((item) => item.getAttribute("data-scroll-anchor") === "auto")
		).toBe(true);
		expect(
			root.querySelector("[role=region]")?.getAttribute("aria-label")
		).toBe("Conversation");
		expect(
			root.querySelector('[data-slot="conversation-footer"]')?.textContent
		).toBe("composer");
	});

	it("shows the empty state only before the first turn", () => {
		const empty = render(
			renderToStaticMarkup(
				<Conversation>
					<ConversationContent>
						<ConversationEmptyState title="What should we build?" />
					</ConversationContent>
				</Conversation>
			)
		);
		expect(empty.querySelector("h2")?.textContent).toBe(
			"What should we build?"
		);
		const started = render(
			renderToStaticMarkup(
				<Conversation>
					<ConversationContent>
						<ConversationEmptyState title="What should we build?" />
						<Message from="user" key="q1">
							Hi
						</Message>
					</ConversationContent>
				</Conversation>
			)
		);
		expect(started.querySelector("h2")).toBeNull();
	});
});
