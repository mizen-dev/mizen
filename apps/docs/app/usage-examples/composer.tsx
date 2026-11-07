"use client";
import {
	Button,
	Composer,
	ComposerActionGroup,
	ComposerActions,
	ComposerAttachment,
	ComposerAttachments,
	ComposerContextMeter,
	ComposerDictation,
	ComposerInput,
	ComposerPicker,
	type ComposerPickerOption,
	ComposerStatusBar,
	ComposerStatusBarGroup,
	ComposerStatusItem,
	ComposerSubmit,
	type ComposerValue,
	getComposerText,
} from "@mizen/ui";
import { create, props } from "@stylexjs/stylex";
import {
	IconBrandOpenai,
	IconFolder,
	IconGitBranch,
	IconHandStop,
	IconPencilBolt,
	IconPlus,
	IconRoute,
} from "@tabler/icons-react";
import {
	type ChangeEvent,
	type Dispatch,
	type SetStateAction,
	useCallback,
	useRef,
	useState,
} from "react";
import { AnthropicMark, GeminiMark } from "./provider-marks";

export const composerExampleStyles = create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: "0.5rem",
		maxWidth: "36rem",
		minWidth: 0,
		width: "100%",
	},
});

// Each provider names its own effort levels; these follow their APIs.
const low = { label: "Low", value: "low" };
const medium = { label: "Medium", value: "medium" };
const high = { label: "High", value: "high" };
const extraHigh = { label: "Extra high", value: "xhigh" };
const claudeEfforts = [
	low,
	medium,
	high,
	extraHigh,
	{ label: "Max", value: "max" },
];
const openAiEfforts = [low, medium, high, extraHigh];
const geminiEfforts = [low, medium, high];

const anthropic = {
	efforts: claudeEfforts,
	group: "Anthropic",
	icon: <AnthropicMark />,
};
const openAi = {
	efforts: openAiEfforts,
	group: "OpenAI",
	icon: <IconBrandOpenai size={16} />,
};
const google = {
	efforts: geminiEfforts,
	group: "Google",
	icon: <GeminiMark />,
};

// Models from any provider, grouped under its name, each with its mark and
// the effort levels it takes.
export const models: readonly ComposerPickerOption[] = [
	{ ...anthropic, label: "Claude Opus 5.5", value: "opus" },
	{ ...anthropic, label: "Claude Sonnet 5.5", value: "sonnet" },
	{ ...anthropic, label: "Claude Haiku 5.5", value: "haiku" },
	{ ...openAi, label: "GPT-6 Astra", value: "gpt-6-astra" },
	{ ...openAi, label: "GPT-6.1 Sol", value: "gpt-6.1-sol" },
	{ ...openAi, label: "GPT-6 Luna", value: "gpt-6-luna" },
	{ ...google, label: "Gemini 4 Argon", value: "gemini-4-argon" },
	{ ...google, label: "Gemini 3.8 Flash", value: "gemini-3.8-flash" },
];

// Keeps the level when the next model has it; otherwise falls back to
// Medium, which every provider offers.
export function useModelChoice(initial: string) {
	const [model, setModel] = useState(initial);
	const [effort, setEffort] = useState("high");
	const chooseModel = useCallback((next: string) => {
		setModel(next);
		const levels = models.find((item) => item.value === next)?.efforts ?? [];
		setEffort((current) =>
			levels.some((level) => level.value === current) ? current : "medium"
		);
	}, []);
	return { chooseModel, effort, model, setEffort };
}

const modes: readonly ComposerPickerOption[] = [
	{
		description: "Asks before it changes files or runs commands.",
		icon: <IconHandStop size={16} />,
		label: "Ask before edits",
		value: "ask",
	},
	{
		description: "Edits files on its own; still asks before commands.",
		icon: <IconPencilBolt size={16} />,
		label: "Edit automatically",
		value: "edit",
	},
	{
		description: "Reads and plans; changes nothing.",
		icon: <IconRoute size={16} />,
		label: "Plan only",
		value: "plan",
	},
];

// What the agent used so far, shaped like the AI SDK's `usage`. The app
// supplies prices; Mizen ships none.
const usage = {
	cachedInputTokens: 1200,
	inputTokens: 82_400,
	outputTokens: 24_100,
	reasoningTokens: 6300,
};
const cost = {
	cachedInput: 0.0004,
	input: 0.247,
	output: 0.362,
	reasoning: 0.095,
};

const DICTATED = "Add a dark mode toggle to the settings page".split(" ");
const WORD_MS = 220;

function appendWord(draft: ComposerValue, word: string): ComposerValue {
	const text = getComposerText(draft).trimEnd();
	return [{ text: text ? `${text} ${word}` : word, type: "text" }];
}

// Simulated speech: words arrive one at a time while it listens. A real app
// starts its recognizer here and appends what it hears.
function useDictation(setValue: Dispatch<SetStateAction<ComposerValue>>) {
	const [listening, setListening] = useState(false);
	const timer = useRef<ReturnType<typeof setInterval>>(undefined);
	const halt = useCallback(() => {
		clearInterval(timer.current);
		setListening(false);
	}, []);
	const toggle = useCallback(
		(next: boolean) => {
			clearInterval(timer.current);
			setListening(next);
			if (!next) {
				return;
			}
			let index = 0;
			timer.current = setInterval(() => {
				if (index >= DICTATED.length) {
					halt();
					return;
				}
				const word = DICTATED[index] ?? "";
				index += 1;
				setValue((draft) => appendWord(draft, word));
			}, WORD_MS);
		},
		[halt, setValue]
	);
	// Stops the words if the example unmounts mid-sentence.
	const release = useCallback((node: HTMLDivElement | null) => {
		if (!node) {
			return;
		}
		return () => clearInterval(timer.current);
	}, []);
	return { listening, release, toggle };
}

const WORK_MS = 2400;

function FileTile({
	file,
	onRemove,
}: {
	file: File;
	onRemove: (file: File) => void;
}) {
	const remove = useCallback(() => onRemove(file), [file, onRemove]);
	return <ComposerAttachment name={file.name} onRemove={remove} />;
}

// One tile per chosen file, removable.
function FileTray({
	files,
	onRemove,
}: {
	files: readonly File[];
	onRemove: (file: File) => void;
}) {
	if (files.length === 0) {
		return null;
	}
	return (
		<ComposerAttachments>
			{files.map((file) => (
				<FileTile
					file={file}
					key={`${file.name}-${file.size}`}
					onRemove={onRemove}
				/>
			))}
		</ComposerAttachments>
	);
}

// The composer for a coding agent: files, the permission mode, and the
// model in the toolbar; where it works and how much context is left below.
export function ProjectPromptComposer() {
	const [value, setValue] = useState<ComposerValue>([]);
	const [files, setFiles] = useState<File[]>([]);
	const [mode, setMode] = useState("ask");
	const { chooseModel, effort, model, setEffort } = useModelChoice("opus");
	const [working, setWorking] = useState(false);
	const workTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const fileInput = useRef<HTMLInputElement>(null);
	const attach = useCallback(() => fileInput.current?.click(), []);
	const selectFiles = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			setFiles(Array.from(event.currentTarget.files ?? [])),
		[]
	);
	const remove = useCallback(
		(file: File) =>
			setFiles((current) => current.filter((item) => item !== file)),
		[]
	);
	const send = useCallback(() => {
		setValue([]);
		setFiles([]);
		setWorking(true);
		// Simulated agent work; Stop ends it early.
		clearTimeout(workTimer.current);
		workTimer.current = setTimeout(() => setWorking(false), WORK_MS);
	}, []);
	const stop = useCallback(() => {
		clearTimeout(workTimer.current);
		setWorking(false);
	}, []);
	const { listening, release, toggle } = useDictation(setValue);
	return (
		<div ref={release} {...props(composerExampleStyles.container)}>
			<input
				aria-label="Choose context files"
				hidden
				multiple
				onChange={selectFiles}
				ref={fileInput}
				type="file"
			/>
			<Composer
				allowEmpty={files.length > 0}
				onStop={stop}
				onSubmit={send}
				onValueChange={setValue}
				value={value}
				working={working}
			>
				<FileTray files={files} onRemove={remove} />
				<ComposerInput
					aria-label="Ask about this project"
					placeholder="Ask the agent to change, explain, or build something…"
					render={<textarea />}
				/>
				<ComposerActions>
					<ComposerActionGroup>
						<Button
							aria-label="Add files"
							onClick={attach}
							size="icon-sm"
							variant="ghost"
						>
							<IconPlus aria-hidden="true" size={18} />
						</Button>
						<ComposerPicker
							label="Permissions"
							learnMoreHref="/docs/components/approval-card"
							onValueChange={setMode}
							options={modes}
							value={mode}
						/>
					</ComposerActionGroup>
					<ComposerActionGroup align="end">
						<ComposerPicker
							effort={effort}
							label="Model"
							onEffortChange={setEffort}
							onValueChange={chooseModel}
							options={models}
							value={model}
						/>
						<ComposerDictation
							listening={listening}
							onListeningChange={toggle}
						/>
						<ComposerSubmit />
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
			<ComposerStatusBar>
				<ComposerStatusBarGroup>
					<ComposerStatusItem>
						<IconGitBranch aria-hidden="true" size={14} />
						main
					</ComposerStatusItem>
					<ComposerStatusItem>
						<IconFolder aria-hidden="true" size={14} />
						mizen
					</ComposerStatusItem>
				</ComposerStatusBarGroup>
				<ComposerStatusBarGroup>
					<ComposerContextMeter
						cost={cost}
						maxTokens={200_000}
						usage={usage}
						usedTokens={114_000}
					/>
				</ComposerStatusBarGroup>
			</ComposerStatusBar>
		</div>
	);
}

// While the agent works, light travels the rim and Stop replaces Send. The
// person can keep typing their next message. The demo works until Stop;
// sending again starts it over.
export function ComposerWorkingExample() {
	const [working, setWorking] = useState(true);
	const [value, setValue] = useState<ComposerValue>([]);
	const run = useCallback(() => {
		setValue([]);
		setWorking(true);
	}, []);
	const stop = useCallback(() => setWorking(false), []);
	return (
		<div {...props(composerExampleStyles.container)}>
			<Composer
				onStop={stop}
				onSubmit={run}
				onValueChange={setValue}
				value={value}
				working={working}
			>
				<ComposerInput
					aria-label="Follow-up message"
					placeholder="Ask a follow-up…"
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

const UPLOAD_TICK_MS = 90;

// Files keep their tiles while they upload; the share fills each ring.
export function ComposerAttachmentsExample() {
	const [progress, setProgress] = useState(0);
	const timer = useRef<ReturnType<typeof setInterval>>(undefined);
	const upload = useCallback((node: HTMLDivElement | null) => {
		if (!node) {
			return;
		}
		let share = 0;
		timer.current = setInterval(() => {
			share = Math.min(100, share + 4);
			setProgress(share);
			if (share >= 100) {
				clearInterval(timer.current);
			}
		}, UPLOAD_TICK_MS);
		return () => clearInterval(timer.current);
	}, []);
	return (
		<div ref={upload} {...props(composerExampleStyles.container)}>
			<Composer
				defaultValue={[
					{ text: "Summarize the trends in this report.", type: "text" },
				]}
			>
				<ComposerAttachments>
					<ComposerAttachment
						name="report-cover.jpg"
						preview="/media/report-cover.jpg"
					/>
					<ComposerAttachment name="monthly-report.csv" />
					<ComposerAttachment name="q3-review.pdf" progress={progress} />
				</ComposerAttachments>
				<ComposerInput aria-label="Message with files" render={<textarea />} />
				<ComposerActions>
					<ComposerActionGroup>
						<Button aria-label="Add files" size="icon-sm" variant="ghost">
							<IconPlus aria-hidden="true" size={18} />
						</Button>
					</ComposerActionGroup>
					<ComposerActionGroup align="end">
						<ComposerSubmit disabled={progress < 100} />
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
		</div>
	);
}
