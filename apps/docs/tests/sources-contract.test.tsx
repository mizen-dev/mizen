// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	Sources,
	uniqueSources,
} from "../../../packages/ui/src/components/sources/sources";

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

describe("Sources contract", () => {
	it("folds into one line with the count, and lists nothing until opened", () => {
		const root = render(
			renderToStaticMarkup(
				<Sources
					sources={[
						{ href: "https://docs.vendor.dev/a", title: "Guide" },
						{ title: "Plan.pdf" },
					]}
				/>
			)
		);
		const trigger = root.querySelector("button");
		expect(trigger?.textContent).toBe("Used 2 sources");
		expect(trigger?.getAttribute("aria-expanded")).toBe("false");
		expect(root.querySelector('[data-slot="sources-list"]')).toBeNull();
	});

	it("opens to a link per page and plain text per document", () => {
		const root = render(
			renderToStaticMarkup(
				<Sources
					defaultOpen
					sources={[
						{ href: "https://docs.vendor.dev/a", title: "Guide" },
						{ title: "Plan.pdf" },
					]}
				/>
			)
		);
		const list = root.querySelector('[data-slot="sources-list"]');
		expect(list?.getAttribute("aria-label")).toBe("Sources");
		const link = list?.querySelector("a");
		expect(link?.getAttribute("href")).toBe("https://docs.vendor.dev/a");
		expect(link?.getAttribute("target")).toBe("_blank");
		expect(link?.textContent).toBe("Guidedocs.vendor.dev, opens in a new tab");
		expect(list?.querySelectorAll("li")[1]?.textContent).toBe("Plan.pdf");
	});

	it("drops repeats and renders nothing without sources", () => {
		expect(
			uniqueSources([
				{ href: "https://a.dev/x" },
				{ href: "https://a.dev/x" },
				{ title: "Plan.pdf" },
				{ title: "Plan.pdf" },
			])
		).toHaveLength(2);
		expect(renderToStaticMarkup(<Sources sources={[]} />)).toBe("");
		const one = render(
			renderToStaticMarkup(<Sources sources={[{ href: "https://a.dev/x" }]} />)
		);
		expect(one.querySelector("button")?.textContent).toBe("Used 1 source");
	});
});
