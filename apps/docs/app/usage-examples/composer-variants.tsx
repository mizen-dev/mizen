"use client";
import {
	Button,
	Composer,
	ComposerActionGroup,
	ComposerActions,
	ComposerInput,
	ComposerItem,
	type ComposerItemValue,
	ComposerList,
	ComposerPicker,
	ComposerPopup,
	ComposerSubmit,
	ComposerToken,
	type ComposerTokenPart,
	type ComposerValue,
	getComposerText,
	Text,
	useComposerContext,
} from "@mizen/ui";
import { create, props } from "@stylexjs/stylex";
import {
	IconAt,
	IconFile,
	IconPlus,
	IconTerminal2,
	IconUser,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { composerExampleStyles, models, useModelChoice } from "./composer";

const styles = create({
	result: { minHeight: "1.25rem", paddingInline: "0.75rem" },
});

// What @ can add: files from the project, and people to loop in.
const context = [
	{
		description: "packages/ui/src/components/card",
		id: "card",
		kind: "file",
		label: "card.tsx",
	},
	{
		description: "apps/docs/app/settings",
		id: "sidebar",
		kind: "file",
		label: "settings-sidebar.tsx",
	},
	{
		description: "Design lead",
		id: "maya",
		kind: "person",
		label: "Maya Chen",
	},
	{
		description: "Engineering",
		id: "alex",
		kind: "person",
		label: "Alex Rivera",
	},
];

// What / can run on the draft.
const commands = [
	{ id: "summarize", label: "Summarize", type: "action" as const },
	{ id: "review", label: "Review changes", type: "action" as const },
	{ id: "tests", label: "Write tests", type: "action" as const },
];

function renderContextToken(token: ComposerTokenPart) {
	return (
		<ComposerToken
			icon={token.kind === "file" ? <IconFile /> : <IconUser />}
			token={token}
			variant="chip"
		/>
	);
}

function contextIcon(item: ComposerItemValue) {
	if (item.type === "action") {
		return <IconTerminal2 aria-hidden="true" size={16} />;
	}
	return item.kind === "file" ? (
		<IconFile aria-hidden="true" size={16} />
	) : (
		<IconUser aria-hidden="true" size={16} />
	);
}

function MentionControl() {
	const { insertTrigger, disabled, readOnly } = useComposerContext();
	const mention = useCallback(() => insertTrigger("@"), [insertTrigger]);
	return (
		<Button
			aria-label="Add context"
			disabled={disabled || readOnly}
			onClick={mention}
			size="icon-sm"
			variant="ghost"
		>
			<IconAt aria-hidden="true" size={18} />
		</Button>
	);
}

// @ adds files and people as chips; / runs a command on the draft.
export function ComposerMentionsExample() {
	const [value, setValue] = useState<ComposerValue>([]);
	const { chooseModel, effort, model, setEffort } = useModelChoice("sonnet");
	const [notice, setNotice] = useState("");
	const send = useCallback((draft: ComposerValue) => {
		setNotice(`Sent: ${getComposerText(draft)}`);
		setValue([]);
	}, []);
	const action = useCallback(
		(item: ComposerItemValue) => setNotice(`Action: ${item.label}`),
		[]
	);
	return (
		<div {...props(composerExampleStyles.container)}>
			<Composer
				onAction={action}
				onSubmit={send}
				onValueChange={setValue}
				triggers={[
					{ character: "@", items: context },
					{ character: "/", items: commands },
				]}
				value={value}
			>
				<ComposerInput
					aria-label="Team message"
					placeholder="Ask the agent. Type @ to add files or people, / for commands…"
					renderToken={renderContextToken}
				/>
				<ComposerPopup>
					<ComposerList>
						{(item: ComposerItemValue) => (
							<ComposerItem key={item.id} value={item}>
								{contextIcon(item)}
								<span>{item.label}</span>
							</ComposerItem>
						)}
					</ComposerList>
				</ComposerPopup>
				<ComposerActions>
					<ComposerActionGroup>
						<MentionControl />
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
						<ComposerSubmit />
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
			<div aria-label="Message result" role="status" {...props(styles.result)}>
				<Text size="caption" tone="muted">
					{notice}
				</Text>
			</div>
		</div>
	);
}

const ignoreSubmit = () => undefined;

// One line, as in a chat sidebar: it grows into a stacked composer once the
// draft wraps.
export function ComposerAdaptiveExample() {
	return (
		<div {...props(composerExampleStyles.container)}>
			<Composer layout="adaptive" onSubmit={ignoreSubmit}>
				<ComposerInput
					aria-label="Quick message"
					placeholder="Reply to the agent…"
				/>
				<ComposerActions>
					<ComposerActionGroup>
						<Button aria-label="Add files" size="icon-sm" variant="ghost">
							<IconPlus aria-hidden="true" size={18} />
						</Button>
					</ComposerActionGroup>
					<ComposerActionGroup align="end">
						<ComposerSubmit />
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
		</div>
	);
}
