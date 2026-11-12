import { type Browser, chromium, type Page } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const errors: string[] = [];
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("Table", { timeout: 30_000 }, () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		await teardownTestServer(handle);
		expect(errors).toEqual([]);
	});

	it("uses native headers, a caption, readable type, and aligned figures", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const table = page.locator(
			'[aria-labelledby="table-heading"] [data-slot="table"]'
		);
		await expectLocator(table.locator("caption")).toBeVisible();
		await expectLocator(table.locator('thead th[scope="col"]')).toHaveCount(13);
		expect(
			await table.locator('tbody th[scope="row"]').count()
		).toBeGreaterThanOrEqual(20);
		await expectLocator(table).not.toHaveAttribute("role");
		const rowHeights = await table
			.locator("tbody tr")
			.evaluateAll((rows) =>
				rows.map((row) => row.getBoundingClientRect().height)
			);
		expect(Math.max(...rowHeights) - Math.min(...rowHeights)).toBeLessThan(1);
		const metrics = await table
			.locator("tbody td")
			.first()
			.evaluate((element) => {
				const styles = getComputedStyle(element);
				return {
					alignment: styles.textAlign,
					figures: styles.fontVariantNumeric,
					size: styles.fontSize,
					weight: styles.fontWeight,
				};
			});
		expect(metrics).toEqual({
			alignment: "end",
			figures: "tabular-nums",
			size: "14px",
			weight: "400",
		});
	});

	it("scrolls by keyboard while keeping the column and row headers anchored", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const container = page.locator(
			'[aria-labelledby="table-heading"] [data-slot="table-container"]'
		);
		await container.scrollIntoViewIfNeeded();
		await container.focus();
		await expectLocator(container).toBeFocused();
		const head = container.locator("thead th").first();
		const rowHead = container.locator("tbody th").first();
		const initialHead = await head.boundingBox();
		const initialRow = await rowHead.boundingBox();
		await page.keyboard.press("ArrowRight");
		await expectLocator
			.poll(() => container.evaluate((element) => element.scrollLeft))
			.toBeGreaterThan(0);
		await container.evaluate((element) => {
			element.scrollTop = 160;
			element.scrollLeft = 240;
		});
		const scrolledHead = await head.boundingBox();
		const scrolledRow = await rowHead.boundingBox();
		expect(
			await head.evaluate((element) => {
				const bounds = element.getBoundingClientRect();
				return (
					document
						.elementFromPoint(
							bounds.x + bounds.width / 2,
							bounds.y + bounds.height / 2
						)
						?.closest("thead") === element.closest("thead")
				);
			})
		).toBe(true);
		expect(
			Math.abs((initialHead?.y ?? 0) - (scrolledHead?.y ?? 0))
		).toBeLessThan(2);
		expect(Math.abs((initialRow?.x ?? 0) - (scrolledRow?.x ?? 0))).toBeLessThan(
			2
		);
		expect(
			await container.evaluate(
				(element) =>
					element.scrollHeight > element.clientHeight &&
					element.scrollWidth > element.clientWidth
			)
		).toBe(true);
	});

	it.each(["light", "dark"] as const)(
		"keeps sticky cells opaque while scrolling in %s mode",
		async (theme) => {
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.addInitScript(
				(preference) => localStorage.setItem("mizen-theme", preference),
				theme
			);
			await page.goto(`${handle.url}/components/table`, {
				waitUntil: "networkidle",
			});
			const container = page.getByRole("region", {
				exact: true,
				name: "2026 monthly operating budget by cost category",
			});
			await container.scrollIntoViewIfNeeded();
			await page.mouse.move(0, 0);
			await container.evaluate((element) => {
				element.scrollLeft = 240;
				element.scrollTop = 120;
			});
			await Promise.all(
				["thead", "tbody", "tfoot"].map(async (group) => {
					const section = container.locator(group);
					const surface = await section.evaluate(
						(element) => getComputedStyle(element).backgroundColor
					);
					await expectLocator(section.locator("th").first()).toHaveCSS(
						"background-color",
						surface
					);
					expect(surface).not.toBe("rgba(0, 0, 0, 0)");
				})
			);
			// The cells paint the hover band, so the sticky cell stays opaque.
			const row = container.locator("tbody tr").nth(4);
			const sticky = row.locator("th");
			const fill = (element: Element) =>
				getComputedStyle(element).backgroundColor;
			const restSurface = await sticky.evaluate(fill);
			await sticky.hover();
			await expectLocator(sticky).not.toHaveCSS(
				"background-color",
				restSurface
			);
			const hoverSurface = await sticky.evaluate(fill);
			await expectLocator(row.locator("td").first()).toHaveCSS(
				"background-color",
				hoverSurface
			);
			expect(hoverSurface).not.toBe("rgba(0, 0, 0, 0)");
			await container.screenshot({
				caret: "initial",
				path: `/private/tmp/mizen-table-scroll-${theme}.png`,
			});
		}
	);

	it("paints selected rows that touch as one band with rounded ends", async () => {
		await page.setViewportSize({ height: 900, width: 1280 });
		await page.goto(`${handle.url}/components/table`, {
			waitUntil: "networkidle",
		});
		const region = page.getByRole("region", {
			exact: true,
			name: "Open invoices",
		});
		await region.scrollIntoViewIfNeeded();
		await page.mouse.move(0, 0);
		const rows = region.locator("tbody tr");
		// Reads the look of every body row; the result returns one row by index.
		const band = async () => {
			const looks = await rows.evaluateAll((elements) =>
				elements.map((element) => {
					const first = getComputedStyle(element.firstElementChild as Element);
					const last = getComputedStyle(element.lastElementChild as Element);
					return {
						bottom: [first.borderEndStartRadius, last.borderEndEndRadius],
						fill: first.backgroundColor,
						rule: first.borderBlockEndColor,
						top: [first.borderStartStartRadius, last.borderStartEndRadius],
					};
				})
			);
			return (index: number) => {
				const look = looks[index];
				if (!look) {
					throw new Error(`The table has no row ${index}`);
				}
				return look;
			};
		};
		const square = ["0px", "0px"];
		const clear = "rgba(0, 0, 0, 0)";

		const rest = await band();
		const round = rest(1).top;
		expect(round).not.toEqual(square);
		expect(rest(1).fill).toBe(rest(2).fill);
		expect(rest(1).fill).not.toBe(rest(3).fill);
		expect(rest(1).bottom).toEqual(square);
		expect(rest(2).top).toEqual(square);
		expect(rest(2).bottom).toEqual(round);
		expect(rest(3).top).toEqual(square);
		// The band's edge replaces the rules above and below it.
		expect([rest(0).rule, rest(2).rule]).toEqual([clear, clear]);
		expect(rest(1).rule).not.toBe(clear);

		await rows.nth(4).hover();
		const hovered = (await band())(4);
		expect([hovered.top, hovered.bottom]).toEqual([round, round]);
		expect([rest(3).fill, rest(1).fill]).not.toContain(hovered.fill);

		await page.mouse.move(0, 0);
		await region.getByRole("checkbox", { name: "Select INV-1045" }).click();
		await page.mouse.move(0, 0);
		const grown = await band();
		expect(grown(2).bottom).toEqual(square);
		expect(grown(3).fill).toBe(rest(1).fill);
		expect(grown(3).bottom).toEqual(round);
	});

	it("keeps words whole inside a container that breaks words anywhere", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const table = page
			.locator('[data-slot="table"]', { hasText: "BUD-00001" })
			.first();
		await table.scrollIntoViewIfNeeded();
		const found = await table.evaluate((element) => {
			const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
			const broken: string[] = [];
			for (let node = walker.nextNode(); node; node = walker.nextNode()) {
				const text = node.textContent?.trim() ?? "";
				const range = document.createRange();
				range.selectNodeContents(node);
				if (text && !text.includes(" ") && range.getClientRects().length > 1) {
					broken.push(text);
				}
			}
			return {
				broken: [...new Set(broken)],
				inherited: getComputedStyle(element.parentElement ?? element)
					.overflowWrap,
			};
		});
		expect(found).toEqual({ broken: [], inherited: "anywhere" });
	});

	it("freezes the logical start column in right-to-left layouts", async () => {
		await page.goto(`${handle.url}/internal/specimens`, {
			waitUntil: "networkidle",
		});
		const container = page.locator(
			'[aria-labelledby="table-heading"] [data-slot="table-container"]'
		);
		await container.evaluate((element) => element.setAttribute("dir", "rtl"));
		await container.scrollIntoViewIfNeeded();
		const rowHead = container.locator("tbody th").first();
		const initial = await rowHead.boundingBox();
		await container.evaluate((element) => {
			element.scrollLeft = -240;
		});
		expect(
			await container.evaluate((element) => element.scrollLeft)
		).toBeLessThan(0);
		const scrolled = await rowHead.boundingBox();
		expect(Math.abs((initial?.x ?? 0) - (scrolled?.x ?? 0))).toBeLessThan(2);
	});

	describe.each(["light", "dark"] as const)("%s theme", (theme) => {
		it(`contains ${theme} data on a narrow screen with enlarged text`, async () => {
			await page.setViewportSize({ height: 900, width: 1280 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.addInitScript(
				(preference) => localStorage.setItem("mizen-theme", preference),
				theme
			);
			await page.goto(`${handle.url}/internal/specimens`, {
				waitUntil: "networkidle",
			});
			const container = page.locator(
				'[aria-labelledby="table-heading"] [data-slot="table-container"]'
			);
			await container.screenshot({
				caret: "initial",
				path: `/private/tmp/mizen-table-${theme}.png`,
			});
			await page.setViewportSize({ height: 900, width: 390 });
			await page.addStyleTag({
				content:
					"html {font-size:32px !important} * {line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}",
			});
			await container.scrollIntoViewIfNeeded();
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= innerWidth
				)
			).toBe(true);
			await expectLocator(container.locator("tbody th").first()).toBeVisible();
			await container.evaluate((element) => {
				element.scrollTop = element.scrollHeight;
				element.scrollLeft = element.scrollWidth;
			});
			await expectLocator(
				container.locator("tfoot td").last()
			).toBeInViewport();
			await container.screenshot({
				caret: "initial",
				path: `/private/tmp/mizen-table-enlarged-${theme}.png`,
			});
		});
	});
});
