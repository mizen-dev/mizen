"use client";

import { Button, Terminal, type TerminalStatus } from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";
import { useCallback, useRef, useState } from "react";

const styles = create({
	frame: {
		display: "flex",
		flexDirection: "column",
		gap: 2,
		maxInlineSize: "34rem",
		minBlockSize: "18rem",
		minInlineSize: 0,
		width: "100%",
	},
	replay: { alignSelf: "flex-start", marginBlockStart: "1rem" },
});

const ESC = String.fromCharCode(27);
const bold = (text: string) => `${ESC}[1m${text}${ESC}[22m`;
const dim = (text: string) => `${ESC}[2m${text}${ESC}[22m`;
const red = (text: string) => `${ESC}[31m${text}${ESC}[39m`;

const green = (text: string) => `${ESC}[32m${text}${ESC}[39m`;

// What the agent runs, in order, and what each prints.
const steps = [
	{
		command: "pnpm lint",
		lines: [
			"> mizen-docs@0.0.0 lint",
			"> biome check .",
			"",
			"Checked 1228 files in 957ms. No fixes applied.",
		],
	},
	{
		command: "pnpm test",
		lines: [
			"> mizen-docs@0.0.0 test",
			"> vitest run",
			"",
			` ${green("✓")} tests/card-contract.test.tsx ${dim("(12 tests) 38ms")}`,
			` ${green("✓")} tests/card-layout.test.ts ${dim("(8 tests) 412ms")}`,
			` ${green("✓")} tests/settings-sidebar.test.tsx ${dim("(5 tests) 96ms")}`,
			"",
			` ${bold("Test Files")}  3 passed (3)`,
			`      ${bold("Tests")}  25 passed (25)`,
		],
	},
	{
		command: "pnpm build",
		lines: [
			"> mizen-docs@0.0.0 build",
			"> next build",
			"",
			`  ${bold("▲ Next.js 16.0.0")}`,
			"",
			"  Creating an optimized production build ...",
			` ${green("✓")} Compiled successfully in 4.2s`,
			"   Linting and checking validity of types ...",
			` ${green("✓")} Generating static pages (124/124)`,
			"   Finalizing page optimization ...",
			"",
			`Route (app)                         ${dim("Size  First Load JS")}`,
			"┌ ○ /                               1.9 kB         112 kB",
			"├ ● /docs/components/[slug]         4.1 kB         131 kB",
			"└ ƒ /api/search                      141 B         102 kB",
		],
	},
] as const;

const LINE_MS = 140;
// A beat with no new output before a command exits and the next begins.
const EXIT_TICKS = 3;

// Where the run is: which command, and how many of its lines have printed.
function progressAt(tick: number) {
	let left = tick;
	for (const [index, step] of steps.entries()) {
		const span = step.lines.length + EXIT_TICKS;
		if (left < span) {
			return { lines: Math.min(left, step.lines.length), step: index };
		}
		left -= span;
	}
	return { lines: 0, step: steps.length };
}

const TOTAL_TICKS = steps.reduce(
	(sum, step) => sum + step.lines.length + EXIT_TICKS,
	0
);

// The agent runs its checks one after another; each command appears when it
// starts, streams its output, and folds once it passes.
export function AgentCommands() {
	const [tick, setTick] = useState(0);
	// Each replay is a new run, so its commands start over with fresh timing.
	const [run, setRun] = useState(0);
	const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
	const play = useCallback(() => {
		clearInterval(timer.current);
		let current = 0;
		setTick(0);
		setRun((previous) => previous + 1);
		timer.current = setInterval(() => {
			current += 1;
			setTick(current);
			if (current >= TOTAL_TICKS) {
				clearInterval(timer.current);
			}
		}, LINE_MS);
	}, []);
	const start = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) {
				return;
			}
			play();
			return () => clearInterval(timer.current);
		},
		[play]
	);
	const progress = progressAt(tick);
	return (
		<div ref={start} {...props(styles.frame)}>
			{steps.slice(0, progress.step + 1).map((step, index) => (
				<Terminal
					command={step.command}
					key={`${step.command}-${run}`}
					output={step.lines
						.slice(
							0,
							index < progress.step ? step.lines.length : progress.lines
						)
						.join("\n")}
					status={index < progress.step ? "complete" : "running"}
				/>
			))}
			<span {...props(styles.replay)}>
				<Button onClick={play} size="sm" variant="outline">
					Replay
				</Button>
			</span>
		</div>
	);
}

const lintOutput = [
	"> mizen-docs@0.0.0 lint",
	"> eslint .",
	"",
	"app/settings/sidebar.tsx",
	`  14:7  ${red("error")}  'width' is assigned a value but never used  ${dim("no-unused-vars")}`,
	"",
	"app/components/card.tsx",
	`  42:5  ${red("error")}  Unexpected any. Specify a different type  ${dim("@typescript-eslint/no-explicit-any")}`,
	"",
	red(bold("✖ 2 problems (2 errors, 0 warnings)")),
].join("\n");

// A failed command opens to its output, with the errors in red, and Retry.
export function FailedCommand() {
	const [status, setStatus] = useState<TerminalStatus>("error");
	const retry = useCallback(() => {
		setStatus("running");
		setTimeout(() => setStatus("complete"), 1400);
	}, []);
	return (
		<div {...props(styles.frame)}>
			<Terminal
				command="pnpm lint"
				duration={status === "error" ? 2.6 : undefined}
				exitCode={status === "error" ? 1 : undefined}
				onRetry={retry}
				output={status === "error" ? lintOutput : ""}
				status={status}
			/>
		</div>
	);
}
