// biome-ignore-all lint/performance/noAwaitInLoops: Review sequentially to keep browser memory bounded.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const registry = JSON.parse(
	await readFile(
		new URL(
			"../src/entities/documentation/model/docs-registry-data.json",
			import.meta.url
		),
		"utf8"
	)
);
const components = process.env.MIZEN_CAPTURE_SLUGS
	? registry.filter(({ slug }) =>
			process.env.MIZEN_CAPTURE_SLUGS.split(",").includes(slug)
		)
	: registry;
const directory =
	process.env.MIZEN_CAPTURE_DIR ?? "/private/tmp/mizen-preview-consistency";
await mkdir(directory, { recursive: true });
// Overlays render in portals: open the main preview's trigger and capture the
// viewport. Hover cards and tooltips open on hover, context menus on a
// right-click, everything else on a click.
const HOVER_OPENED = new Set(["preview-card", "tooltip"]);
async function captureOpen(page, preview, slug, path) {
	const trigger = preview
		.locator(
			"[data-slot$='-trigger'], [aria-haspopup], [aria-expanded], button"
		)
		.first();
	if ((await trigger.count()) === 0) {
		return;
	}
	if (HOVER_OPENED.has(slug)) {
		await trigger.hover();
	} else {
		await trigger.click({ button: slug === "context-menu" ? "right" : "left" });
	}
	// Hover cards open after a delay; then wait for their entry animation.
	await page.waitForTimeout(800);
	await page.waitForFunction(() =>
		document
			.getAnimations()
			.every((animation) => animation.playState !== "running")
	);
	await page.screenshot({
		caret: "initial",
		path,
		style:
			"header:has(nav[aria-label='Site navigation']), nextjs-portal { visibility: hidden; }",
	});
	await page.keyboard.press("Escape");
	await page.mouse.move(0, 0);
	await page.waitForTimeout(300);
}

const browser = await chromium.launch();
const results = [];
try {
	for (const theme of ["light", "dark"]) {
		const context = await browser.newContext({
			viewport: { height: 1000, width: 1440 },
		});
		await context.addInitScript(
			(value) => localStorage.setItem("mizen-theme", value),
			theme
		);
		const page = await context.newPage();
		for (const { slug } of components) {
			const errors = [];
			const recordError = (error) => errors.push(error.message);
			page.on("pageerror", recordError);
			await page.goto(
				`${process.env.MIZEN_DOCS_TEST_URL ?? "http://localhost:3000"}/docs/components/${slug}`,
				{ waitUntil: "networkidle" }
			);
			const preview = page.locator("[data-slot=component-preview]").first();
			await page.evaluate(async (family) => {
				await document.fonts.ready;
				if (family) {
					document.body.style.fontFamily = family;
				}
			}, process.env.MIZEN_CAPTURE_FONT);
			await preview.screenshot({
				caret: "initial",
				path: `${directory}/${theme}-${slug}.png`,
				style:
					"header:has(nav[aria-label='Site navigation']), nextjs-portal { visibility: hidden; }",
			});
			await page.setViewportSize({ height: 900, width: 320 });
			await page.evaluate(
				() =>
					new Promise((resolve) => {
						requestAnimationFrame(() => requestAnimationFrame(resolve));
					})
			);
			const narrow = await page.evaluate(() => ({
				viewport: innerWidth,
				width: document.documentElement.scrollWidth,
			}));
			const previewWidths = await preview.evaluate((element) => ({
				content: element.scrollWidth,
				visible: element.clientWidth,
				visibleContent: Boolean(
					element.firstElementChild?.getBoundingClientRect().height
				),
			}));
			if (process.env.MIZEN_CAPTURE_NARROW === "true") {
				await preview.screenshot({
					caret: "initial",
					path: `${directory}/${theme}-${slug}-narrow.png`,
					style:
						"header:has(nav[aria-label='Site navigation']), nextjs-portal { visibility: hidden; }",
				});
			}
			if (process.env.MIZEN_CAPTURE_OPEN === "true") {
				await page.setViewportSize({ height: 1000, width: 1440 });
				await preview.scrollIntoViewIfNeeded();
				await captureOpen(
					page,
					preview,
					slug,
					`${directory}/${theme}-${slug}-open.png`
				);
			}
			if (process.env.MIZEN_CAPTURE_EXAMPLES === "true") {
				await page.setViewportSize({ height: 1000, width: 1440 });
				const examples = page.locator("[data-slot=usage-preview]");
				const count = await examples.count();
				for (let index = 0; index < count; index += 1) {
					await examples.nth(index).screenshot({
						caret: "initial",
						path: `${directory}/${theme}-${slug}-example-${index + 1}.png`,
						style:
							"header:has(nav[aria-label='Site navigation']), nextjs-portal { visibility: hidden; }",
					});
				}
			}
			results.push({ errors, narrow, previewWidths, slug, theme });
			page.off("pageerror", recordError);
			await page.setViewportSize({ height: 1000, width: 1440 });
			console.log(theme, slug, errors.length ? errors : "captured");
		}
		await context.close();
	}
} finally {
	await browser.close();
	await writeFile(
		`${directory}/results.json`,
		JSON.stringify(results, null, 2)
	);
}

for (const { errors, narrow, previewWidths, slug, theme } of results) {
	const label = `${slug} (${theme})`;
	assert.equal(errors.length, 0, `${label}: browser errors`);
	assert.ok(narrow.width <= narrow.viewport, `${label}: page overflow`);
	assert.ok(
		previewWidths.content <= previewWidths.visible + 1,
		`${label}: preview overflow`
	);
	assert.ok(previewWidths.visibleContent, `${label}: empty preview`);
}
