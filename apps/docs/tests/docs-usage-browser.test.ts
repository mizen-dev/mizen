import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const projectHeader = /Project/;
let handle: TestServerHandle;
let browser: Browser;
let page: Page;

describe("focused documentation interactions", () => {
	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage({ timezoneId: "America/Los_Angeles" });
	}, 120_000);

	afterAll(async () => {
		try {
			await browser?.close();
		} finally {
			await teardownTestServer(handle);
		}
	});

	it("expands controlled accordion panels", async () => {
		await page.goto(`${handle.url}/components/accordion`, {
			waitUntil: "networkidle",
		});
		const example = page.locator("#ControlledAccordion");
		await example.getByRole("button", { name: "Expand all" }).click();
		await expect
			.poll(() =>
				example
					.getByRole("button", { exact: true, name: "Access" })
					.getAttribute("aria-expanded")
			)
			.toBe("true");
		expect(
			await example
				.getByRole("button", { exact: true, name: "Billing" })
				.getAttribute("aria-expanded")
		).toBe("true");
	});

	it("closes the discard confirmation from either action", async () => {
		await page.goto(`${handle.url}/components/alert-dialog`, {
			waitUntil: "networkidle",
		});
		const example = page.locator("#ConfirmDiscard");
		const trigger = example.getByRole("button", {
			exact: true,
			name: "Discard draft",
		});
		await trigger.click();
		await page.getByRole("button", { exact: true, name: "Keep draft" }).click();
		await expect
			.poll(() =>
				trigger.evaluate((element) => element === document.activeElement)
			)
			.toBe(true);
		await trigger.click();
		await page.getByRole("button", { exact: true, name: "Discard" }).click();
		await expect.poll(() => page.getByRole("alertdialog").count()).toBe(0);
	});

	it.each([
		["drawer", "ActivityDrawer", "Review project activity", "Recent activity"],
		["sheet", "ProjectSheet", "Review project details", "Northstar launch"],
	])(
		"dismisses the %s example and restores trigger focus",
		async (slug, name, action, title) => {
			await page.goto(`${handle.url}/components/${slug}`, {
				waitUntil: "networkidle",
			});
			const trigger = page
				.locator(`#${name}`)
				.getByRole("button", { name: action });
			await trigger.click();
			expect(
				await page.getByRole("dialog", { exact: true, name: title }).isVisible()
			).toBe(true);
			await page.keyboard.press("Escape");
			await expect
				.poll(() =>
					trigger.evaluate((element) => element === document.activeElement)
				)
				.toBe(true);
		}
	);

	it("selects a filtered command using Enter", async () => {
		await page.goto(`${handle.url}/components/command`, {
			waitUntil: "networkidle",
		});
		const example = page.locator("#ProjectCommand");
		await example
			.getByRole("button", { exact: true, name: "Find a project" })
			.click();
		await page.getByRole("combobox", { name: "Find a project" }).fill("Field");
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");
		await expect
			.poll(() => example.innerText())
			.toContain("Selected: Field notes");
	});

	it("shows one notice from the shared toast manager", async () => {
		await page.goto(`${handle.url}/components/toast`, {
			waitUntil: "networkidle",
		});
		await page
			.locator("#preview")
			.getByRole("button", { name: "Copy link" })
			.click();
		await expect
			.poll(() => page.getByText("Link copied", { exact: true }).count())
			.toBe(1);
		expect(
			await page
				.getByText("Anyone on the Northstar team can open it.", { exact: true })
				.isVisible()
		).toBe(true);
	});

	it("sorts table rows from the column header", async () => {
		await page.goto(`${handle.url}/components/data-table`, {
			waitUntil: "networkidle",
		});
		const example = page.locator("#SortableProjects");
		await example.getByRole("button", { name: projectHeader }).click();
		await expect
			.poll(() => example.locator("tbody tr").first().innerText())
			.toContain("Design system");
		await example.getByRole("button", { name: projectHeader }).click();
		await expect
			.poll(() => example.locator("tbody tr").first().innerText())
			.toContain("Reference app");
	});

	it("keeps civil date endpoints stable across time zones", async () => {
		await page.goto(`${handle.url}/components/date-range-picker`, {
			waitUntil: "networkidle",
		});
		expect(await page.locator("#ReportingDateRange").innerText()).toContain(
			"Reports cover Oct 10, 2026 – Oct 14, 2026."
		);
	});

	it("shows field validation before accepting local form state", async () => {
		await page.goto(`${handle.url}/components/form`, {
			waitUntil: "networkidle",
		});
		const example = page.locator("#ContactForm");
		await example.getByRole("button", { name: "Review details" }).click();
		await expect.poll(() => example.innerText()).toContain("Enter your name.");
		const input = example.getByRole("textbox", { exact: true, name: "Name" });
		expect(await input.getAttribute("aria-invalid")).toBe("true");
		await input.fill("Maya Chen");
		await example.getByRole("button", { name: "Review details" }).click();
		await expect
			.poll(() => example.innerText())
			.toContain("Ready to review Maya Chen.");
		expect(await input.getAttribute("aria-invalid")).not.toBe("true");
	});

	it.each(["aspect-ratio", "grid"])(
		"fits the %s focused preview with enlarged mobile text",
		async (slug) => {
			await page.setViewportSize({ height: 900, width: 320 });
			await page.goto(`${handle.url}/components/${slug}`, {
				waitUntil: "networkidle",
			});
			await page.addStyleTag({ content: "html {font-size:32px!important}" });
			const dimensions = await page
				.locator('[data-slot="component-preview"]')
				.evaluate((element) => ({
					client: element.clientWidth,
					scroll: element.scrollWidth,
				}));
			expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
		}
	);

	it("keeps Command previews closed and trigger-only with enlarged text", async () => {
		await page.setViewportSize({ height: 900, width: 320 });
		await page.goto(`${handle.url}/components/command`, {
			waitUntil: "networkidle",
		});
		await page.addStyleTag({ content: "html {font-size:32px!important}" });
		expect(await page.locator('[data-slot="command-input"]').count()).toBe(0);
		expect(
			await page.locator('[data-slot="command-dialog-trigger"]').count()
		).toBe(3);
	});
});
