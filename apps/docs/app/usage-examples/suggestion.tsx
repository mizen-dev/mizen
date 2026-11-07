"use client";
import {
	Composer,
	ComposerActionGroup,
	ComposerActions,
	ComposerInput,
	ComposerSubmit,
	type ComposerValue,
	Suggestion,
	Suggestions,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import {
	IconBug,
	IconFlask,
	IconLoader2,
	IconMoon,
	IconPackageOff,
} from "@tabler/icons-react";
import { useCallback, useRef, useState } from "react";
import { composerExampleStyles } from "./composer";

const starters = [
	"Add a dark mode toggle",
	"Fix the failing build",
	"Write tests for the form",
	"Add a loading state",
	"Find unused dependencies",
];

const WORK_MS = 2400;

// Above an empty composer: one click sends the prompt, and the row waits
// while the agent works on it.
export function SuggestionStarters() {
	const [value, setValue] = useState<ComposerValue>([]);
	const [working, setWorking] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const send = useCallback(() => {
		setValue([]);
		setWorking(true);
		// Simulated agent work; Stop ends it early.
		clearTimeout(timer.current);
		timer.current = setTimeout(() => setWorking(false), WORK_MS);
	}, []);
	const stop = useCallback(() => {
		clearTimeout(timer.current);
		setWorking(false);
	}, []);
	return (
		<div {...props(composerExampleStyles.container)}>
			<Suggestions>
				{starters.map((starter) => (
					<Suggestion
						disabled={working}
						key={starter}
						onClick={send}
						suggestion={starter}
					/>
				))}
			</Suggestions>
			<Composer
				onStop={stop}
				onSubmit={send}
				onValueChange={setValue}
				value={value}
				working={working}
			>
				<ComposerInput
					aria-label="Message"
					placeholder="Ask the agent…"
					render={<textarea />}
				/>
				<ComposerActions>
					<ComposerActionGroup align="end">
						<ComposerSubmit />
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
		</div>
	);
}

const tasks = [
	{ icon: <IconMoon size={16} />, text: "Add a dark mode toggle" },
	{ icon: <IconBug size={16} />, text: "Fix the failing build" },
	{ icon: <IconFlask size={16} />, text: "Write tests for the form" },
	{ icon: <IconLoader2 size={16} />, text: "Add a loading state" },
	{ icon: <IconPackageOff size={16} />, text: "Find unused dependencies" },
];

const ignore = () => undefined;

// An icon says what kind of task each one starts.
export function SuggestionIcons() {
	return (
		<div {...props(composerExampleStyles.container)}>
			<Suggestions>
				{tasks.map((task) => (
					<Suggestion
						icon={task.icon}
						key={task.text}
						onClick={ignore}
						suggestion={task.text}
					/>
				))}
			</Suggestions>
		</div>
	);
}
