import { type ChildProcess, spawn } from "node:child_process";
import { createServer } from "node:net";
import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let url: string;
let browser: Browser;
let page: Page;
let server: ChildProcess | undefined;

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

async function resolveTestUrl(): Promise<string | undefined> {
	if (process.env.MIZEN_DOCS_TEST_URL) {
		return process.env.MIZEN_DOCS_TEST_URL;
	}
	try {
		const res = await fetch("http://127.0.0.1:3000");
		if (res.ok) {
			return "http://127.0.0.1:3000";
		}
	} catch {
		// Not running on 3000
	}
	return undefined;
}

describe("Heading component and docs specimen", () => {
	beforeAll(async () => {
		const existingUrl = await resolveTestUrl();
		if (existingUrl) {
			url = existingUrl;
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
					detached: true,
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
		page.setDefaultTimeout(6000);
	}, 120_000);

	afterAll(async () => {
		await browser?.close();
		if (server && !server.killed) {
			const activeServer = server;
			const { pid } = activeServer;
			if (pid === undefined) {
				activeServer.kill("SIGTERM");
			} else {
				try {
					process.kill(-pid, "SIGTERM");
				} catch {
					activeServer.kill("SIGTERM");
				}
			}
			await new Promise<void>((resolve) => {
				activeServer.once("exit", () => resolve());
				setTimeout(resolve, 3000);
			});
		}
	}, 120_000);

	it("given @mizen-labs/ui and @mizen-labs/ui/heading, resolves export targets", () => {
		// Given: package exports configured in packages/ui/package.json
		// When: resolving the package root and subpath export targets
		const rootPath = import.meta.resolve("@mizen-labs/ui");
		const subpath = import.meta.resolve("@mizen-labs/ui/heading");

		// Then: both point to their built distribution entrypoints
		expect(rootPath).toContain("packages/ui/dist/index.js");
		expect(subpath).toContain("packages/ui/dist/components/heading/heading.js");
	});

	it("given /components/heading, renders the docs heading page", async () => {
		// Given: a browser session navigated to the heading docs route
		const response = await page.goto(`${url}/components/heading`, {
			waitUntil: "networkidle",
		});

		// When: verifying HTTP response and main page title
		expect(response?.status()).toBe(200);
		const pageTitle = page.getByRole("heading", {
			exact: true,
			level: 1,
			name: "Heading",
		});

		// Then: the page title heading is visible
		expect(await pageTitle.isVisible()).toBe(true);
	});

	it("given heading examples, renders the exact native tag sequence H1, H2, H3, H4, H5, H6, H2", async () => {
		// Given: the heading component docs page is loaded
		await page.goto(`${url}/components/heading`, { waitUntil: "networkidle" });

		// When: querying the main preview and each named example region
		const previewHeadings = page.locator(
			'[data-slot="component-preview"] [data-slot="heading"]'
		);
		const exampleHeadings = page.locator(
			'[aria-label^="Heading: "][aria-label$=" example"] [data-slot="heading"]'
		);
		const [previewTags, exampleTags] = await Promise.all(
			[previewHeadings, exampleHeadings].map((locator) =>
				locator.evaluateAll((elements) => elements.map((el) => el.tagName))
			)
		);

		// Then: the preview shows a title and two sections, and the examples cover H1 through H6 followed by default H2
		expect(previewTags).toEqual(["H2", "H3", "H3"]);
		expect(exampleTags).toEqual(["H1", "H2", "H3", "H4", "H5", "H6", "H2"]);

		// And: no native heading has an ARIA role attribute
		const roles = await page
			.locator('[data-slot="heading"]')
			.evaluateAll((elements) => elements.map((el) => el.getAttribute("role")));
		expect(roles.every((role) => role === null)).toBe(true);
	});

	it("given headings with same semantic level, proves visual size independence with distinct computed typography", async () => {
		// Given: the heading component docs page is loaded at mobile viewport
		await page.goto(`${url}/components/heading`, { waitUntil: "networkidle" });
		await page.setViewportSize({ height: 800, width: 375 });

		const exampleHeading = (title: string) =>
			page
				.getByRole("region", { exact: true, name: `Heading: ${title} example` })
				.locator('[data-slot="heading"]');
		const titleH2 = exampleHeading("Title heading (h2)");
		const defaultH2 = exampleHeading(
			"Default heading (default level 2, default size)"
		);
		const displayH1 = exampleHeading("Display heading (h1)");
		const readTypography = (heading: typeof titleH2) =>
			heading.evaluate((el) => {
				const s = getComputedStyle(el);
				return [s.fontSize, s.fontWeight, s.lineHeight];
			});

		// When: checking tag names for both H2 examples
		const [titleTag, defaultTag] = await Promise.all([
			titleH2.evaluate((el) => el.tagName),
			defaultH2.evaluate((el) => el.tagName),
		]);

		// Then: both share the exact same semantic level (H2)
		expect(titleTag).toBe("H2");
		expect(defaultTag).toBe("H2");

		// When: inspecting computed typography on mobile
		const titleMobile = await readTypography(titleH2);
		const defaultMobile = await readTypography(defaultH2);
		const displayMobile = await readTypography(displayH1);

		// Then: visual sizes differ on the same H2 tag, matching the title, heading, and compact display roles
		expect(titleMobile).toEqual(["28px", "600", "32px"]);
		expect(defaultMobile).toEqual(["20px", "600", "28px"]);
		expect(displayMobile).toEqual(["32px", "600", "36px"]);

		// When: switching to desktop viewport
		await page.setViewportSize({ height: 800, width: 1024 });
		const titleDesktop = await readTypography(titleH2);
		const defaultDesktop = await readTypography(defaultH2);
		const displayDesktop = await readTypography(displayH1);

		// Then: only display grows; title and heading keep fixed roles at every width
		expect(titleDesktop).toEqual(["28px", "600", "32px"]);
		expect(defaultDesktop).toEqual(["20px", "600", "28px"]);
		expect(displayDesktop).toEqual(["40px", "600", "44px"]);
	});
});
