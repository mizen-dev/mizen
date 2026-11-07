"use client";

import {
	SegmentedControl,
	SegmentedControlItem,
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "@mizen/ui";
import { IconCalendar } from "@tabler/icons-react";
import { useCallback } from "react";

// Card-header controls for chart examples: a compact period select and
// segmented period tabs, both sized to sit beside a headline value. Cards own
// the chosen period and swap their data with it.

export function PeriodSelect<T extends string>({
	label,
	onValueChange,
	options,
	value,
}: {
	label: string;
	onValueChange: (value: T) => void;
	options: readonly T[];
	value: T;
}) {
	const choose = useCallback(
		(next: string | null) => {
			if (next !== null) {
				onValueChange(next as T);
			}
		},
		[onValueChange]
	);
	return (
		<Select onValueChange={choose} value={value}>
			<SelectTrigger aria-label={label} size="sm">
				<IconCalendar aria-hidden="true" size={16} />
				<SelectValue />
			</SelectTrigger>
			<SelectPopup>
				{options.map((option) => (
					<SelectItem key={option} value={option}>
						{option}
					</SelectItem>
				))}
			</SelectPopup>
		</Select>
	);
}

export function PeriodTabs<T extends string>({
	label,
	onValueChange,
	options,
	value,
}: {
	label: string;
	onValueChange: (value: T) => void;
	options: readonly T[];
	value: T;
}) {
	// A period stays chosen: pressing the active tab again changes nothing.
	const choose = useCallback(
		(next: readonly string[]) => {
			const [chosen] = next;
			if (chosen) {
				onValueChange(chosen as T);
			}
		},
		[onValueChange]
	);
	return (
		<SegmentedControl
			aria-label={label}
			onValueChange={choose}
			size="sm"
			value={[value]}
		>
			{options.map((option) => (
				<SegmentedControlItem key={option} value={option}>
					{option}
				</SegmentedControlItem>
			))}
		</SegmentedControl>
	);
}
