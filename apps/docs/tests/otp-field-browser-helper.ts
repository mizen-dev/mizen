import { type Browser, chromium, type Page } from "playwright";
import { afterAll, afterEach, beforeAll, beforeEach, expect } from "vitest";
import {
	setupTestServer,
	type TestServerHandle,
	teardownTestServer,
} from "./test-helper";

export const TRANSPARENT_COLOR_REGEX = /rgba\(0,\s*0,\s*0,\s*0\)|transparent/;
export const WHITESPACE_REGEX = /\s+/;

export const SLOT_INPUT_SELECTOR = '[data-slot="otp-field-input"]';
export const TESTID_DEFAULT = '[data-testid="otp-field-default"]';
export const TESTID_SIZE_SM = '[data-testid="otp-field-size-sm"]';
export const TESTID_SIZE_DEFAULT = '[data-testid="otp-field-size-default"]';
export const TESTID_SIZE_LG = '[data-testid="otp-field-size-lg"]';
export const TESTID_MASKED = '[data-testid="otp-field-masked"]';
export const TESTID_DISABLED = '[data-testid="otp-field-disabled"]';
export const TESTID_READ_ONLY =
	'[data-testid="otp-field-read-only"], [data-testid="otp-field-readonly"]';
export const TESTID_INVALID = '[data-testid="otp-field-invalid"]';

export const SLOT_INDICES_SIX = [0, 1, 2, 3, 4, 5];
export const DESKTOP_SLOT_SIZE_SM_PX = 32;
export const DESKTOP_SLOT_SIZE_DEFAULT_PX = 36;
export const DESKTOP_SLOT_SIZE_LG_PX = 40;
export const MOBILE_SLOT_SIZE_SM_PX = 32;
export const MOBILE_SLOT_SIZE_DEFAULT_PX = 36;
export const MOBILE_SLOT_SIZE_LG_PX = 40;
export const DESKTOP_VIEWPORT = { height: 800, width: 1280 };
export const MOBILE_VIEWPORT = { height: 800, width: 375 };
export const MIN_FOCUS_OUTLINE_WIDTH_PX = 2;
export const ELEMENT_TIMEOUT_MS = 3000;

const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

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
		throw new AggregateError(failures, "OTPField browser teardown failed");
	}
}

export interface OtpBrowserSuite {
	readonly getHandle: () => TestServerHandle;
	readonly getPage: () => Page;
	readonly resetErrors: () => void;
}

export function setupOtpBrowserSuite(): OtpBrowserSuite {
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
		await page
			.context()
			.grantPermissions(["clipboard-read", "clipboard-write"]);
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
		await page.goto(`${handle.url}/components/otp-field`, {
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
