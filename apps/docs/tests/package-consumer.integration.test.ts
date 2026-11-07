import {
	type ChildProcessWithoutNullStreams,
	execFile,
	spawn,
} from "node:child_process";
import {
	access,
	copyFile,
	cp,
	mkdtemp,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { type Browser, type BrowserContext, chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { expect, it } from "vitest";
import { verifyPackedPublicTypes } from "./packed-public-types";

const execute = promisify(execFile);
const docsRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const nextFixture = join(docsRoot, "tests/package-consumer");
const packageRoot = join(docsRoot, "../../packages/ui");
const runCheckpoint = process.env.MIZEN_PACKED_CONSUMER === "1";

// One packed archive, installed into each supported framework.
interface ConsumerTarget {
	/** Path prefix of the static assets the size budgets measure. */
	assetPrefix: string;
	/** Fixture files reused from the Next consumer, as [from, to]. */
	borrowed: readonly (readonly [string, string])[];
	/** Budgets were measured on Next's compressed production server. */
	budgets: boolean;
	builtFiles: readonly string[];
	fixture: string;
	name: string;
	serve: (root: string, port: number) => string[];
	slug: string;
	typecheck: boolean;
}

const targets: readonly ConsumerTarget[] = [
	{
		assetPrefix: "/_next/static/",
		borrowed: [],
		budgets: true,
		builtFiles: [".next/BUILD_ID", ".next/server/app/index.html"],
		fixture: nextFixture,
		name: "Next",
		serve: (root, port) => [
			join(root, "node_modules/next/dist/bin/next"),
			"start",
			"--hostname",
			"127.0.0.1",
			"--port",
			String(port),
		],
		slug: "next",
		typecheck: true,
	},
	{
		assetPrefix: "/assets/",
		borrowed: [
			["app/theme-select.jsx", "src/theme-select.jsx"],
			["app/workspace-controls.jsx", "src/workspace-controls.jsx"],
		],
		budgets: false,
		builtFiles: ["dist/client", "dist/server/server.js"],
		fixture: join(docsRoot, "tests/package-consumer-start"),
		name: "TanStack Start",
		serve: (root, port) => [
			join(root, "node_modules/vite/bin/vite.js"),
			"preview",
			"--host",
			"127.0.0.1",
			"--port",
			String(port),
			"--strictPort",
		],
		slug: "start",
		typecheck: false,
	},
];

const artifact = (target: ConsumerTarget, name: string) =>
	join(tmpdir(), `mizen-packed-${target.slug}-${name}`);
const SIZE_BUDGETS = {
	archiveBytes: 680_000,
	cssBytes: 36_000,
	jsBytes: 270_000,
} as const;

interface ProductionServer {
	origin: string;
	output: () => string;
	process: ChildProcessWithoutNullStreams;
}

async function availablePort(): Promise<number> {
	const server = createServer();
	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("Could not reserve a consumer test port.");
	}
	await new Promise<void>((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
	});
	return address.port;
}

function executeCommand(
	command: string,
	args: string[],
	cwd: string,
	timeout: number,
	maxBuffer = 1_000_000,
	env: NodeJS.ProcessEnv = process.env
) {
	return execute(command, args, { cwd, env, maxBuffer, timeout }).catch(
		(error: unknown) => {
			const output = error as Error & { stderr?: string; stdout?: string };
			const diagnostics = [output.stdout, output.stderr]
				.filter((value): value is string => Boolean(value?.trim()))
				.join("\n");
			const message = error instanceof Error ? error.message : String(error);
			throw new Error([message, diagnostics].filter(Boolean).join("\n"), {
				cause: error,
			});
		}
	);
}

async function prepareConsumer(
	target: ConsumerTarget,
	consumerRoot: string,
	archive: string
): Promise<void> {
	await cp(target.fixture, consumerRoot, { recursive: true });
	await Promise.all(
		target.borrowed.map(([from, to]) =>
			copyFile(join(nextFixture, from), join(consumerRoot, to))
		)
	);
	await executeCommand(
		"pnpm",
		["pack", "--json", "--out", archive],
		packageRoot,
		30_000
	);
	const consumerArchive = join(consumerRoot, "mizen-ui.tgz");
	await copyFile(archive, consumerArchive);
	await executeCommand(
		"pnpm",
		["install", "--ignore-scripts", "--no-frozen-lockfile"],
		consumerRoot,
		120_000
	);
	if (target.typecheck) {
		await verifyPackedPublicTypes(consumerRoot);
		await executeCommand(
			"pnpm",
			["exec", "tsc", "--project", "tsconfig.consumer.json"],
			consumerRoot,
			60_000
		);
	}
	const identityCheck = await executeCommand(
		process.execPath,
		[
			"-e",
			`const { createRequire } = require("node:module"); const { realpathSync } = require("node:fs"); const host = createRequire(${JSON.stringify(join(consumerRoot, "package.json"))}); const library = createRequire(${JSON.stringify(join(consumerRoot, "node_modules/@mizen/ui/package.json"))}); console.log(JSON.stringify(Object.fromEntries(["react", "react-dom"].map((name) => [name, [realpathSync(host.resolve(name)), realpathSync(library.resolve(name))]]))));`,
		],
		consumerRoot,
		10_000
	);
	const modulePaths = JSON.parse(identityCheck.stdout) as Record<
		"react" | "react-dom",
		[string, string]
	>;
	for (const name of ["react", "react-dom"] as const) {
		expect(modulePaths[name][1], `${name} resolved from @mizen/ui`).toBe(
			modulePaths[name][0]
		);
	}
	await executeCommand(
		"pnpm",
		["run", "build"],
		consumerRoot,
		240_000,
		10_000_000,
		// Vitest runs with NODE_ENV=test; a deploy builds for production.
		{ ...process.env, NODE_ENV: "production" }
	);
	await Promise.all(
		target.builtFiles.map((file) =>
			expect(access(join(consumerRoot, file))).resolves.toBeUndefined()
		)
	);
}

async function startProductionServer(
	target: ConsumerTarget,
	consumerRoot: string
): Promise<ProductionServer> {
	const port = await availablePort();
	const child = spawn(process.execPath, target.serve(consumerRoot, port), {
		cwd: consumerRoot,
		env: { ...process.env, NODE_ENV: "production" },
	});
	let output = "";
	child.stdout.on("data", (chunk) => {
		output += chunk.toString();
	});
	child.stderr.on("data", (chunk) => {
		output += chunk.toString();
	});
	return {
		origin: `http://127.0.0.1:${port}`,
		output: () => output,
		process: child,
	};
}

async function waitForServer(
	server: ProductionServer,
	attempt = 0
): Promise<void> {
	if (server.process.exitCode !== null) {
		throw new Error(`Packed consumer server exited early: ${server.output()}`);
	}
	if (attempt >= 80) {
		throw new Error(`Packed consumer server did not start: ${server.output()}`);
	}
	try {
		const response = await fetch(server.origin);
		if (response.ok) {
			return;
		}
	} catch {
		// The server has not opened its socket yet.
	}
	await new Promise((resolve) => setTimeout(resolve, 250));
	return waitForServer(server, attempt + 1);
}

async function stopServer(server?: ProductionServer): Promise<void> {
	if (!server || server.process.exitCode !== null) {
		return;
	}
	await new Promise<void>((resolve) => {
		server.process.once("exit", () => resolve());
		server.process.kill("SIGTERM");
	});
}

async function verifyConsumer(
	target: ConsumerTarget,
	origin: string,
	archiveBytes: number
): Promise<void> {
	let browser: Browser | undefined;
	let context: BrowserContext | undefined;
	try {
		browser = await chromium.launch({
			executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
			headless: true,
		});
		context = await browser.newContext({
			viewport: { height: 900, width: 1280 },
		});
		// Kept only on failure: the Select step has failed intermittently under
		// load and never reproduced on demand.
		await context.tracing.start({ screenshots: true, snapshots: true });
		await context.addInitScript(() => {
			window.localStorage.setItem("mizen-theme", "dark");
			const themeChanges: string[] = [];
			Object.assign(window, { __mizenThemeChanges: themeChanges });
			new MutationObserver((records) => {
				if (
					!records.some((record) => record.target === document.documentElement)
				) {
					return;
				}
				themeChanges.push(
					document.documentElement.getAttribute("data-theme") ?? ""
				);
			}).observe(document, {
				attributeFilter: ["data-theme"],
				attributes: true,
				subtree: true,
			});
		});
		const page = await context.newPage();
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") {
				errors.push(message.text());
			}
		});

		await page.goto(origin, { waitUntil: "domcontentloaded" });
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			"dark"
		);
		expect(
			await page.evaluate(
				() =>
					(window as Window & { __mizenThemeChanges?: string[] })
						.__mizenThemeChanges
			)
		).not.toContain("light");
		await expectLocator(
			page.getByRole("heading", { name: "Package compiles from its archive" })
		).toBeVisible();
		const computed = await page
			.locator("header[data-slot='card']")
			.evaluate((surface) => ({
				background: getComputedStyle(surface).backgroundColor,
				font: getComputedStyle(document.body).fontFamily,
			}));
		expect(computed.background).not.toBe("rgba(0, 0, 0, 0)");
		expect(computed.font).toContain("Wix Madefor Text Variable");
		const loadedFonts = await page.evaluate(async () => {
			await document.fonts.ready;
			return [...document.fonts]
				.filter((font) => font.status === "loaded")
				.map((font) => font.family);
		});
		expect(loadedFonts).toContain("Wix Madefor Text Variable");
		expect(
			await page.evaluate(() =>
				document.fonts.check('16px "Wix Madefor Text Variable"')
			)
		).toBe(true);
		const controlStyles = await page
			.getByRole("button", { name: "Save workspace" })
			.evaluate((button) => ({
				// Press surfaces paint their fill on ::before.
				background: getComputedStyle(button, "::before").backgroundColor,
				height: button.getBoundingClientRect().height,
			}));
		expect(controlStyles.height).toBeGreaterThan(32);
		expect(controlStyles.background).not.toBe("rgba(0, 0, 0, 0)");
		const themeSelect = page.getByTestId("theme-select");
		await themeSelect.selectOption("light");
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			"light"
		);
		expect(await page.evaluate(() => localStorage.getItem("mizen-theme"))).toBe(
			"light"
		);
		await themeSelect.selectOption("dark");
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			"dark"
		);

		await selectPriorityAccounts(page);
		await submitWorkspaceName(page);
		await verifyScatterTooltip(page);
		const output = await page.evaluate((assetPrefix) => {
			const resources = performance
				.getEntriesByType("resource")
				.map((entry) => entry as PerformanceResourceTiming)
				.filter((entry) =>
					new URL(entry.name).pathname.startsWith(assetPrefix)
				);
			const bytesFor = (extension: string) =>
				resources
					.filter((entry) => new URL(entry.name).pathname.endsWith(extension))
					.reduce((total, entry) => total + entry.encodedBodySize, 0);
			return {
				cssBytes: bytesFor(".css"),
				cssFiles: resources.filter((entry) =>
					new URL(entry.name).pathname.endsWith(".css")
				).length,
				jsBytes: bytesFor(".js"),
				jsFiles: resources.filter((entry) =>
					new URL(entry.name).pathname.endsWith(".js")
				).length,
			};
		}, target.assetPrefix);
		expect(output.cssBytes).toBeGreaterThan(0);
		expect(output.jsBytes).toBeGreaterThan(0);
		// Budgets sit ~12% over the 2026-10-31 measurement (JS 242,392, CSS
		// 31,296, archive 608,390 bytes with type declarations). A jump past
		// them usually means the package stopped tree-shaking.
		if (target.budgets) {
			expect(output.jsBytes).toBeLessThanOrEqual(SIZE_BUDGETS.jsBytes);
			expect(output.cssBytes).toBeLessThanOrEqual(SIZE_BUDGETS.cssBytes);
			expect(archiveBytes).toBeLessThanOrEqual(SIZE_BUDGETS.archiveBytes);
		}
		await writeFile(
			artifact(target, "output-baseline.json"),
			`${JSON.stringify({ archiveBytes, ...output }, null, 2)}\n`
		);
		await page.screenshot({
			path: artifact(target, "dark.png"),
		});
		expect(errors).toEqual([]);
		await context.tracing.stop();
	} catch (error) {
		const tracePath = artifact(target, "trace.zip");
		await context?.tracing.stop({ path: tracePath });
		if (error instanceof Error) {
			error.message += `\nTrace: ${tracePath}`;
		}
		throw error;
	} finally {
		await browser?.close();
	}
}

async function submitWorkspaceName(
	page: import("playwright").Page
): Promise<void> {
	await page.getByLabel("Workspace name").fill("Growth");
	await page.getByRole("button", { name: "Save workspace" }).click();
	await expectLocator(page.getByTestId("saved-workspace")).toHaveText(
		"Saved Growth · priority"
	);
}

async function selectPriorityAccounts(
	page: import("playwright").Page
): Promise<void> {
	const dialogTrigger = page.getByRole("button", { name: "Choose segment" });
	await dialogTrigger.click();
	await expectLocator(
		page.getByRole("dialog", { name: "Resource segment" })
	).toBeVisible();
	const segmentTrigger = page.getByRole("combobox", {
		name: "Segment",
	});
	await segmentTrigger.focus();
	await expectLocator(segmentTrigger).toBeFocused();
	await page.keyboard.press("ArrowDown");
	const allOption = page.getByRole("option", { name: "All accounts" });
	await expectLocator(allOption).toBeVisible();
	await expectLocator(allOption).toHaveAttribute("tabindex", "0");
	const priorityOption = page.getByRole("option", {
		name: "Priority accounts",
	});
	// Base UI 1.9 highlights the selected option after opening, and that late
	// highlight can override an ArrowDown sent right away (about 1 in 8 runs).
	// Press again until the highlight moves, as a user would.
	await expect
		.poll(
			async () => {
				if ((await priorityOption.getAttribute("tabindex")) !== "0") {
					await page.keyboard.press("ArrowDown");
				}
				return priorityOption.getAttribute("tabindex");
			},
			{ interval: 250, timeout: 3000 }
		)
		.toBe("0");
	await page.keyboard.press("Enter");
	await expectLocator(page.getByTestId("selected-segment")).toHaveText(
		"Priority accounts"
	);
	await page.keyboard.press("Escape");
	await page.keyboard.press("Escape");
	await expectLocator(page.getByRole("dialog")).toBeHidden();
	await expectLocator(dialogTrigger).toBeFocused();
	const nativeSelect = await page
		.locator('input[name="segment"]')
		.evaluate((input) => ({
			formOwner: (input as HTMLInputElement).form?.id ?? null,
			value: (input as HTMLInputElement).value,
		}));
	expect(nativeSelect).toEqual({
		formOwner: "workspace-form",
		value: "priority",
	});
}

async function verifyScatterTooltip(
	page: import("playwright").Page
): Promise<void> {
	const chart = page.getByRole("img", { name: "Delivery time by team size" });
	await chart.focus();
	await page.keyboard.press("ArrowRight");
	const tooltip = page.locator("[data-slot='chart-tooltip']").last();
	const tooltipText = await tooltip.innerText();
	expect(tooltipText).toContain("Team A");
	expect(tooltipText).toContain("Team size");
	expect(tooltipText).toContain("18");
	expect(tooltipText).toContain("Delivery time");
	expect(tooltipText).toContain("42");
	await expectLocator(page.locator("html")).toHaveAttribute(
		"data-theme",
		"dark"
	);
}

for (const target of targets) {
	it.skipIf(!runCheckpoint)(
		`builds and exercises a standalone ${target.name} consumer from the packed UI archive`,
		async () => {
			const destination = await mkdtemp(
				join(tmpdir(), `mizen-packed-${target.slug}-`)
			);
			const consumerRoot = join(destination, "consumer");
			const archive = join(destination, "mizen-ui.tgz");
			let server: ProductionServer | undefined;

			try {
				await prepareConsumer(target, consumerRoot, archive);
				server = await startProductionServer(target, consumerRoot);
				await waitForServer(server);
				await verifyConsumer(target, server.origin, (await stat(archive)).size);
			} finally {
				await stopServer(server);
				await rm(destination, { force: true, recursive: true });
			}
		},
		300_000
	);
}
