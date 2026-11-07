import { createContext, useContext } from "react";

export interface CalendarGridContextValue {
	readonly ariaDescribedBy?: string | undefined;
	readonly ariaLabel?: string | undefined;
	readonly ariaLabelledBy?: string | undefined;
	readonly invalid?: boolean | undefined;
	readonly readOnly?: boolean | undefined;
}

export const CalendarGridContext =
	createContext<CalendarGridContextValue | null>(null);

export function useCalendarGridContext(): CalendarGridContextValue | null {
	return useContext(CalendarGridContext);
}
