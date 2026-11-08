import { readFileSync, writeFileSync } from "node:fs";
import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import registry from "../app/docs-registry-data.json" with { type: "json" };
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

// Measures the design contract on every component page. Known violations live
// in a baseline that only shrinks: a new violation fails, and a fixed one must
// be removed by rerunning with UPDATE_DESIGN_BASELINE=1.

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const baselinePath = new URL("./design-contract-baseline.json", import.meta.url)
	.pathname;
const PREVIEWS = '[data-slot="component-preview"], [data-slot="usage-preview"]';
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

type Counts = Record<string, number>;

// Runs in the page. Each check returns "rule :: where" strings.
function measureContract(previewSelector: string): string[] {
	const CONTROL_HEIGHTS = [24, 28, 32, 36, 40, 44];
	const GLYPHS = [12, 14, 16, 18, 20];
	const previews = [...document.querySelectorAll(previewSelector)];
	const all = previews.flatMap((preview) => [
		...preview.querySelectorAll<HTMLElement>("*"),
	]);

	function where(element: Element) {
		const slots: string[] = [];
		let node: Element | null = element;
		while (node && slots.length < 2) {
			const slot = node.getAttribute("data-slot");
			if (slot && !slots.includes(slot)) {
				slots.unshift(slot);
			}
			node = node.parentElement;
		}
		return slots.join(" > ") || element.tagName.toLowerCase();
	}

	function rgb(color: string): [number, number, number, number] {
		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		const context = canvas.getContext("2d");
		if (!context) {
			return [0, 0, 0, 0];
		}
		context.fillStyle = color;
		context.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
		return [r, g, b, a / 255];
	}

	function luminance([r, g, b]: [number, number, number, number]) {
		const linear = [r, g, b].map((value) => {
			const channel = value / 255;
			return channel <= 0.039_28
				? channel / 12.92
				: ((channel + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
	}

	// Press surfaces paint on ::before, so it counts as the element's fill.
	function fillOf(node: Element) {
		const own = rgb(getComputedStyle(node).backgroundColor);
		return own[3] > 0.9
			? own
			: rgb(getComputedStyle(node, "::before").backgroundColor);
	}

	function backgroundOf(element: Element) {
		let node: Element | null = element;
		while (node) {
			const color = fillOf(node);
			if (color[3] > 0.9) {
				return color;
			}
			node = node.parentElement;
		}
		return rgb(getComputedStyle(document.body).backgroundColor);
	}

	function isHidden(element: Element) {
		const style = getComputedStyle(element);
		const box = element.getBoundingClientRect();
		return (
			style.visibility === "hidden" ||
			Number(style.opacity) < 0.6 ||
			box.width < 2 ||
			box.height < 2 ||
			element.closest('[aria-disabled="true"], :disabled, [data-disabled]') !==
				null
		);
	}

	function contrast(element: HTMLElement): string[] {
		const hasText = [...element.childNodes].some(
			(node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
		);
		if (
			!hasText ||
			isHidden(element) ||
			element.closest("svg, [data-slot='chart-data']")
		) {
			return [];
		}
		const style = getComputedStyle(element);
		const size = Number.parseFloat(style.fontSize);
		const large =
			size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
		const foreground = luminance(rgb(style.color));
		const background = luminance(backgroundOf(element));
		const ratio =
			(Math.max(foreground, background) + 0.05) /
			(Math.min(foreground, background) + 0.05);
		return ratio < (large ? 3 : 4.5) ? [`contrast :: ${where(element)}`] : [];
	}

	// A control inside a bordered group (input group, number field) takes its
	// height from the group, so the group is what gets measured.
	// Controls below the smallest control height by design, each with an
	// equivalent path: scrolling reaches every turn on the rail.
	const SHORT_CONTROLS = '[data-slot="message-scroller-navigation"]';

	function inGroup(element: Element) {
		const group = element.parentElement?.closest('[data-slot$="-group"]');
		if (!group || group.matches('[data-slot="button-group"]')) {
			return false;
		}
		const outer = group.getBoundingClientRect().height;
		return outer - element.getBoundingClientRect().height <= 4;
	}

	function controlHeight(element: HTMLElement): string[] {
		const isControl = element.matches(
			'button, [role="button"], [role="combobox"], select, input:not([type="checkbox"], [type="radio"], [type="range"], [type="hidden"], [type="color"])'
		);
		if (
			!isControl ||
			isHidden(element) ||
			inGroup(element) ||
			element.closest(`svg, td, th, ${SHORT_CONTROLS}`)
		) {
			return [];
		}
		const height = Math.round(element.getBoundingClientRect().height);
		const fits = CONTROL_HEIGHTS.includes(height) || height > 44;
		return fits ? [] : [`control-height ${height} :: ${where(element)}`];
	}

	function glyphSize(element: HTMLElement): string[] {
		if (
			!(
				element instanceof SVGElement &&
				element.parentElement?.matches("button, a, [role='button']")
			)
		) {
			return [];
		}
		const size = Math.round(element.getBoundingClientRect().width);
		return size === 0 || GLYPHS.includes(size)
			? []
			: [`glyph ${size} :: ${where(element.parentElement)}`];
	}

	// Circles and pills are exempt: a radius of at least half the short side.
	function radiusOf(element: Element) {
		const value = getComputedStyle(element).borderTopLeftRadius;
		const box = element.getBoundingClientRect();
		const radius = Number.parseFloat(value) || 0;
		const round =
			value.endsWith("%") || radius >= Math.min(box.width, box.height) / 2 - 1;
		return round ? Number.POSITIVE_INFINITY : radius;
	}

	function isSurface(element: Element) {
		const style = getComputedStyle(element);
		return (
			rgb(style.backgroundColor)[3] > 0.5 || style.borderTopWidth !== "0px"
		);
	}

	// An inner surface near an outer corner may not be rounder than the outer
	// radius minus the inset between them.
	function isCornerCandidate(element: HTMLElement, radius: number) {
		return (
			radius >= 2 &&
			Number.isFinite(radius) &&
			isSurface(element) &&
			!isHidden(element)
		);
	}

	// Ancestors inside the preview only: the docs frame is not the component.
	function roundedAncestor(element: Element) {
		let parent = element.parentElement;
		while (
			parent &&
			!parent.matches(previewSelector) &&
			!(radiusOf(parent) >= 4 && isSurface(parent))
		) {
			parent = parent.parentElement;
		}
		if (parent?.matches(previewSelector)) {
			return null;
		}
		return parent && Number.isFinite(radiusOf(parent)) ? parent : null;
	}

	function nestedCorner(element: HTMLElement): string[] {
		const radius = radiusOf(element);
		const parent = isCornerCandidate(element, radius)
			? roundedAncestor(element)
			: null;
		if (!parent) {
			return [];
		}
		const outer = parent.getBoundingClientRect();
		const inner = element.getBoundingClientRect();
		const outerRadius = radiusOf(parent);
		const left = inner.left - outer.left;
		const right = outer.right - inner.right;
		const top = inner.top - outer.top;
		const bottom = outer.bottom - inner.bottom;
		// A corner is near only when both of its insets are small, and the inner
		// shape hugs it: under half the outer radius away. Farther in, the inner
		// element keeps its own radius. The tightest near corner sets the limit.
		const hugs = ([x, y]: number[]) =>
			Math.min(x, y) >= 0 &&
			Math.min(x, y) < outerRadius / 2 &&
			Math.max(x, y) < outerRadius;
		const near = [
			[left, top],
			[right, top],
			[left, bottom],
			[right, bottom],
		].filter(hugs);
		if (near.length === 0) {
			return [];
		}
		const limit =
			outerRadius - Math.max(...near.map(([x, y]) => Math.min(x, y)));
		return radius > limit + 1
			? [`nested-corner ${radius}>${Math.max(limit, 0)} :: ${where(element)}`]
			: [];
	}

	const found = all.flatMap((element) => [
		...contrast(element),
		...controlHeight(element),
		...glyphSize(element),
		...nestedCorner(element),
	]);
	const rawDisclosures = previews.flatMap((preview) => [
		...preview.querySelectorAll("details, summary"),
	]);
	return [
		...found,
		...rawDisclosures.map((element) => `raw-details :: ${where(element)}`),
	];
}

// Keyboard modality first, so element.focus() shows :focus-visible.
async function measureFocus(target: Page): Promise<string[]> {
	await target.keyboard.press("Tab");
	return target.evaluate((previewSelector) => {
		const focusables = [...document.querySelectorAll(previewSelector)]
			.flatMap((preview) => [
				...preview.querySelectorAll<HTMLElement>(
					'a[href], button:not(:disabled), input:not(:disabled, [type="hidden"]), select, textarea, [tabindex="0"]'
				),
			])
			// Only keyboard-reachable elements; steppers with tabindex -1 are not.
			.filter(
				(element) =>
					element.tabIndex >= 0 && element.getBoundingClientRect().width > 1
			)
			// A composer's draft is where typing always goes; its caret marks
			// focus (DESIGN_CONTRACT section 5).
			.filter((element) => !element.matches('[data-slot="composer-input"]'))
			.slice(0, 30);
		// A focus indication is any visible change on the element or its group:
		// an outline, a shadow, or a border color.
		const look = (node: Element) => {
			const style = getComputedStyle(node);
			return [
				style.outlineStyle,
				style.outlineWidth,
				style.outlineColor,
				style.boxShadow,
				style.borderColor,
			].join("|");
		};
		// The element and its ancestors up to the preview: a composite control
		// (a composer, an input group) may ring its root several levels up.
		const chain = (element: Element) => {
			const nodes: Element[] = [];
			let node: Element | null = element;
			while (node && !node.matches(previewSelector) && nodes.length < 8) {
				nodes.push(node);
				node = node.parentElement;
			}
			return nodes;
		};
		// A neutral sentinel holds keyboard focus between measurements, so every
		// element starts from the same resting state.
		const sentinel = document.createElement("button");
		sentinel.style.cssText = "position:fixed;inset-block-start:-100px";
		document.body.append(sentinel);
		return focusables.flatMap((element) => {
			sentinel.focus({ preventScroll: true });
			const before = chain(element).map(look);
			element.focus({ preventScroll: true });
			// Some widgets redirect focus (an OTP field to its first empty slot);
			// judge the element that actually holds focus.
			if (document.activeElement !== element) {
				return [];
			}
			const nodes = chain(element);
			const changed = nodes.some((node, index) => look(node) !== before[index]);
			const slot = element.closest("[data-slot]")?.getAttribute("data-slot");
			return changed
				? []
				: [`focus-ring :: ${slot ?? element.tagName.toLowerCase()}`];
		});
	}, PREVIEWS);
}

function tally(entries: string[]): Counts {
	const counts: Counts = {};
	for (const entry of entries) {
		counts[entry] = (counts[entry] ?? 0) + 1;
	}
	return counts;
}

describe("design contract", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		// Reduced motion skips the ring's fade-in, so focus styles read at once.
		await page.emulateMedia({ reducedMotion: "reduce" });
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
	}, 120_000);

	it("adds no violations beyond the shrinking baseline", async () => {
		const measured: Counts = {};
		for (const { slug } of registry) {
			const route = `/docs/components/${slug}`;
			// Hydrated pages only: some focus styles come from client state.
			// biome-ignore lint/performance/noAwaitInLoops: one page visits each route in turn.
			await page.goto(`${handle.url}${route}`, { waitUntil: "networkidle" });
			// Final styles only: transitions would make focus reads timing-dependent.
			await page.addStyleTag({
				content:
					"*, *::before, *::after { transition: none !important; animation: none !important; }",
			});
			const found = [
				...(await page.evaluate(measureContract, PREVIEWS)),
				...(await measureFocus(page)),
			];
			for (const [entry, count] of Object.entries(tally(found))) {
				measured[`${slug} | ${entry}`] = count;
			}
		}
		if (process.env.UPDATE_DESIGN_BASELINE) {
			writeFileSync(baselinePath, `${JSON.stringify(measured, null, 2)}\n`);
		}
		const baseline: Counts = JSON.parse(readFileSync(baselinePath, "utf8"));
		const added = Object.entries(measured)
			.filter(([key, count]) => count > (baseline[key] ?? 0))
			.map(
				([key, count]) => `${key} (${count}, baseline ${baseline[key] ?? 0})`
			);
		const fixed = Object.entries(baseline)
			.filter(([key, count]) => (measured[key] ?? 0) < count)
			.map(([key]) => key);
		expect(added, "New design-contract violations").toEqual([]);
		expect(
			fixed,
			"Fixed violations: rerun with UPDATE_DESIGN_BASELINE=1 to lock them in"
		).toEqual([]);
	}, 600_000);
});
