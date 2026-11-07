import type {
	ChevronProps,
	CustomComponents,
	DayButtonProps,
	MonthGridProps,
	NextMonthButtonProps,
	PreviousMonthButtonProps,
} from "@daypicker/react";
import {
	DayButton as DayPickerDayButton,
	MonthGrid as DayPickerMonthGrid,
	NextMonthButton as DayPickerNextMonthButton,
	PreviousMonthButton as DayPickerPreviousMonthButton,
} from "@daypicker/react";
import { props } from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { controlLabel } from "../../control-label";
import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronUp,
} from "../../icons";
import { buttonStyles } from "../button/button.styles";
import { calendarStyles } from "./calendar.styles";
import { useCalendarGridContext } from "./calendar-context";
import {
	CalendarMonthsDropdown,
	CalendarYearsDropdown,
} from "./calendar-dropdowns";

type ChevronOrientation = "up" | "down" | "left" | "right";

const chevronIcons = {
	down: IconChevronDown,
	left: IconChevronLeft,
	right: IconChevronRight,
	up: IconChevronUp,
} satisfies Record<ChevronOrientation, typeof IconChevronRight>;

function CalendarChevron({
	disabled,
	orientation = "right",
	size = 16,
}: ChevronProps): ReactElement {
	const Icon = chevronIcons[orientation];

	return (
		<Icon
			aria-hidden="true"
			data-disabled={disabled ? "" : undefined}
			data-orientation={orientation}
			data-slot="calendar-chevron"
			focusable={false}
			{...props(calendarStyles.chevron)}
			size={size}
		/>
	);
}

function CalendarPreviousMonthButton(
	buttonProps: PreviousMonthButtonProps
): ReactElement {
	return (
		<DayPickerPreviousMonthButton
			{...buttonProps}
			data-slot="calendar-previous"
			{...getNavigationStyles(
				Boolean(buttonProps.disabled || buttonProps["aria-disabled"])
			)}
		/>
	);
}

function CalendarNextMonthButton(
	buttonProps: NextMonthButtonProps
): ReactElement {
	return (
		<DayPickerNextMonthButton
			{...buttonProps}
			data-slot="calendar-next"
			{...getNavigationStyles(
				Boolean(buttonProps.disabled || buttonProps["aria-disabled"])
			)}
		/>
	);
}

function CalendarMonthGrid(gridProps: MonthGridProps): ReactElement {
	const context = useCalendarGridContext();
	const baseAriaLabel = gridProps["aria-label"];
	let combinedAriaLabel = baseAriaLabel;
	if (context?.ariaLabel) {
		combinedAriaLabel = baseAriaLabel
			? `${context.ariaLabel}, ${baseAriaLabel}`
			: context.ariaLabel;
	}

	return (
		<DayPickerMonthGrid
			{...gridProps}
			aria-describedby={context?.ariaDescribedBy}
			aria-invalid={context?.invalid ? true : undefined}
			aria-label={combinedAriaLabel}
			aria-labelledby={context?.ariaLabelledBy}
			aria-readonly={context?.readOnly ? true : undefined}
		/>
	);
}

export const calendarComponents: Partial<CustomComponents> = {
	Chevron: CalendarChevron,
	DayButton: CalendarDayButton,
	MonthGrid: CalendarMonthGrid,
	MonthsDropdown: CalendarMonthsDropdown,
	NextMonthButton: CalendarNextMonthButton,
	PreviousMonthButton: CalendarPreviousMonthButton,
	YearsDropdown: CalendarYearsDropdown,
};

function getNavigationStyles(disabled?: boolean) {
	return props(
		buttonStyles.base,
		buttonStyles.outline,
		buttonStyles["icon-sm"],
		buttonStyles.loading,
		calendarStyles.navigationButton,
		disabled ? buttonStyles.disabled : buttonStyles.press,
		!disabled && buttonStyles.interactionOutline
	);
}

// Ghost hides the press surface at rest; selected days show it filled.
function getDaySurfaceStyle(selected: boolean) {
	return selected ? calendarStyles.selectedDay : buttonStyles.ghost;
}

function getDayInteractionStyles(
	interactive: boolean,
	selected: boolean,
	today: boolean
) {
	const quietInteraction = today
		? calendarStyles.todayInteraction
		: buttonStyles.interactionGhost;
	return interactive
		? [
				buttonStyles.press,
				selected ? buttonStyles.interactionBrand : quietInteraction,
			]
		: [];
}

function CalendarDayButton({
	children,
	modifiers,
	...buttonProps
}: DayButtonProps) {
	const readOnly = useCalendarGridContext()?.readOnly;
	const selected = modifiers.selected && !modifiers.range_middle;
	const interactive = !(modifiers.disabled || readOnly);

	return (
		<DayPickerDayButton
			{...buttonProps}
			modifiers={modifiers}
			{...props(
				buttonStyles.base,
				getDaySurfaceStyle(Boolean(selected)),
				buttonStyles.icon,
				calendarStyles.dayButton,
				modifiers.today && calendarStyles.todayButton,
				selected && buttonStyles.brand,
				...getDayInteractionStyles(
					interactive,
					Boolean(selected),
					Boolean(modifiers.today)
				),
				modifiers.today && calendarStyles.todayIndicator,
				modifiers.today && selected && calendarStyles.todayIndicatorSelected,
				readOnly && calendarStyles.readOnly
			)}
		>
			{controlLabel(children)}
		</DayPickerDayButton>
	);
}
