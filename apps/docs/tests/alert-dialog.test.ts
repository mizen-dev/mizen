import { type ChildProcess, spawn } from "node:child_process";
import { createServer } from "node:net";
import { type Browser, chromium, type Page } from "playwright";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vite-plus/test";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");
const confirmationPattern = /delete/iu;
let url: string;
let browser: Browser;
let page: Page;
let server: ChildProcess;

async function getAvailablePort(): Promise<number> {
	const probe = createServer();
	await new Promise<void>((resolve, reject) => {
		probe.once("error", reject);
		probe.listen(0, "127.0.0.1", () => resolve());
	});
	const address = probe.address();
	if (!address || typeof address === "string") {
		probe.close();
		throw new Error("Could not reserve a localhost port");
	}
	const { port } = address;
	await new Promise<void>((resolve, reject) =>
		probe.close((error) => (error ? reject(error) : resolve()))
	);
	return port;
}

async function waitForServer(serverUrl: string, attempt = 0): Promise<void> {
	try {
		if ((await fetch(serverUrl)).ok) {
			return;
		}
	} catch {
		// The server is still starting.
	}
	if (attempt >= 120) {
		throw new Error(`Timed out waiting for ${serverUrl}`);
	}
	await new Promise((resolve) => setTimeout(resolve, 250));
	return waitForServer(serverUrl, attempt + 1);
}

describe("Alert Dialog docs specimen", () => {
	beforeAll(async () => {
		const testUrl = process.env.MIZEN_DOCS_TEST_URL;
		if (testUrl) {
			url = testUrl;
		} else {
			const port = await getAvailablePort();
			url = `http://127.0.0.1:${port}`;
			server = spawn(
				"pnpm",
				[
					"exec",
					"next",
					"dev",
					"--turbopack",
					"--hostname",
					"127.0.0.1",
					"--port",
					String(port),
				],
				{
					cwd: docsRoot,
					stdio: "ignore",
				}
			);
		}
		await waitForServer(url);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(4000);
		await page.goto(`${url}/components/alert-dialog`, {
			waitUntil: "networkidle",
		});
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		if (server && !server.killed) {
			server.kill();
			await new Promise<void>((resolve) =>
				server.once("exit", () => resolve())
			);
		}
	}, 120_000);

	beforeEach(async () => {
		await page.reload({ waitUntil: "networkidle" });
	});

	it("given closed specimen, when trigger is clicked, then opens role=alertdialog with Cancel focused", async () => {
		// Arrange
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Delete project permanently",
		});

		// Action
		await trigger.click();
		const alertDialog = page.getByRole("alertdialog");
		const title = alertDialog.getByRole("heading", {
			exact: true,
			name: "Delete project?",
		});
		const cancelButton = alertDialog.getByRole("button", {
			exact: true,
			name: "Cancel",
		});

		// Assert
		expect(await alertDialog.isVisible()).toBe(true);
		expect(await title.isVisible()).toBe(true);
		expect(
			await cancelButton.evaluate(
				(element) => document.activeElement === element
			)
		).toBe(true);
	}, 15_000);

	it("given open alert dialog, when clicking backdrop, then does not close", async () => {
		// Arrange
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Delete project permanently",
		});
		await trigger.click();
		const alertDialog = page.getByRole("alertdialog");
		expect(await alertDialog.isVisible()).toBe(true);

		// Action
		await page.mouse.click(2, 2);
		await page.waitForTimeout(180);

		// Assert
		expect(await alertDialog.isVisible()).toBe(true);
	}, 15_000);

	it("given open alert dialog, when pressing Escape, then closes and restores trigger focus", async () => {
		// Arrange
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Delete project permanently",
		});
		await trigger.click();
		const alertDialog = page.getByRole("alertdialog");
		expect(await alertDialog.isVisible()).toBe(true);

		// Action
		await page.keyboard.press("Escape");
		await page.waitForTimeout(180);

		// Assert
		await expect.poll(() => alertDialog.count()).toBe(0);
		expect(
			await trigger.evaluate((element) => document.activeElement === element)
		).toBe(true);
	}, 15_000);

	it("given open alert dialog, when clicking Cancel, then closes without confirmation state", async () => {
		// Arrange
		const preview = page.locator(
			'[data-slot="component-preview"], [data-slot="usage-preview"]'
		);
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Delete project permanently",
		});
		await trigger.click();
		const alertDialog = page.getByRole("alertdialog");
		const cancelButton = alertDialog.getByRole("button", {
			exact: true,
			name: "Cancel",
		});

		// Action
		await cancelButton.click();
		await page.waitForTimeout(180);

		// Assert
		await expect.poll(() => alertDialog.count()).toBe(0);
		expect(
			await trigger.evaluate((element) => document.activeElement === element)
		).toBe(true);
		expect(await preview.getByRole("status").count()).toBe(0);
	}, 15_000);

	it("given open alert dialog, when clicking Delete project, then closes and records confirmation state", async () => {
		// Arrange
		const preview = page.locator(
			'[data-slot="component-preview"], [data-slot="usage-preview"]'
		);
		const trigger = page.getByRole("button", {
			exact: true,
			name: "Delete project permanently",
		});
		await trigger.click();
		const alertDialog = page.getByRole("alertdialog");
		const confirmButton = alertDialog.getByRole("button", {
			exact: true,
			name: "Delete project",
		});

		// Action
		await confirmButton.click();
		await page.waitForTimeout(180);

		// Assert
		await expect.poll(() => alertDialog.count()).toBe(0);
		const status = preview.getByRole("status");
		expect(await status.isVisible()).toBe(true);
		expect(await status.textContent()).toMatch(confirmationPattern);
	}, 15_000);
});
