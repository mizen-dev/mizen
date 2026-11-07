import { Field as BaseField } from "@base-ui/react/field";
import { type DropdownProps, useDayPicker } from "@daypicker/react";
import { props } from "@stylexjs/stylex";
import { useCallback } from "react";
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "../select/select";
import { calendarStyles } from "./calendar.styles";

type CalendarDropdownProps = DropdownProps & { part: "month" | "year" };

function CalendarDropdown({
	part,
	options = [],
	value,
	disabled,
	"aria-label": label,
}: CalendarDropdownProps) {
	const { months, goToMonth, dayPickerProps } = useDayPicker();
	const displayedMonth = months[0]?.date;
	const monthLabel =
		displayedMonth &&
		new Intl.DateTimeFormat(dayPickerProps.locale?.code ?? "en-US", {
			month: "short",
		}).format(displayedMonth);
	const items = options.map((option) => ({
		label: option.label,
		value: option.value,
	}));
	const changeMonth = useCallback(
		(nextValue: number | null) => {
			if (nextValue === null || !displayedMonth) {
				return;
			}
			const nextMonth = new Date(displayedMonth);
			nextMonth.setDate(1);
			if (part === "month") {
				nextMonth.setMonth(nextValue);
			} else {
				nextMonth.setFullYear(nextValue);
			}
			goToMonth(nextMonth);
		},
		[displayedMonth, goToMonth, part]
	);
	// Its own field root: an enclosing Field must not label or id this select.
	return (
		<BaseField.Root {...props(calendarStyles.dropdown)}>
			<Select<number>
				disabled={disabled}
				items={items}
				onValueChange={changeMonth}
				value={Number(value)}
			>
				<SelectTrigger aria-label={label} size="sm">
					<SelectValue>{part === "month" ? monthLabel : null}</SelectValue>
				</SelectTrigger>
				<SelectPopup alignItemWithTrigger={false}>
					{options.map((option) => (
						<SelectItem
							disabled={option.disabled}
							key={option.value}
							value={option.value}
						>
							{option.label}
						</SelectItem>
					))}
				</SelectPopup>
			</Select>
		</BaseField.Root>
	);
}

export function CalendarMonthsDropdown(dropdownProps: DropdownProps) {
	return <CalendarDropdown {...dropdownProps} part="month" />;
}

export function CalendarYearsDropdown(dropdownProps: DropdownProps) {
	return <CalendarDropdown {...dropdownProps} part="year" />;
}
