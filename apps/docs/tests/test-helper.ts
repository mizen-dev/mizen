import { type ChildProcess, spawn } from "node:child_process";
import { createServer } from "node:net";
import type { Page } from "playwright";

const FETCH_TIMEOUT_MS = 1000;
const RETRY_DELAY_MS = 250;
const SERVER_START_TIMEOUT_MS = 30_000;
const STDERR_LINE_CHAR_LIMIT = 2000;
const STDERR_TAIL_LINES = 20;
const CARRIAGE_RETURN_REGEX = /\r$/u;

export interface TestServerHandle {
	readonly server?: ChildProcess;
	readonly url: string;
}

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

function resolveTestUrl(): string | undefined {
	return process.env.MIZEN_DOCS_TEST_URL;
}

function sendSignal(server: ChildProcess, signal: "SIGTERM" | "SIGKILL"): void {
	const { pid } = server;
	if (pid === undefined) {
		server.kill(signal);
		return;
	}
	try {
		process.kill(-pid, signal);
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ESRCH") {
			return;
		}
		throw error;
	}
}

function waitForProcessExit(
	server: ChildProcess,
	timeoutMs: number
): Promise<boolean> {
	if (server.exitCode !== null || server.signalCode !== null) {
		return Promise.resolve(true);
	}
	return new Promise<boolean>((resolve) => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		const onExit = () => {
			if (timer !== undefined) {
				clearTimeout(timer);
			}
			resolve(true);
		};
		timer = setTimeout(() => {
			server.off("exit", onExit);
			resolve(server.exitCode !== null || server.signalCode !== null);
		}, timeoutMs);
		server.once("exit", onExit);
	});
}

async function stopProcess(server?: ChildProcess): Promise<void> {
	if (!server || server.exitCode !== null || server.signalCode !== null) {
		return;
	}

	sendSignal(server, "SIGTERM");
	const terminated = await waitForProcessExit(server, 3000);
	if (terminated) {
		return;
	}

	sendSignal(server, "SIGKILL");
	const killed = await waitForProcessExit(server, 2000);
	if (!killed) {
		throw new Error(
			`Failed to terminate server process (PID ${server.pid}) with SIGKILL`
		);
	}
}

function createStderrTail() {
	let pending = "";
	const lines: string[] = [];

	return {
		append(chunk: string): void {
			const parts = `${pending}${chunk}`.split("\n");
			pending = (parts.pop() ?? "").slice(-STDERR_LINE_CHAR_LIMIT);
			const completeLines = parts
				.map((line) =>
					line.replace(CARRIAGE_RETURN_REGEX, "").slice(-STDERR_LINE_CHAR_LIMIT)
				)
				.filter((line) => line !== "");
			lines.push(...completeLines);
			lines.splice(0, Math.max(0, lines.length - STDERR_TAIL_LINES));
		},
		read(): string {
			const output = pending === "" ? lines : [...lines, pending];
			return output.slice(-STDERR_TAIL_LINES).join("\n");
		},
	};
}

function serverErrorMessage(message: string, readStderr: () => string): string {
	const stderr = readStderr();
	return stderr === "" ? message : `${message}\nServer stderr tail:\n${stderr}`;
}

async function probeServer(serverUrl: string, timeoutMs: number) {
	try {
		return (await fetch(serverUrl, { signal: AbortSignal.timeout(timeoutMs) }))
			.ok;
	} catch (error) {
		if (
			error instanceof TypeError ||
			(error instanceof DOMException && error.name === "TimeoutError")
		) {
			return false;
		}
		throw error;
	}
}

function exitedServerError(server: ChildProcess, readStderr: () => string) {
	return new Error(
		serverErrorMessage(
			`Server process exited prematurely with code ${server.exitCode} (signal: ${server.signalCode})`,
			readStderr
		)
	);
}

async function waitForServer(
	serverUrl: string,
	server: ChildProcess,
	readStderr: () => string
): Promise<void> {
	const deadline = performance.now() + SERVER_START_TIMEOUT_MS;
	let rejectProcessFailure: (reason: Error) => void = () => undefined;
	const processFailure = new Promise<never>((_resolve, reject) => {
		rejectProcessFailure = reject;
	});
	const onError = (error: Error) => {
		rejectProcessFailure(
			new Error(
				serverErrorMessage("Failed to start server process", readStderr),
				{
					cause: error,
				}
			)
		);
	};
	const onExit = () =>
		rejectProcessFailure(exitedServerError(server, readStderr));
	server.once("error", onError);
	server.once("exit", onExit);

	try {
		if (server.exitCode !== null || server.signalCode !== null) {
			throw exitedServerError(server, readStderr);
		}
		const pollServer = async (): Promise<void> => {
			if (performance.now() >= deadline) {
				throw new Error(
					serverErrorMessage(`Timed out waiting for ${serverUrl}`, readStderr)
				);
			}
			const remainingMs = Math.max(1, Math.ceil(deadline - performance.now()));
			const ready = await Promise.race([
				probeServer(serverUrl, Math.min(FETCH_TIMEOUT_MS, remainingMs)),
				processFailure,
			]);
			if (ready) {
				return;
			}
			const delayMs = Math.max(
				0,
				Math.min(RETRY_DELAY_MS, deadline - performance.now())
			);
			await Promise.race([
				new Promise<void>((resolve) => setTimeout(resolve, delayMs)),
				processFailure,
			]);
			return pollServer();
		};
		await pollServer();
	} finally {
		server.off("error", onError);
		server.off("exit", onExit);
	}
}

function createStartupCleanupError(
	startupError: unknown,
	cleanupError: unknown
): AggregateError {
	return new AggregateError(
		[startupError, cleanupError],
		"Failed to start test server and cleanup failed"
	);
}

export async function setupTestServer(
	docsRoot: string
): Promise<TestServerHandle> {
	const existingUrl = resolveTestUrl();
	if (existingUrl) {
		return { url: existingUrl };
	}
	const port = await getAvailablePort();
	const server = spawn(
		"pnpm",
		["exec", "vp", "dev", "--host", "127.0.0.1", "--port", String(port)],
		{
			cwd: docsRoot,
			detached: true,
			stdio: ["ignore", "ignore", "pipe"],
		}
	);
	const stderrTail = createStderrTail();
	const onStderr = (chunk: string) => stderrTail.append(chunk);
	server.stderr.setEncoding("utf8");
	server.stderr.on("data", onStderr);
	server.once("close", () => server.stderr.off("data", onStderr));
	const url = `http://127.0.0.1:${port}`;
	let startupError: unknown;
	try {
		await waitForServer(url, server, stderrTail.read);
		return { server, url };
	} catch (error) {
		startupError = error;
	}

	try {
		await stopProcess(server);
	} catch (cleanupError) {
		throw createStartupCleanupError(startupError, cleanupError);
	}

	throw startupError;
}

export async function teardownTestServer(
	handle?: TestServerHandle
): Promise<void> {
	await stopProcess(handle?.server);
}

const THEME_TOGGLE_NAME = /^Theme: /u;
const THEME_LABELS = {
	dark: "Theme: Dark",
	light: "Theme: Light",
	system: "Theme: System",
} as const;

// Cycles the header's theme toggle until it shows `theme`. The icon renders
// once the page hydrates, so clicks before it would be lost.
export async function setDocsTheme(
	page: Page,
	theme: keyof typeof THEME_LABELS,
	clicksLeft = 3
): Promise<void> {
	const toggle = page.getByRole("button", { name: THEME_TOGGLE_NAME });
	await toggle.locator("svg").waitFor();
	const label = await toggle.getAttribute("aria-label");
	if (label === THEME_LABELS[theme]) {
		return;
	}
	if (clicksLeft === 0) {
		throw new Error(`Theme toggle never reached ${theme}`);
	}
	await toggle.click();
	await page
		.getByRole("button", { exact: true, name: label ?? "" })
		.waitFor({ state: "detached" });
	await setDocsTheme(page, theme, clicksLeft - 1);
}
