import { type ChildProcess, execFile, spawn } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { chromium } from "playwright";
import { expect as expectLocator } from "playwright/test";
import { expect, it } from "vitest";

const execute = promisify(execFile);
const repository = new URL("../../../", import.meta.url).pathname;
const checkpoint = process.env.MIZEN_PACKED_CONSUMER === "1";

function command(executable: string, args: string[], cwd: string) {
	return execute(executable, args, {
		cwd,
		env: { ...process.env, NODE_ENV: "production" },
		maxBuffer: 5_000_000,
		timeout: 180_000,
	}).catch((error: unknown) => {
		const output = error as Error & { stdout?: string; stderr?: string };
		throw new Error(
			`${executable} ${args.join(" ")}\n${output.stdout ?? ""}\n${output.stderr ?? ""}`,
			{ cause: error }
		);
	});
}

async function freshFixture(destination: string, start: boolean) {
	const app = join(destination, "app");
	const fixture = start ? "package-consumer-start" : "package-consumer";
	await cp(join(repository, "apps/docs/tests", fixture), app, {
		recursive: true,
	});
	if (start) {
		await Promise.all(
			["theme-select.jsx", "workspace-controls.jsx"].map((file) =>
				cp(
					join(repository, "apps/docs/tests/package-consumer/app", file),
					join(app, "src", file)
				)
			)
		);
	}
	const packagePath = join(app, "package.json");
	const manifest = JSON.parse(await readFile(packagePath, "utf8"));
	Reflect.deleteProperty(manifest.dependencies, "@mizen-labs/ui");
	await writeFile(packagePath, JSON.stringify(manifest, null, 2));
	const rootPath = join(
		app,
		start ? "src/routes/__root.jsx" : "app/layout.jsx"
	);
	const original = await readFile(rootPath, "utf8");
	const root = original
		.split("\n")
		.filter(
			(line) =>
				!(
					line.includes('from "@mizen-labs/ui/theme"') ||
					line.includes('from "@mizen-labs/ui/styles.css?url"') ||
					line.includes('import "@mizen-labs/ui/styles.css"') ||
					line.includes("href: mizenCss")
				)
		)
		.join("\n")
		.replaceAll("<ThemeScript />", "")
		.replaceAll("<ThemeProvider>", "")
		.replaceAll("</ThemeProvider>", "")
		.replaceAll(" suppressHydrationWarning", "");
	await writeFile(rootPath, root);
	const configPath = join(app, start ? "vite.config.js" : "next.config.mjs");
	const config = (await readFile(configPath, "utf8"))
		.replace('ssr: { noExternal: ["@mizen-labs/ui"] },', "")
		.replace('transpilePackages: ["@mizen-labs/ui"],', "");
	await writeFile(configPath, config);
	return app;
}

async function reservePort(): Promise<number> {
	const server = createServer();
	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("No test port available.");
	}
	await new Promise<void>((resolve, reject) =>
		server.close((error) => (error ? reject(error) : resolve()))
	);
	return address.port;
}

async function productionServer(app: string, start: boolean) {
	const port = await reservePort();
	const entry = start
		? "node_modules/vite/bin/vite.js"
		: "node_modules/next/dist/bin/next";
	const args = start
		? ["preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"]
		: ["start", "--hostname", "127.0.0.1", "--port", String(port)];
	const processHandle = spawn(process.execPath, [join(app, entry), ...args], {
		cwd: app,
		stdio: "pipe",
	});
	let output = "";
	processHandle.stdout.on("data", (data) => {
		output += String(data);
	});
	processHandle.stderr.on("data", (data) => {
		output += String(data);
	});
	const origin = `http://127.0.0.1:${port}`;
	try {
		await expect
			.poll(
				async () => {
					if (processHandle.exitCode !== null) {
						throw new Error(output);
					}
					try {
						return (await fetch(origin)).status;
					} catch {
						return 0;
					}
				},
				{ interval: 200, timeout: 30_000 }
			)
			.toBe(200);
	} catch (error) {
		processHandle.kill();
		throw error;
	}
	return { origin, processHandle };
}

async function stop(processHandle: ChildProcess | undefined) {
	if (!processHandle || processHandle.exitCode !== null) {
		return;
	}
	processHandle.kill();
	await new Promise<void>((resolve) => {
		processHandle.once("exit", () => resolve());
		setTimeout(() => {
			processHandle.kill("SIGKILL");
			resolve();
		}, 3000).unref();
	});
}

async function browserChecks(origin: string, clientOnly = false) {
	const browser = await chromium.launch({
		executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
		headless: true,
	});
	try {
		const context = await browser.newContext();
		await context.addInitScript(() =>
			localStorage.setItem("mizen-theme", "dark")
		);
		if (clientOnly) {
			await context.addInitScript(() => {
				const sample = () => {
					if (document.querySelector('[data-slot="card"]')) {
						(window as unknown as Record<string, unknown>).__mizenFirstTheme =
							document.documentElement.getAttribute("data-theme");
						return;
					}
					requestAnimationFrame(sample);
				};
				requestAnimationFrame(sample);
			});
		}
		const page = await context.newPage();
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(origin, { waitUntil: "networkidle" });
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			"dark"
		);
		await expectLocator(page.getByLabel("Theme preference")).toHaveValue(
			"dark"
		);
		if (clientOnly) {
			await expect
				.poll(() =>
					page.evaluate(
						() =>
							(window as unknown as Record<string, unknown>).__mizenFirstTheme
					)
				)
				.toBe("dark");
			await page.getByRole("button", { exact: true, name: "Count 0" }).click();
			await expectLocator(
				page.getByRole("button", { exact: true, name: "Count 1" })
			).toBeVisible();
		}
		const card = page.locator('[data-slot="card"]').first();
		const dark = await card.evaluate(
			(node) => getComputedStyle(node).backgroundColor
		);
		await page.getByLabel("Theme preference").selectOption("light");
		await expectLocator(page.locator("html")).toHaveAttribute(
			"data-theme",
			"light"
		);
		await expect
			.poll(() =>
				card.evaluate((node) => getComputedStyle(node).backgroundColor)
			)
			.not.toBe(dark);
		await page.getByRole("button", { name: "Choose segment" }).click();
		await expectLocator(page.getByRole("dialog")).toBeVisible();
		await page.keyboard.press("Escape");
		await expectLocator(page.getByRole("dialog")).toBeHidden();
		if (clientOnly) {
			for (let frame = 0; frame < 3; frame += 1) {
				// biome-ignore lint/performance/noAwaitInLoops: Separate navigations exercise the previously intermittent first-frame race.
				await firstClientFrame(page);
			}
		}
		expect(errors).toEqual([]);
		await context.close();
	} finally {
		await browser.close();
	}
}

for (const start of [false, true]) {
	it.skipIf(!checkpoint)(
		`packed init sets up, rebuilds, and hydrates ${start ? "Start with pnpm" : "Next with npm"}`,
		async () => {
			const destination = await mkdtemp(
				join(tmpdir(), "mizen-cli-init-consumer-")
			);
			let server: Awaited<ReturnType<typeof productionServer>> | undefined;
			try {
				const uiArchive = join(destination, "mizen-ui.tgz");
				const cliArchive = join(destination, "mizen-cli.tgz");
				await command(
					"pnpm",
					["pack", "--out", uiArchive],
					join(repository, "packages/ui")
				);
				await command(
					"pnpm",
					["pack", "--out", cliArchive],
					join(repository, "packages/cli")
				);
				const tools = join(destination, "tools");
				await cp(
					join(repository, "packages/cli/README.md"),
					join(destination, "README.md")
				);
				await command(
					"npm",
					[
						"install",
						"--prefix",
						tools,
						"--ignore-scripts",
						"--no-audit",
						"--no-fund",
						cliArchive,
					],
					destination
				);
				const binary = join(tools, "node_modules/@mizen-labs/cli/dist/cli.js");
				const app = await freshFixture(destination, start);
				const manager = start ? "pnpm" : "npm";
				await command(
					manager,
					[
						"install",
						"--ignore-scripts",
						...(start ? ["--prod=false"] : ["--include=dev"]),
					],
					app
				);
				const args = [
					binary,
					"init",
					"--cwd",
					app,
					"--package",
					uiArchive,
					"--json",
				];
				const preview = JSON.parse(
					(await command(process.execPath, [...args, "--dry-run"], app)).stdout
				);
				expect(preview.data.status).toBe("planned");
				const result = JSON.parse(
					(await command(process.execPath, [...args, "--yes"], app)).stdout
				);
				expect(result.data.status).toBe("applied");
				expect(result.data.verification.status).toBe("healthy");
				await Promise.all(
					preview.data.plan.edits.map(
						async (edit: { path: string; after: string }) =>
							expect(await readFile(join(app, edit.path), "utf8")).toBe(
								edit.after
							)
					)
				);
				const repeated = JSON.parse(
					(
						await command(
							process.execPath,
							[binary, "init", "--cwd", app, "--yes", "--json"],
							app
						)
					).stdout
				);
				expect(repeated.data.status).toBe("unchanged");
				if (!start) {
					await command(
						process.execPath,
						[
							join(app, "node_modules/typescript/bin/tsc"),
							"-p",
							"tsconfig.consumer.json",
						],
						app
					);
				}
				await command(manager, ["run", "build"], app);
				server = await productionServer(app, start);
				await browserChecks(server.origin);
			} finally {
				await stop(server?.processHandle);
				await rm(destination, { force: true, recursive: true });
			}
		},
		300_000
	);
}

async function plainViteFixture(destination: string, typescript: boolean) {
	const app = join(destination, "app");
	await cp(join(repository, "apps/docs/tests/package-consumer-vite"), app, {
		recursive: true,
	});
	const manifestPath = join(app, "package.json");
	const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
	Reflect.deleteProperty(manifest.dependencies, "@mizen-labs/ui");
	if (!typescript) {
		await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
		return app;
	}

	manifest.scripts.build = "tsc --noEmit && vite build";
	Object.assign(manifest.devDependencies, {
		"@types/react": "19.3.0",
		"@types/react-dom": "19.3.0",
		typescript: "7.0.2",
	});
	await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
	await writeFile(
		join(app, "tsconfig.json"),
		JSON.stringify({
			compilerOptions: {
				jsx: "react-jsx",
				module: "ESNext",
				moduleResolution: "Bundler",
				noEmit: true,
				skipLibCheck: true,
				strict: true,
				target: "ES2023",
				types: ["vite/client"],
			},
			include: ["src"],
		})
	);
	const main = (await readFile(join(app, "src/main.jsx"), "utf8"))
		.replace(
			'document.getElementById("root")',
			'document.getElementById("root")!'
		)
		.replace("./App.jsx", "./App");
	await writeFile(join(app, "src/main.tsx"), main);
	await writeFile(
		join(app, "src/App.tsx"),
		(await readFile(join(app, "src/App.jsx"), "utf8")).replace(
			"(event) =>",
			"(event: { currentTarget: HTMLSelectElement }) =>"
		)
	);
	await Promise.all(
		["main.jsx", "App.jsx"].map((file) => rm(join(app, "src", file)))
	);
	await writeFile(
		join(app, "index.html"),
		(await readFile(join(app, "index.html"), "utf8")).replace(
			"/src/main.jsx",
			"/src/main.tsx"
		)
	);
	return app;
}

for (const typescript of [false, true]) {
	it.skipIf(!checkpoint)(
		`packed init configures plain Vite React ${typescript ? "TSX" : "JSX"} and preserves the first app frame`,
		async () => {
			const destination = await mkdtemp(
				join(tmpdir(), "mizen-plain-vite-init-")
			);
			let server: Awaited<ReturnType<typeof productionServer>> | undefined;
			try {
				const uiArchive = join(destination, "mizen-ui.tgz");
				const cliArchive = join(destination, "mizen-cli.tgz");
				await command(
					"pnpm",
					["pack", "--out", uiArchive],
					join(repository, "packages/ui")
				);
				await command(
					"pnpm",
					["pack", "--out", cliArchive],
					join(repository, "packages/cli")
				);
				const tools = join(destination, "tools");
				await command(
					"npm",
					[
						"install",
						"--prefix",
						tools,
						"--ignore-scripts",
						"--include=dev",
						"--no-audit",
						"--no-fund",
						cliArchive,
					],
					destination
				);
				const app = await plainViteFixture(destination, typescript);
				const manager = typescript ? "pnpm" : "npm";
				await command(
					manager,
					[
						"install",
						"--ignore-scripts",
						...(typescript ? ["--prod=false"] : ["--include=dev"]),
					],
					app
				);
				const config = await readFile(join(app, "vite.config.js"), "utf8");
				const html = await readFile(join(app, "index.html"), "utf8");
				const binary = join(tools, "node_modules/@mizen-labs/cli/dist/cli.js");
				const args = [
					binary,
					"init",
					"--cwd",
					app,
					"--package",
					uiArchive,
					"--json",
				];
				const preview = JSON.parse(
					(await command(process.execPath, [...args, "--dry-run"], app)).stdout
				);
				expect(
					preview.data.plan.edits.map((edit: { path: string }) => edit.path)
				).toEqual([typescript ? "src/main.tsx" : "src/main.jsx"]);
				const applied = JSON.parse(
					(await command(process.execPath, [...args, "--yes"], app)).stdout
				);
				expect(applied.data.verification.status).toBe("healthy");
				expect(await readFile(join(app, "vite.config.js"), "utf8")).toBe(
					config
				);
				expect(await readFile(join(app, "index.html"), "utf8")).toBe(html);
				const repeated = JSON.parse(
					(
						await command(
							process.execPath,
							[binary, "init", "--cwd", app, "--yes", "--json"],
							app
						)
					).stdout
				);
				expect(repeated.data.status).toBe("unchanged");
				await command(manager, ["run", "build"], app);
				server = await productionServer(app, true);
				await browserChecks(server.origin, true);
			} finally {
				await stop(server?.processHandle);
				await rm(destination, { force: true, recursive: true });
			}
		},
		300_000
	);
}

async function firstClientFrame(page: import("playwright").Page) {
	await page.reload({ waitUntil: "networkidle" });
	await expect
		.poll(() =>
			page.evaluate(
				() => (window as unknown as Record<string, unknown>).__mizenFirstTheme
			)
		)
		.toBe("dark");
}
