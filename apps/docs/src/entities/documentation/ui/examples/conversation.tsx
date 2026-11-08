"use client";
import {
	Button,
	Composer,
	ComposerActionGroup,
	ComposerActions,
	ComposerInput,
	ComposerSubmit,
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationFooter,
	Suggestion,
	Suggestions,
} from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useCallback } from "react";
import {
	type Beat,
	called,
	calling,
	emptyScene,
	planning,
	replying,
	running,
	type Scene,
	sending,
	settle,
	step,
	TurnView,
	thinking,
	typing,
	usePlayer,
} from "./conversation-script";

const conversationExampleStyles = create({
	// A bounded height: the thread scrolls inside it.
	frame: {
		blockSize: "36rem",
		display: "flex",
		flexDirection: "column",
		inlineSize: "100%",
		maxInlineSize: "48rem",
	},
	// The example and, under it, a row kept for Replay, so nothing moves
	// when it appears.
	player: {
		display: "flex",
		flexDirection: "column",
		gap: "0.5rem",
		inlineSize: "100%",
		maxInlineSize: "48rem",
	},
	replay: {
		display: "flex",
		justifyContent: "flex-end",
		minBlockSize: "2rem",
	},
});

const noop = () => undefined;

// The composer the script types into. It reads the scene, so the person
// watches each prompt being written before it sends.
function ScriptedFooter({ scene }: { scene: Scene }) {
	return (
		<ConversationFooter>
			<Composer
				onSubmit={noop}
				onValueChange={noop}
				value={scene.draft ? [{ text: scene.draft, type: "text" }] : []}
				working={scene.working}
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
		</ConversationFooter>
	);
}

function Replay({ done, onReplay }: { done: boolean; onReplay: () => void }) {
	return (
		<div {...props(conversationExampleStyles.replay)}>
			{done ? (
				<Button onClick={onReplay} size="sm" variant="outline">
					<IconPlayerPlay aria-hidden="true" size={16} />
					Replay
				</Button>
			) : null}
		</div>
	);
}

const DARK_MODE = "Add a dark mode toggle to the settings page.";
const SYNC = "Make it remember the choice across devices.";

const firstTurn: Beat[] = [
	...typing(DARK_MODE),
	sending("q1", "a1"),
	...thinking(
		"a1",
		"Settings lives in app/settings. Before adding a control I need to know how the theme is stored, so the toggle and the header switch never disagree."
	),
	planning("a1", "Add a dark mode toggle", [
		"Find how the theme is stored",
		"Add the toggle to settings",
		"Run the tests",
	]),
	step("a1", 0, "running"),
	calling("a1", {
		id: "read",
		input: { path: "app/layout.tsx" },
		name: "read_file",
		status: "running",
		title: "Reading app/layout.tsx",
	}),
	called("a1", "read", {
		output: 'ThemeProvider attribute="class" storageKey="theme"',
		title: "Read app/layout.tsx",
	}),
	step("a1", 0, "complete"),
	step("a1", 1, "running"),
	calling("a1", {
		id: "edit",
		input: { path: "app/settings/page.tsx" },
		name: "edit_file",
		status: "running",
		title: "Editing app/settings/page.tsx",
	}),
	called("a1", "edit", {
		output: '+ <ThemeSwitch label="Dark mode" />',
		title: "Edited app/settings/page.tsx",
	}),
	step("a1", 1, "complete"),
	step("a1", 2, "running"),
	...running("a1", "pnpm test", [
		"> vitest run",
		"",
		" ✓ settings/theme-switch.test.tsx (6 tests)",
		" ✓ settings/page.test.tsx (12 tests)",
		" ✓ layout.test.tsx (24 tests)",
		"",
		" Test Files  3 passed (3)",
		"      Tests  42 passed (42)",
	]),
	step("a1", 2, "complete"),
	...replying(
		"a1",
		"Added a Dark mode switch to Settings. It reads and writes the same theme key as the header switch, so the two stay in step, and it follows the system setting until someone picks one. All 42 tests pass."
	),
];

const secondTurn: Beat[] = [
	...typing(SYNC),
	sending("q2", "a2", 900),
	...thinking(
		"a2",
		"The theme is in localStorage, which stays on one device. Preferences already sync through the account, so the choice belongs there."
	),
	calling("a2", {
		id: "prefs",
		input: { path: "lib/preferences.ts" },
		name: "read_file",
		status: "running",
		title: "Reading lib/preferences.ts",
	}),
	called("a2", "prefs", {
		output: "export const preferences = { language, density }",
		title: "Read lib/preferences.ts",
	}),
	calling("a2", {
		id: "save",
		input: { path: "lib/preferences.ts" },
		name: "edit_file",
		status: "running",
		title: "Editing lib/preferences.ts",
	}),
	called("a2", "save", {
		output: '+ theme: "system" | "light" | "dark"',
		title: "Edited lib/preferences.ts",
	}),
	...replying(
		"a2",
		"The choice now saves to the account's preferences next to language and density, so it follows the person to every device. On a device that has never synced, it still starts from the system setting."
	),
];

const script = [...firstTurn, ...secondTurn];

// The thread plays by itself: the prompt is typed and sent, the agent
// thinks, plans, reads and edits files, runs the tests, and replies. Each
// sent turn settles near the top while its reply grows under it.
export function AgentConversation() {
	const { done, play, scene, watch } = usePlayer(script);
	const replay = useCallback(() => play(), [play]);
	return (
		<div ref={watch} {...props(conversationExampleStyles.player)}>
			<div {...props(conversationExampleStyles.frame)}>
				<Conversation>
					<ConversationContent busy={scene.working}>
						<ConversationEmptyState
							description="The agent can read your code, run commands, and make changes."
							title="What should we build?"
						/>
						{scene.turns.map((turn) => (
							<TurnView key={turn.id} turn={turn} />
						))}
					</ConversationContent>
					<ScriptedFooter scene={scene} />
				</Conversation>
			</div>
			<Replay done={done} onReplay={replay} />
		</div>
	);
}

// The prompt goes into the draft first, so sending carries it.
function withDraft(prompt: string, beat: Beat): Beat {
	return { ...beat, apply: (scene) => beat.apply({ ...scene, draft: prompt }) };
}

// A short turn for each starter: think, look, answer.
function starterTurn(prompt: string, file: string, answer: string): Beat[] {
	return [
		withDraft(prompt, sending("q", "a", 0)),
		...thinking("a", `To answer this I should look at ${file} first.`),
		calling("a", {
			id: "look",
			input: { path: file },
			name: "read_file",
			status: "running",
			title: `Reading ${file}`,
		}),
		called("a", "look", { title: `Read ${file}` }, 700),
		...replying("a", answer),
	];
}

const starters = [
	{
		answer:
			"The build fails on a missing type export: SettingsSidebarProps is used in the docs but not exported from the package. Adding it to the index fixes it.",
		file: "packages/ui/src/index.ts",
		prompt: "Fix the failing build",
	},
	{
		answer:
			"The form has no tests yet. I'd cover the required fields, the email check, and that Save stays enabled and reports errors on submit.",
		file: "app/settings/profile-form.tsx",
		prompt: "Write tests for the form",
	},
	{
		answer:
			"Three dependencies are never imported: lodash.debounce, classnames, and dayjs. Removing them saves 41 kB in the client bundle.",
		file: "package.json",
		prompt: "Find unused dependencies",
	},
];

const nothing: Beat[] = [];

// Before the first turn, a start screen. A starter sends in one click and
// the agent answers it.
export function ConversationStart() {
	const { play, scene } = usePlayer(nothing);
	const choose = useCallback(
		(prompt: string) => {
			const chosen = starters.find((item) => item.prompt === prompt);
			if (chosen) {
				play(
					starterTurn(chosen.prompt, chosen.file, chosen.answer),
					emptyScene
				);
			}
		},
		[play]
	);
	return (
		<div {...props(conversationExampleStyles.frame)}>
			<Conversation>
				<ConversationContent busy={scene.working}>
					<ConversationEmptyState
						description="The agent can read your code, run commands, and make changes."
						title="What should we build?"
					>
						<Suggestions>
							{starters.map((starter) => (
								<Suggestion
									key={starter.prompt}
									onClick={choose}
									suggestion={starter.prompt}
								/>
							))}
						</Suggestions>
					</ConversationEmptyState>
					{scene.turns.map((turn) => (
						<TurnView key={turn.id} turn={turn} />
					))}
				</ConversationContent>
				<ScriptedFooter scene={scene} />
			</Conversation>
		</div>
	);
}

const questions = [
	{ file: "card.styles.ts", text: "Why does Card break in the sidebar?" },
	{ file: "card.styles.ts", text: "Move it to container queries." },
	{ file: "card.styles.ts", text: "Which breakpoints did you keep?" },
	{ file: "tests/visual.test.ts", text: "Run the visual tests at 390px." },
	{ file: "grid.styles.ts", text: "Does the grid still line up?" },
	{ file: "card.stories.tsx", text: "Add a story for the narrow card." },
	{ file: "CHANGELOG.md", text: "Update the changelog draft." },
	{ file: "pull_request_template.md", text: "Open a pull request." },
];

// A finished thread, as it loads from history: each turn's thinking and
// tools folded, the reply in full.
const history = settle(
	questions.flatMap(({ file, text }, index) => [
		withDraft(text, sending(`q${index}`, `a${index}`, 0)),
		...thinking(`a${index}`, `This touches ${file}, so I'll start there.`),
		calling(`a${index}`, {
			id: "read",
			input: { path: file },
			name: "read_file",
			status: "running",
			title: `Reading ${file}`,
		}),
		called(`a${index}`, "read", { title: `Read ${file}` }, 0),
		...replying(
			`a${index}`,
			`Done. I checked ${file} and made the change; the visual tests pass in light, dark, and at 390px.`
		),
	])
);

// A long thread: the rail at the end edge marks each question; hover one
// to preview it, press it to jump there.
export function ConversationNavigation() {
	return (
		<div {...props(conversationExampleStyles.frame)}>
			<Conversation>
				<ConversationContent navigation>
					{history.turns.map((turn) => (
						<TurnView key={turn.id} turn={turn} />
					))}
				</ConversationContent>
				<ScriptedFooter scene={emptyScene} />
			</Conversation>
		</div>
	);
}
