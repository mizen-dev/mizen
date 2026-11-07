"use client";

import {
	Button,
	type CalendarRangeValue,
	DateRangePicker,
	type DateRangePreset,
	Heading,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import type { FormEvent, ReactElement } from "react";
import { useCallback, useState } from "react";
import { specimenStyles } from "./date-picker-specimen.styles";
import { SpecimenSection } from "./specimen-section";

const INITIAL_RANGE: CalendarRangeValue = {
	from: new Date(2026, 9, 10),
	to: new Date(2026, 9, 14),
};

const PRESETS = [
	{
		label: "This week",
		value: { from: new Date(2026, 9, 5), to: new Date(2026, 9, 11) },
	},
	{
		label: "Next week",
		value: { from: new Date(2026, 9, 12), to: new Date(2026, 9, 18) },
	},
] satisfies readonly DateRangePreset[];

function formatRange(value: CalendarRangeValue | undefined): string {
	if (!value) {
		return "No range selected";
	}

	const formatDate = (date: Date | undefined) => {
		if (!date) {
			return "Choose an end date";
		}
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	return `${formatDate(value.from)} – ${formatDate(value.to)}`;
}

export function DateRangePickerSpecimen(): ReactElement {
	const [controlledRange, setControlledRange] = useState<
		CalendarRangeValue | undefined
	>(INITIAL_RANGE);
	const [formStatus, setFormStatus] = useState("No range submitted yet.");

	const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		setFormStatus(`Submitted: ${String(formData.get("dateRange"))}`);
	}, []);

	return (
		<SpecimenSection
			canvas={false}
			description="Choose the start and end of the release window."
			primary
			title="Release window"
		>
			<div
				data-testid="date-range-picker-specimen"
				{...props(specimenStyles.root)}
			>
				<Stack gap="4">
					<Heading level={2}>Date Range Picker</Heading>
					<Text size="ui" tone="muted">
						Choose a start and end date, use a preset, or enter both ISO dates.
						The first calendar click is a pending start date; forms require both
						dates.
					</Text>
				</Stack>

				<div {...props(specimenStyles.grid)}>
					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Default range</Heading>
								<Text>Uncontrolled selection with an initial range.</Text>
							</Stack>
						</div>
						<div
							data-testid="date-range-picker-default"
							{...props(specimenStyles.preview)}
						>
							<DateRangePicker
								aria-label="Trip dates"
								defaultValue={INITIAL_RANGE}
							/>
						</div>
					</div>

					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Controlled with presets</Heading>
								<Text data-testid="date-range-picker-controlled-value">
									Selected: {formatRange(controlledRange)}
								</Text>
							</Stack>
						</div>
						<div
							data-testid="date-range-picker-presets"
							{...props(specimenStyles.preview)}
						>
							<DateRangePicker
								aria-label="Reporting period"
								onValueChange={setControlledRange}
								presets={PRESETS}
								value={controlledRange}
							/>
						</div>
					</div>

					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Disabled</Heading>
								<Text>Input, calendar, and presets are unavailable.</Text>
							</Stack>
						</div>
						<div
							data-testid="date-range-picker-disabled"
							{...props(specimenStyles.preview)}
						>
							<DateRangePicker
								aria-label="Archived trip dates"
								defaultValue={INITIAL_RANGE}
								disabled
								presets={PRESETS}
							/>
						</div>
					</div>

					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Read-only</Heading>
								<Text>Opens for inspection without changing the range.</Text>
							</Stack>
						</div>
						<div
							data-testid="date-range-picker-readonly"
							{...props(specimenStyles.preview)}
						>
							<DateRangePicker
								aria-label="Read-only deployment window"
								defaultValue={INITIAL_RANGE}
								presets={PRESETS}
								readOnly
							/>
						</div>
					</div>

					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Native form</Heading>
								<Text>
									Submits the named date range with standard browser validation.
								</Text>
							</Stack>
						</div>
						<form
							data-testid="date-range-picker-native-form"
							onSubmit={handleSubmit}
							{...props(specimenStyles.preview)}
						>
							<DateRangePicker
								aria-label="Required report dates"
								defaultValue={INITIAL_RANGE}
								name="dateRange"
								required
							/>
							<Button data-testid="date-range-picker-form-submit" type="submit">
								Submit range
							</Button>
							<output
								aria-live="polite"
								data-testid="date-range-picker-form-status"
							>
								{formStatus}
							</output>
						</form>
					</div>
				</div>
			</div>
		</SpecimenSection>
	);
}
