// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	StreamingText,
	type StreamingTextPart,
	type StreamingTextSource,
} from "../../../packages/ui/src/components/streaming-text/streaming-text";
import {
	plainText,
	toTokens,
} from "../../../packages/ui/src/components/streaming-text/streaming-text-words";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const sources: readonly StreamingTextSource[] = [
	{
		href: "https://www.analytics.example.com/checkout",
		title: "Checkout funnel",
	},
];
const content: readonly StreamingTextPart[] = [
	"Conversion rose 4.2%.",
	{ source: 0 },
	" Mobile led the gain.",
];

const noop = () => undefined;

function render(markup: string) {
	const container = document.createElement("div");
	container.innerHTML = markup;
	return container;
}

describe("StreamingText contract", () => {
	it("splits words with their spaces and copies text without citations", () => {
		expect(toTokens("Two words\nnext")).toEqual([
			{ kind: "word", text: "Two " },
			{ kind: "word", text: "words\n" },
			{ kind: "word", text: "next" },
		]);
		expect(
			toTokens(content).filter((token) => token.kind === "citation")
		).toEqual([{ kind: "citation", sources: [0] }]);
		expect(plainText(content)).toBe(
			"Conversion rose 4.2%. Mobile led the gain."
		);
	});

	it("streams as a busy reply with an inert action row", () => {
		const root = render(
			renderToStaticMarkup(
				<StreamingText content={content} sources={sources} status="streaming" />
			)
		);
		const reply = root.querySelector('[data-slot="streaming-text-content"]');
		expect(reply?.getAttribute("aria-busy")).toBe("true");
		expect(
			root
				.querySelector('[data-slot="streaming-text-actions"]')
				?.hasAttribute("inert")
		).toBe(true);
		const citation = root.querySelector('[data-slot="inline-citation"]');
		// The chip shows the domain; its name adds the title and the new tab.
		expect(citation?.textContent).toContain("analytics.example.com");
		expect(citation?.textContent).toContain(
			"Checkout funnel, opens in a new tab"
		);
		expect(citation?.getAttribute("rel")).toBe("noopener noreferrer");
		expect(root.textContent).not.toContain("Follow-ups");
	});

	it("offers only the actions the caller handles once complete", () => {
		const plain = render(
			renderToStaticMarkup(<StreamingText content="Done." status="complete" />)
		);
		expect(
			plain
				.querySelector('[data-slot="streaming-text-content"]')
				?.hasAttribute("aria-busy")
		).toBe(false);
		expect(
			plain
				.querySelector('[data-slot="streaming-text-actions"]')
				?.hasAttribute("inert")
		).toBe(false);
		expect(
			[...plain.querySelectorAll("button")].map((button) =>
				button.getAttribute("aria-label")
			)
		).toEqual(["Copy response"]);

		const full = render(
			renderToStaticMarkup(
				<StreamingText
					content={content}
					feedback="up"
					followUps={["Break it down by country"]}
					onFeedback={noop}
					onFollowUp={noop}
					onRetry={noop}
					sources={sources}
					status="complete"
				/>
			)
		);
		const labels = [...full.querySelectorAll("button")].map(
			(button) => button.getAttribute("aria-label") ?? button.textContent
		);
		// Sources follow the text; the actions come after them.
		expect(labels).toEqual([
			"Used 1 source",
			"Copy response",
			"Retry",
			"Good response",
			"Bad response",
			"Break it down by country",
		]);
		expect(
			full
				.querySelector('[aria-label="Good response"]')
				?.getAttribute("aria-pressed")
		).toBe("true");
		expect(
			full
				.querySelector('[aria-label="Bad response"]')
				?.getAttribute("aria-pressed")
		).toBe("false");
	});

	it("shows each site's own icon, an explicit icon, or a globe", () => {
		const root = render(
			renderToStaticMarkup(
				<StreamingText
					content={[
						"A.",
						{ source: 0 },
						" B.",
						{ source: 1 },
						" C.",
						{ source: 2 },
					]}
					sources={[
						{ href: "https://docs.vendor.dev/guide", title: "Guide" },
						{
							href: "https://notes.vendor.dev/a",
							icon: "/icons/notes.png",
							title: "Notes",
						},
						{ href: "https://analytics.example.com/a", title: "Reserved" },
					]}
					status="streaming"
				/>
			)
		);
		const chips = [...root.querySelectorAll('[data-slot="inline-citation"]')];
		const icon = (index: number) => chips[index]?.querySelector("img");
		// The site's own icon, sent without a referrer, so no third party is asked.
		expect(icon(0)?.getAttribute("src")).toBe(
			"https://docs.vendor.dev/favicon.ico"
		);
		expect(icon(0)?.getAttribute("referrerpolicy")).toBe("no-referrer");
		expect(icon(1)?.getAttribute("src")).toBe("/icons/notes.png");
		// Reserved example domains never resolve, so they skip the request.
		expect(icon(2)).toBeNull();
		expect(chips[2]?.querySelector("svg")).not.toBeNull();
	});

	it("holds back a word that may still be growing until the stream confirms it", () => {
		const text = (status: "complete" | "streaming") =>
			render(
				renderToStaticMarkup(
					<StreamingText content="Hello wor" status={status} />
				)
			).querySelector('[data-slot="streaming-text-content"]')?.textContent;
		// "wor" may become "world", so it waits for a space or the end.
		expect(text("streaming")).toBe("Hello ");
		expect(text("complete")).toBe("Hello wor");
	});

	it("keeps a partial reply on error, with the actions and a stopped note", () => {
		const root = render(
			renderToStaticMarkup(
				<StreamingText
					content="Container queries style"
					followUps={["Show an example"]}
					onRetry={noop}
					status="error"
				/>
			)
		);
		expect(
			root.querySelector('[data-slot="streaming-text-content"]')?.textContent
		).toBe("Container queries style");
		expect(
			root.querySelector('[data-slot="streaming-text-error"]')?.textContent
		).toBe("The reply stopped before it finished.");
		expect(
			root.querySelector('[role="status"][aria-live="polite"]')
		).not.toBeNull();
		expect(
			root
				.querySelector('[data-slot="streaming-text-actions"]')
				?.hasAttribute("inert")
		).toBe(false);
		expect(root.querySelector('[aria-label="Retry"]')).not.toBeNull();
		// Follow-ups assume a finished answer.
		expect(root.textContent).not.toContain("Show an example");
	});

	it("shows a source while streaming only once the reply cites it", () => {
		const sourceList: readonly StreamingTextSource[] = [
			{ href: "https://docs.vendor.dev/a", title: "Guide" },
			{ href: "https://docs.vendor.dev/b", title: "Notes" },
		];
		const before = render(
			renderToStaticMarkup(
				<StreamingText
					content="Size queries"
					sources={sourceList}
					status="streaming"
				/>
			)
		);
		expect(before.querySelector('[data-slot="sources"]')).toBeNull();
		const cited = render(
			renderToStaticMarkup(
				<StreamingText
					content={["Size queries shipped.", { source: 1 }]}
					sources={sourceList}
					status="streaming"
				/>
			)
		);
		expect(
			cited.querySelector('[data-slot="sources"] button')?.textContent
		).toBe("Used 1 source");
		// Once complete, sources the reply never cited join the list.
		const complete = render(
			renderToStaticMarkup(
				<StreamingText
					content={["Size queries shipped.", { source: 1 }]}
					sources={sourceList}
					status="complete"
				/>
			)
		);
		expect(
			complete.querySelector('[data-slot="sources"] button')?.textContent
		).toBe("Used 2 sources");
	});

	it("labels sources by domain or title, and shows documents as text", () => {
		const root = render(
			renderToStaticMarkup(
				<StreamingText
					content={["A.", { source: 0 }, " B.", { source: 1 }]}
					sources={[
						{ href: "https://www.docs.vendor.dev/a" },
						{ title: "Q3 plan.pdf" },
					]}
					status="complete"
				/>
			)
		);
		const [link, document] = root.querySelectorAll(
			'[data-slot="inline-citation"]'
		);
		expect(link?.tagName).toBe("A");
		// No title: the domain names it, without repeating itself.
		expect(link?.textContent).toBe("docs.vendor.dev, opens in a new tab");
		expect(document?.tagName).toBe("SPAN");
		expect(document?.textContent).toBe("Q3 plan.pdf");
	});

	it("turns [n] markers into citations when the source exists", () => {
		const sourceList: readonly StreamingTextSource[] = [
			{ href: "https://docs.vendor.dev/a", title: "Guide" },
		];
		const root = render(
			renderToStaticMarkup(
				<StreamingText
					content="Size queries shipped.[1] See note [9]."
					sources={sourceList}
					status="complete"
				/>
			)
		);
		expect(root.querySelectorAll('[data-slot="inline-citation"]')).toHaveLength(
			1
		);
		// [9] has no source, so it stays text.
		expect(root.textContent).toContain("See note [9].");
		expect(plainText("Shipped.[1] Note [9].", 1)).toBe("Shipped. Note [9].");
		// A marker split across chunks waits, like a partial word.
		const partial = render(
			renderToStaticMarkup(
				<StreamingText
					content="Size queries shipped.[1"
					sources={sourceList}
					status="streaming"
				/>
			)
		);
		expect(
			partial.querySelector('[data-slot="streaming-text-content"]')?.textContent
		).toBe("Size queries ");
	});

	it("protects its slot, role, and styling", () => {
		const markup = renderToStaticMarkup(
			<StreamingText
				{...({
					className: "custom",
					"data-slot": "custom",
					role: "log",
					style: { color: "red" },
				} as object)}
				content="Done."
				status="complete"
			/>
		);
		expect(markup).toContain('data-slot="streaming-text"');
		expect(markup).toContain('data-status="complete"');
		expect(markup).not.toContain("custom");
		expect(markup).not.toContain('role="log"');
		expect(markup).not.toContain("color:red");
	});
});
