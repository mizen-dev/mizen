// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import { InlineCitation } from "../../../packages/ui/src/components/inline-citation/inline-citation";
import { toTokens } from "../../../packages/ui/src/components/streaming-text/streaming-text-words";

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
	return container.querySelector('[data-slot="inline-citation"]');
}

describe("InlineCitation contract", () => {
	it("links one source by its domain, naming the title for screen readers", () => {
		const chip = render(
			renderToStaticMarkup(
				<InlineCitation
					sources={[{ href: "https://www.docs.vendor.dev/a", title: "Guide" }]}
				/>
			)
		);
		expect(chip?.tagName).toBe("A");
		expect(chip?.getAttribute("href")).toBe("https://www.docs.vendor.dev/a");
		expect(chip?.getAttribute("rel")).toBe("noopener noreferrer");
		expect(chip?.textContent).toBe(
			"docs.vendor.dev, Guide, opens in a new tab"
		);
	});

	it("shows several sources as one chip with a count that opens a list", () => {
		const chip = render(
			renderToStaticMarkup(
				<InlineCitation
					sources={[
						{ href: "https://a.dev/x" },
						{ href: "https://b.dev/y" },
						{ href: "https://a.dev/x" },
					]}
				/>
			)
		);
		expect(chip?.tagName).toBe("BUTTON");
		// Repeats count once.
		expect(chip?.textContent).toBe("a.dev +1, 2 sources");
		expect(chip?.getAttribute("aria-haspopup")).toBe("dialog");
	});

	it("shows a document by its title, with nothing to open", () => {
		const chip = render(
			renderToStaticMarkup(<InlineCitation sources={[{ title: "Plan.pdf" }]} />)
		);
		expect(chip?.tagName).toBe("SPAN");
		expect(chip?.textContent).toBe("Plan.pdf");
	});

	it("groups citations at one point in a streamed reply", () => {
		expect(toTokens("Shipped.[1][2] Then [3].", 3)).toEqual([
			{ kind: "word", text: "Shipped." },
			{ kind: "citation", sources: [0, 1] },
			{ kind: "word", text: " " },
			{ kind: "word", text: "Then " },
			{ kind: "citation", sources: [2] },
			{ kind: "word", text: "." },
		]);
		expect(toTokens("A [1] [2] B", 2)).toEqual([
			{ kind: "word", text: "A " },
			{ kind: "citation", sources: [0, 1] },
			{ kind: "word", text: " " },
			{ kind: "word", text: "B" },
		]);
	});
});
