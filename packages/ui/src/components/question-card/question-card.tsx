"use client";

import { props } from "@stylexjs/stylex";
import {
	type ChangeEvent,
	type ComponentPropsWithRef,
	type KeyboardEvent,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import type { Closed } from "../../closed";
import { IconChevronDown, IconMessageQuestion } from "../../icons";
import { typeRoles } from "../../styles/typography.styles";
import { approvalCardStyles } from "../approval-card/approval-card.styles";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { CheckboxGroup } from "../checkbox-group/checkbox-group";
import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "../collapsible/collapsible";
import { Radio } from "../radio/radio";
import { RadioGroup } from "../radio-group/radio-group";
import { toolCallStyles } from "../tool-call/tool-call.styles";
import { visuallyHiddenStyles } from "../visually-hidden/visually-hidden.styles";
import { questionCardStyles as styles } from "./question-card.styles";

export interface QuestionCardOption {
	/** A line on what choosing it means. */
	description?: string;
	label: string;
}

export interface QuestionCardQuestion {
	description?: string;
	id: string;
	/** Allows several answers, with checkboxes. */
	multiple?: boolean;
	options: readonly QuestionCardOption[];
	/** Offers "Something else" with a text field. On by default. */
	other?: boolean;
	/** The question, such as "Which store should sessions live in?". */
	title: string;
}

/** Each question's chosen labels or typed text, by id. Skipped ones are empty. */
export type QuestionCardAnswers = Record<string, string[]>;

export type QuestionCardProps = Omit<
	Closed<ComponentPropsWithRef<"div">>,
	"children" | "data-slot" | "onSubmit" | "role"
> & {
	/** The answers given, for a card from history. */
	answers?: QuestionCardAnswers;
	/** Called once with every answer, after the last question. */
	onSubmit?: (answers: QuestionCardAnswers) => void;
	questions: readonly QuestionCardQuestion[];
	/** `pending` while it asks; `answered` folds it into one line. */
	status: "answered" | "pending";
};

interface Draft {
	other: string;
	selected: string[];
}

const OTHER = "__other__";
const EMPTY: Draft = { other: "", selected: [] };
const DIGIT = /^[1-9]$/;

function answerOf(draft: Draft | undefined) {
	if (!draft) {
		return [];
	}
	return draft.selected.flatMap((value) => {
		if (value !== OTHER) {
			return [value];
		}
		const text = draft.other.trim();
		return text ? [text] : [];
	});
}

// Picking with a number key toggles in a checkbox list and selects in a
// radio list.
function pick(draft: Draft, value: string, multiple: boolean): Draft {
	if (!multiple) {
		return { ...draft, selected: [value] };
	}
	const selected = draft.selected.includes(value)
		? draft.selected.filter((item) => item !== value)
		: [...draft.selected, value];
	return { ...draft, selected };
}

function OptionRow({
	chosen,
	index,
	multiple,
	option,
}: {
	chosen: boolean;
	index: number;
	multiple: boolean;
	option: QuestionCardOption;
}) {
	const key = String(index + 1);
	const control = multiple ? (
		<Checkbox aria-keyshortcuts={key} size="sm" value={option.label} />
	) : (
		<Radio aria-keyshortcuts={key} value={option.label} />
	);
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: the Radio or Checkbox inside is the control.
		<label
			data-slot="question-card-option"
			{...props(styles.option, chosen && styles.optionChosen)}
		>
			<span {...props(styles.optionControl)}>{control}</span>
			<span {...props(styles.optionBody)}>
				<span {...props(typeRoles.ui)}>{option.label}</span>
				{option.description ? (
					<span {...props(typeRoles.caption, styles.optionDescription)}>
						{option.description}
					</span>
				) : null}
			</span>
			{index < 9 ? (
				<span aria-hidden="true" {...props(typeRoles.caption, styles.key)}>
					{key}
				</span>
			) : null}
		</label>
	);
}

// The last choice is the person's own words.
function OtherRow({
	chosen,
	multiple,
	onText,
	text,
}: {
	chosen: boolean;
	multiple: boolean;
	onText: (text: string) => void;
	text: string;
}) {
	const change = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => onText(event.currentTarget.value),
		[onText]
	);
	const control = multiple ? (
		<Checkbox aria-label="Something else" size="sm" value={OTHER} />
	) : (
		<Radio aria-label="Something else" value={OTHER} />
	);
	return (
		<div
			data-slot="question-card-other"
			{...props(styles.option, styles.otherRow, chosen && styles.optionChosen)}
		>
			<span {...props(styles.optionControl)}>{control}</span>
			{/* A bare 32px field in the row; the row draws its focus ring. */}
			<input
				aria-label="Your own answer"
				onChange={change}
				placeholder="Something else…"
				type="text"
				value={text}
				{...props(typeRoles.body, styles.other)}
			/>
		</div>
	);
}

function Choices({
	draft,
	labelledBy,
	onDraft,
	question,
}: {
	draft: Draft;
	labelledBy: string;
	onDraft: (draft: Draft) => void;
	question: QuestionCardQuestion;
}) {
	const multiple = question.multiple === true;
	const choose = useCallback(
		(value: unknown) => {
			const selected = Array.isArray(value) ? value : [value];
			onDraft({ ...draft, selected: selected.map(String) });
		},
		[draft, onDraft]
	);
	// Typing an answer chooses it.
	const type = useCallback(
		(other: string) => {
			const chosen = draft.selected.includes(OTHER);
			const selected = chosen
				? draft.selected
				: pick(draft, OTHER, multiple).selected;
			onDraft({ other, selected });
		},
		[draft, multiple, onDraft]
	);
	const rows = (
		<>
			{question.options.map((option, index) => (
				<OptionRow
					chosen={draft.selected.includes(option.label)}
					index={index}
					key={option.label}
					multiple={multiple}
					option={option}
				/>
			))}
			{question.other === false ? null : (
				<OtherRow
					chosen={draft.selected.includes(OTHER)}
					multiple={multiple}
					onText={type}
					text={draft.other}
				/>
			)}
		</>
	);
	if (multiple) {
		return (
			<CheckboxGroup
				aria-labelledby={labelledBy}
				onValueChange={choose}
				value={draft.selected}
			>
				<div {...props(styles.options)}>{rows}</div>
			</CheckboxGroup>
		);
	}
	return (
		<RadioGroup
			aria-labelledby={labelledBy}
			onValueChange={choose}
			value={draft.selected[0] ?? null}
		>
			<div {...props(styles.options)}>{rows}</div>
		</RadioGroup>
	);
}

function Asking({
	onSubmit,
	onDecide,
	questions,
}: {
	onDecide: () => void;
	onSubmit: QuestionCardProps["onSubmit"];
	questions: readonly QuestionCardQuestion[];
}) {
	const titleId = useId();
	const [step, setStep] = useState(0);
	const [drafts, setDrafts] = useState<Record<string, Draft>>({});
	// Focus moves to each new question, so it is read first.
	const moved = useRef(false);
	const focusQuestion = useCallback((node: HTMLParagraphElement | null) => {
		if (node && moved.current) {
			moved.current = false;
			node.focus();
		}
	}, []);
	const question = questions[step];
	const draft = (question && drafts[question.id]) ?? EMPTY;
	const setDraft = useCallback(
		(value: Draft) => {
			if (question) {
				setDrafts((all) => ({ ...all, [question.id]: value }));
			}
		},
		[question]
	);
	const last = step === questions.length - 1;
	const go = useCallback(
		(delta: number, skipping: boolean) => {
			const kept =
				skipping && question ? { ...drafts, [question.id]: EMPTY } : drafts;
			setDrafts(kept);
			if (delta > 0 && last) {
				onDecide();
				onSubmit?.(
					Object.fromEntries(
						questions.map((item) => [item.id, answerOf(kept[item.id])])
					)
				);
				return;
			}
			moved.current = true;
			setStep((current) => current + delta);
		},
		[drafts, last, onDecide, onSubmit, question, questions]
	);
	const back = useCallback(() => go(-1, false), [go]);
	const skip = useCallback(() => go(1, true), [go]);
	const next = useCallback(() => go(1, false), [go]);
	const keys = useCallback(
		(event: KeyboardEvent<HTMLFieldSetElement>) => {
			const typing =
				event.target instanceof HTMLInputElement &&
				event.target.type === "text";
			const option = question?.options[Number(event.key) - 1];
			if (typing || !DIGIT.test(event.key) || !option) {
				return;
			}
			event.preventDefault();
			setDraft(pick(draft, option.label, question?.multiple === true));
		},
		[draft, question, setDraft]
	);
	if (!question) {
		return null;
	}
	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: number keys pick an option while focus is in the question; each option is also its own focusable control.
		<fieldset
			aria-labelledby={titleId}
			onKeyDown={keys}
			{...props(approvalCardStyles.card)}
		>
			<div {...props(approvalCardStyles.head)}>
				<p {...props(typeRoles.caption, approvalCardStyles.kind)}>
					<span aria-hidden="true" {...props(approvalCardStyles.kindIcon)}>
						<IconMessageQuestion size={16} />
					</span>
					Question
					{questions.length > 1 ? (
						<span {...props(styles.progress)}>
							{step + 1} of {questions.length}
						</span>
					) : null}
				</p>
				<p
					id={titleId}
					key={question.id}
					ref={focusQuestion}
					tabIndex={-1}
					{...props(typeRoles.subheading, styles.question)}
				>
					{question.title}
				</p>
				{question.description ? (
					<p {...props(typeRoles.ui, approvalCardStyles.description)}>
						{question.description}
					</p>
				) : null}
			</div>
			<Choices
				draft={draft}
				key={question.id}
				labelledBy={titleId}
				onDraft={setDraft}
				question={question}
			/>
			<div {...props(styles.footer)}>
				{step > 0 ? (
					<Button onClick={back} size="sm" variant="ghost">
						Back
					</Button>
				) : null}
				<span {...props(styles.spacer)} />
				<Button onClick={skip} size="sm" variant="ghost">
					Skip
				</Button>
				<Button onClick={next} size="sm">
					{last ? "Submit" : "Next"}
				</Button>
			</div>
		</fieldset>
	);
}

function summaryOf(
	questions: readonly QuestionCardQuestion[],
	answers: QuestionCardAnswers
) {
	const [only] = questions;
	if (questions.length === 1 && only) {
		const answer = answers[only.id]?.join(", ");
		return { label: only.title, value: answer || "Skipped" };
	}
	const given = questions.filter((item) => answers[item.id]?.length).length;
	return {
		label: `Answered ${given} of ${questions.length} questions`,
		value: undefined,
	};
}

// Once answered, the card folds into one line that opens to every answer.
function Answered({
	answers,
	focusRef,
	questions,
}: {
	answers: QuestionCardAnswers;
	focusRef: (node: HTMLButtonElement | null) => void;
	questions: readonly QuestionCardQuestion[];
}) {
	const summary = summaryOf(questions, answers);
	return (
		<div {...props(toolCallStyles.root)}>
			<Collapsible render={<div {...props(toolCallStyles.clip)} />}>
				<CollapsibleTrigger
					ref={focusRef}
					render={
						<button
							type="button"
							{...props(typeRoles.ui, toolCallStyles.row)}
						/>
					}
				>
					<span aria-hidden="true" {...props(toolCallStyles.icon)}>
						<IconMessageQuestion size={16} />
					</span>
					<span {...props(toolCallStyles.title)}>
						{summary.label}
						{summary.value ? (
							<span {...props(toolCallStyles.name)}> · {summary.value}</span>
						) : null}
					</span>
					<IconChevronDown
						aria-hidden="true"
						size={14}
						{...props(toolCallStyles.chevron)}
					/>
				</CollapsibleTrigger>
				<CollapsiblePanel>
					<dl
						data-slot="question-card-answers"
						{...props(
							toolCallStyles.panel,
							toolCallStyles.details,
							styles.answers
						)}
					>
						{questions.map((item) => {
							const answer = answers[item.id]?.join(", ");
							return (
								<div key={item.id} {...props(approvalCardStyles.detailRow)}>
									<dt
										{...props(
											typeRoles.caption,
											approvalCardStyles.detailLabel
										)}
									>
										{item.title}
									</dt>
									<dd
										{...props(
											typeRoles.ui,
											styles.answer,
											!answer && styles.skipped
										)}
									>
										{answer || "Skipped"}
									</dd>
								</div>
							);
						})}
					</dl>
				</CollapsiblePanel>
			</Collapsible>
		</div>
	);
}

/**
 * The agent asks the person to choose, one question at a time: options
 * with number keys, an answer in their own words, and Skip. Once answered,
 * the card folds into one line that opens to every answer.
 */
export function QuestionCard({
	answers = {},
	onSubmit,
	questions,
	ref: forwardedRef,
	status,
	...rest
}: QuestionCardProps) {
	const decidedHere = useRef(false);
	const onDecide = useCallback(() => {
		decidedHere.current = true;
	}, []);
	const focusRef = useCallback((node: HTMLButtonElement | null) => {
		if (node && decidedHere.current) {
			decidedHere.current = false;
			node.focus();
		}
	}, []);
	for (const prop of ["className", "data-slot", "role", "style"]) {
		Reflect.deleteProperty(rest, prop);
	}
	const pending = status === "pending";
	return (
		<div
			{...rest}
			data-slot="question-card"
			data-status={status}
			ref={forwardedRef}
		>
			<span
				aria-live="polite"
				data-slot="question-card-status"
				role="status"
				{...props(visuallyHiddenStyles.root)}
			>
				{pending ? "" : "Answered"}
			</span>
			{pending ? (
				<Asking onDecide={onDecide} onSubmit={onSubmit} questions={questions} />
			) : (
				<Answered answers={answers} focusRef={focusRef} questions={questions} />
			)}
		</div>
	);
}
