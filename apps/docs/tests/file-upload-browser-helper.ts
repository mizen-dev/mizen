import { type Browser, chromium, type Page } from "playwright";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	expect,
} from "vite-plus/test";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

export const HOOK_SPECIMEN = '[data-testid="file-upload-specimen"]';
export const HOOK_DROPZONE = '[data-testid="file-upload-dropzone"]';
export const HOOK_TRIGGER = '[data-testid="file-upload-trigger"]';
export const HOOK_LIST = '[data-testid="file-upload-list"]';

export const SLOT_INPUT = '[data-slot="file-upload-input"]';
export const SLOT_TRIGGER = '[data-slot="file-upload-trigger"]';
export const SLOT_ITEM = '[data-slot="file-upload-item"]';
export const SLOT_ITEM_NAME = '[data-slot="file-upload-item-name"]';

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/u, "");

function throwTeardownFailures(
	results: readonly PromiseSettledResult<unknown>[]
): void {
	const failures: unknown[] = [];
	for (const result of results) {
		if (result.status === "rejected") {
			failures.push(result.reason);
		}
	}
	if (failures.length === 1) {
		throw failures[0];
	}
	if (failures.length > 1) {
		throw new AggregateError(failures, "FileUpload browser teardown failed");
	}
}

export interface FileUploadBrowserSuite {
	readonly getHandle: () => TestServerHandle;
	readonly getPage: () => Page;
	readonly resetErrors: () => void;
}

export function setupFileUploadBrowserSuite(): FileUploadBrowserSuite {
	let handle: TestServerHandle;
	let browser: Browser;
	let page: Page;
	const consoleErrors: string[] = [];
	const pageErrors: string[] = [];

	function resetErrors(): void {
		consoleErrors.length = 0;
		pageErrors.length = 0;
	}

	beforeAll(async () => {
		handle = await setupTestServer(docsRoot);
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		page = await browser.newPage();
		page.setDefaultTimeout(8000);
		page.on("console", (msg) => {
			if (msg.type() === "error") {
				consoleErrors.push(msg.text());
			}
		});
		page.on("pageerror", (err) => {
			pageErrors.push(err.message);
		});
	}, 120_000);

	beforeEach(async () => {
		resetErrors();
		await page.setViewportSize({ height: 800, width: 1280 });
		await page.goto(`${handle.url}/components/file-upload`, {
			waitUntil: "networkidle",
		});
	});

	afterEach(({ task }) => {
		try {
			if (task.result?.state !== "fail") {
				expect(consoleErrors).toEqual([]);
				expect(pageErrors).toEqual([]);
			}
		} finally {
			resetErrors();
		}
	});

	afterAll(async () => {
		const results = await Promise.allSettled([
			Promise.resolve().then(() => browser?.close()),
			Promise.resolve().then(() => teardownTestServer(handle)),
		]);
		throwTeardownFailures(results);
	}, 120_000);

	return {
		getHandle: () => handle,
		getPage: () => page,
		resetErrors,
	};
}
