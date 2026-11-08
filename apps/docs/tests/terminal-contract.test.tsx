// @vitest-environment happy-dom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	parseAnsi,
	plainOutput,
} from "../../../packages/ui/src/components/terminal/ansi";
import { Terminal } from "../../../packages/ui/src/components/terminal/terminal";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(values: T): T => values,
	defineMarker: () => ({}),
	defineVars: <T extends object>(values: T): T => values,
	keyframes: () => "keyframes",
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

const ESC = String.fromCharCode(27);

function noop() {
	// Only whether a handler exists matters here.
}

function render(markup: string) {
	const container = document.createElement("div");
	container.innerHTML = markup;
	return container;
}

describe("Terminal output", () => {
	it("keeps red, bold, and dim, and drops other codes", () => {
		const spans = parseAnsi(
			`${ESC}[1;31merror${ESC}[0m ok ${ESC}[32mpass${ESC}[39m ${ESC}[2mnote${ESC}[22m${ESC}[2K`
		);
		expect(spans).toEqual([
			{ bold: true, muted: false, red: true, text: "error" },
			{ bold: false, muted: false, red: false, text: " ok " },
			// Green has no text-safe token, so it stays plain.
			{ bold: false, muted: false, red: false, text: "pass" },
			{ bold: false, muted: false, red: false, text: " " },
			{ bold: false, muted: true, red: false, text: "note" },
		]);
	});

	it("keeps only the last state of a line that redraws itself", () => {
		expect(plainOutput("10%\r50%\r100%\ndone\r\n")).toBe("100%\ndone\n");
		expect(plainOutput(`${ESC}]0;title${String.fromCharCode(7)}build`)).toBe(
			"build"
		);
	});
});

describe("Terminal contract", () => {
	it("names a running command and opens only once output arrives", () => {
		const root = render(
			renderToStaticMarkup(<Terminal command="pnpm build" status="running" />)
		);
		// Nothing printed yet, so nothing to open: a plain line.
		expect(root.querySelector("button")).toBeNull();
		expect(root.querySelector('[data-slot="terminal-line"]')?.textContent).toBe(
			"Running pnpm buildRunning"
		);
		const streaming = render(
			renderToStaticMarkup(
				<Terminal command="pnpm build" output="> next build" status="running" />
			)
		);
		expect(
			streaming.querySelector("button")?.getAttribute("aria-expanded")
		).toBe("true");
		expect(
			streaming
				.querySelector('[data-slot="terminal-output"]')
				?.getAttribute("aria-label")
		).toBe("Output");
	});

	it("names a finished command and its exit code", () => {
		const done = render(
			renderToStaticMarkup(
				<Terminal command="pnpm test" duration={8.4} status="complete" />
			)
		);
		expect(done.querySelector('[data-slot="terminal-line"]')?.textContent).toBe(
			"Ran pnpm test8.4sDone"
		);
		expect(done.querySelector('[data-slot="terminal-details"]')).toBeNull();
		const failed = render(
			renderToStaticMarkup(
				<Terminal
					command="pnpm lint"
					duration={2.6}
					exitCode={1}
					onRetry={noop}
					output="error"
					status="error"
				/>
			)
		);
		const line = failed.querySelector("button");
		expect(line?.textContent).toBe("pnpm lint exited with code 12.6sFailed");
		expect(line?.getAttribute("aria-expanded")).toBe("true");
		expect(
			failed.querySelector('[data-slot="terminal-retry"]')?.textContent
		).toBe("The command failed.Retry");
	});
});
