import { props } from "@stylexjs/stylex";
import type { ReactElement } from "react";
import { IconCalendar } from "../../icons";
import { PopoverTrigger } from "../popover/popover";
import { datePickerStyles } from "./date-picker.styles";

interface CalendarTriggerProps {
	disabled: boolean;
	label: string | undefined;
}

// The calendar button of DatePicker and DateRangePicker.
export function CalendarTrigger({
	disabled,
	label = "Open calendar",
}: CalendarTriggerProps): ReactElement {
	return (
		<PopoverTrigger
			aria-label={label}
			disabled={disabled}
			{...props(
				datePickerStyles.triggerButton,
				disabled && datePickerStyles.triggerButtonDisabled
			)}
		>
			<span {...props(datePickerStyles.triggerIcon)}>
				<IconCalendar aria-hidden="true" focusable="false" size="16" />
			</span>
		</PopoverTrigger>
	);
}
