"use client";

import { props } from "@stylexjs/stylex";
import { type ReactNode, useCallback } from "react";
import { IconChevronDown, IconChevronRight } from "../../icons";
import { typeRoles } from "../../styles/typography.styles";
import { checkboxStyles } from "../checkbox/checkbox.styles";
import {
	Menu,
	MenuGroup,
	MenuGroupLabel,
	MenuPopup,
	MenuPrimitive,
	MenuRadioGroup,
	MenuSeparator,
	MenuSubPopup,
	MenuTrigger,
} from "../menu/menu";
import { menuStyles } from "../menu/menu.styles";
import { radioStyles } from "../radio/radio.styles";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";
import { composerPartStyles as styles } from "./composer-parts.styles";

/** A level of reasoning effort, such as "High". */
export interface ComposerPickerEffort {
	description?: string;
	label: string;
	value: string;
}

export interface ComposerPickerOption<Value extends string = string> {
	/** One line on what choosing it means, shown in the menu. */
	description?: string;
	/**
	 * The effort levels this option offers, as the model's API names them.
	 * Once chosen, its row opens them to the side.
	 */
	efforts?: readonly ComposerPickerEffort[];
	/**
	 * A heading the option sits under, such as its provider. Options that
	 * share a heading are listed together, in the order they first appear.
	 */
	group?: string;
	/** A glyph before the label, in the menu and on the trigger once chosen. */
	icon?: ReactNode;
	label: string;
	value: Value;
}

export interface ComposerPickerProps<Value extends string = string> {
	/**
	 * The chosen effort level. When the chosen option has none by this
	 * value, such as after switching models, the trigger leaves it out.
	 */
	effort?: string;
	/** A glyph for choices that have none of their own. */
	icon?: ReactNode;
	/** What is picked, such as "Model". It names the menu and the trigger. */
	label: string;
	/** Adds a "Learn more" link beside the menu's title. */
	learnMoreHref?: string;
	/** Called with a level from the chosen option's `efforts`. */
	onEffortChange?: (effort: string) => void;
	onValueChange: (value: Value) => void;
	options: readonly ComposerPickerOption<Value>[];
	value: Value;
}

interface Section<Value extends string> {
	group: string | undefined;
	options: ComposerPickerOption<Value>[];
}

function sectionsOf<Value extends string>(
	options: readonly ComposerPickerOption<Value>[]
) {
	const sections = new Map<string | undefined, Section<Value>>();
	for (const option of options) {
		const section = sections.get(option.group) ?? {
			group: option.group,
			options: [],
		};
		section.options.push(option);
		sections.set(option.group, section);
	}
	return [...sections.values()];
}

function Glyph({
	children,
	inMenu = false,
}: {
	children: ReactNode;
	inMenu?: boolean;
}) {
	if (!children) {
		return null;
	}
	return (
		<span
			aria-hidden="true"
			{...props(styles.pickerIcon, inMenu && styles.pickerFirstLine)}
		>
			{children}
		</span>
	);
}

// A radio circle, filled when chosen. A row that is not a radio item, such
// as the chosen model that opens its effort levels, draws a static one.
function RadioMark({ checked }: { checked?: boolean }) {
	return (
		<span
			aria-hidden="true"
			data-checked={checked ? "" : undefined}
			{...props(
				checkboxStyles.base,
				checkboxStyles.forcedColorsSelected,
				radioStyles.root,
				radioStyles.sizeSm,
				styles.pickerRadio
			)}
		>
			<span {...props(radioStyles.indicator, styles.pickerRadioDot)} />
		</span>
	);
}

type Choice = ComposerPickerEffort & { icon?: ReactNode };

function OptionBody({ description, icon, label }: Omit<Choice, "value">) {
	return (
		<>
			<Glyph inMenu>{icon}</Glyph>
			<span {...props(styles.pickerOption)}>
				<span>{label}</span>
				{description ? (
					<span {...props(typeRoles.caption, styles.pickerDescription)}>
						{description}
					</span>
				) : null}
			</span>
		</>
	);
}

// One choice. The form Radio's circle sits at the row's end, so labels and
// icons line up on the leading edge.
function Option({ option }: { option: Choice }) {
	return (
		<MenuPrimitive.RadioItem
			closeOnClick
			data-slot="menu-radio-item"
			value={option.value}
			{...props(menuStyles.item, menuStyles.itemDefault)}
		>
			<OptionBody
				description={option.description}
				icon={option.icon}
				label={option.label}
			/>
			<MenuPrimitive.RadioItemIndicator
				keepMounted
				{...props(
					checkboxStyles.base,
					checkboxStyles.forcedColorsSelected,
					radioStyles.root,
					radioStyles.sizeSm,
					styles.pickerRadio
				)}
			>
				<span {...props(radioStyles.indicator, styles.pickerRadioDot)} />
			</MenuPrimitive.RadioItemIndicator>
		</MenuPrimitive.RadioItem>
	);
}

// The chosen option, when it has effort levels: its row shows the current
// level and opens the list of levels to the side.
function EffortRow({
	effort,
	onEffortChange,
	option,
}: {
	effort: string | undefined;
	onEffortChange: (effort: string) => void;
	option: ComposerPickerOption;
}) {
	const levels = option.efforts ?? [];
	const current = levels.find((level) => level.value === effort);
	const change = useCallback(
		(next: unknown) => onEffortChange(next as string),
		[onEffortChange]
	);
	return (
		<MenuPrimitive.SubmenuRoot>
			<MenuPrimitive.SubmenuTrigger
				data-slot="composer-picker-effort"
				{...props(
					menuStyles.item,
					menuStyles.itemDefault,
					menuStyles.subTrigger
				)}
			>
				<OptionBody
					description={option.description}
					icon={option.icon}
					label={option.label}
				/>
				<VisuallyHidden>, chosen, effort</VisuallyHidden>
				<span {...props(typeRoles.caption, styles.pickerEffort)}>
					{current?.label ?? "Effort"}
					<IconChevronRight
						aria-hidden="true"
						size={12}
						{...props(styles.pickerEffortChevron)}
					/>
				</span>
				<RadioMark checked />
			</MenuPrimitive.SubmenuTrigger>
			<MenuSubPopup>
				<MenuGroup>
					<MenuGroupLabel>Effort</MenuGroupLabel>
					<MenuRadioGroup
						aria-label="Effort"
						onValueChange={change}
						value={effort}
					>
						{levels.map((level) => (
							<Option key={level.value} option={level} />
						))}
					</MenuRadioGroup>
				</MenuGroup>
			</MenuSubPopup>
		</MenuPrimitive.SubmenuRoot>
	);
}

function Header({ href, label }: { href: string | undefined; label: string }) {
	return (
		<div {...props(styles.pickerHeader)}>
			<span aria-hidden="true" {...props(styles.pickerTitle)}>
				{label}
			</span>
			{href ? (
				<MenuPrimitive.LinkItem href={href} {...props(styles.pickerLearnMore)}>
					Learn more
				</MenuPrimitive.LinkItem>
			) : null}
		</div>
	);
}

// The trigger's text: the choice, and its effort level when it has one.
function TriggerLabel({
	chosen,
	effort,
	label,
	value,
}: {
	chosen: ComposerPickerOption | undefined;
	effort: string | undefined;
	label: string;
	value: string;
}) {
	const level = chosen?.efforts?.find((item) => item.value === effort);
	return (
		<span {...props(styles.pickerChoice)}>
			<VisuallyHidden>{label}: </VisuallyHidden>
			{chosen?.label ?? value}
			{level ? (
				<span {...props(styles.pickerTriggerEffort)}> · {level.label}</span>
			) : null}
		</span>
	);
}

function Row({
	effort,
	onEffortChange,
	option,
	value,
}: {
	effort: string | undefined;
	onEffortChange: ((effort: string) => void) | undefined;
	option: ComposerPickerOption;
	value: string;
}) {
	if (option.value === value && option.efforts?.length && onEffortChange) {
		return (
			<EffortRow
				effort={effort}
				onEffortChange={onEffortChange}
				option={option}
			/>
		);
	}
	return <Option option={option} />;
}

/**
 * A choice in the composer's toolbar, such as the model or the permission
 * mode: a quiet label that opens a menu of options, each with a line on
 * what it means. Options can carry icons, sit under headings such as their
 * provider, and offer effort levels that open from the chosen row.
 */
export function ComposerPicker<Value extends string = string>({
	effort,
	icon,
	label,
	learnMoreHref,
	onEffortChange,
	onValueChange,
	options,
	value,
}: ComposerPickerProps<Value>) {
	const chosen = options.find((option) => option.value === value);
	const sections = sectionsOf(options);
	// Provider headings already title a grouped list; a second title above
	// them is noise unless it carries the link.
	const titled =
		learnMoreHref !== undefined || sections[0]?.group === undefined;
	const change = useCallback(
		(next: unknown) => onValueChange(next as Value),
		[onValueChange]
	);
	return (
		<Menu>
			<MenuTrigger
				render={
					<button
						data-slot="composer-picker"
						type="button"
						{...props(typeRoles.ui, styles.picker)}
					/>
				}
			>
				<Glyph>{chosen?.icon ?? icon}</Glyph>
				<TriggerLabel
					chosen={chosen}
					effort={effort}
					label={label}
					value={value}
				/>
				<IconChevronDown
					aria-hidden="true"
					size={14}
					{...props(styles.pickerChevron)}
				/>
			</MenuTrigger>
			<MenuPopup align="start" side="top">
				{titled ? <Header href={learnMoreHref} label={label} /> : null}
				<MenuRadioGroup aria-label={label} onValueChange={change} value={value}>
					{sections.map((section, index) => (
						<MenuGroup key={section.group ?? ""}>
							{index > 0 ? <MenuSeparator /> : null}
							{section.group ? (
								<MenuGroupLabel>{section.group}</MenuGroupLabel>
							) : null}
							{section.options.map((option) => (
								<Row
									effort={effort}
									key={option.value}
									onEffortChange={onEffortChange}
									option={option}
									value={value}
								/>
							))}
						</MenuGroup>
					))}
				</MenuRadioGroup>
			</MenuPopup>
		</Menu>
	);
}
