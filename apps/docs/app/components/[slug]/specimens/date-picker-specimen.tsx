"use client";

import { DatePicker, Heading, Stack, Text } from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { type ReactElement, useState } from "react";
import { specimenStyles } from "./date-picker-specimen.styles";
import { SpecimenSection } from "./specimen-section";

const INITIAL_DATE = new Date(2026, 9, 3);
const BOUNDED_MIN = new Date(2026, 9, 1);
const BOUNDED_MAX = new Date(2026, 9, 31);
const BOUNDED_INITIAL = new Date(2026, 9, 15);

function formatIsoDate(date: Date | undefined): string {
	if (!date) {
		return "None";
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function DatePickerSpecimen(): ReactElement {
	const [controlledDate, setControlledDate] = useState<Date | undefined>(
		INITIAL_DATE
	);
	const [boundedDate, setBoundedDate] = useState<Date | undefined>(
		BOUNDED_INITIAL
	);

	return (
		<SpecimenSection
			canvas={false}
			description="Choose a date for the team review."
			primary
			title="Review schedule"
		>
			<div data-testid="date-picker-specimen" {...props(specimenStyles.root)}>
				<Stack gap="4">
					<Heading level={2}>Date Picker</Heading>
					<Text size="ui" tone="muted">
						Editable ISO date field with integrated calendar popover, constraint
						validation, and focus management.
					</Text>
				</Stack>

				<div {...props(specimenStyles.grid)}>
					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Uncontrolled</Heading>
								<Text>
									Default date with local ISO typing and calendar trigger.
								</Text>
							</Stack>
						</div>
						<div
							data-testid="date-picker-uncontrolled"
							{...props(specimenStyles.preview)}
						>
							<DatePicker
								aria-label="Appointment date"
								defaultValue={INITIAL_DATE}
							/>
						</div>
					</div>

					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Controlled</Heading>
								<Text data-testid="date-picker-controlled-value">
									Selected: {formatIsoDate(controlledDate)}
								</Text>
							</Stack>
						</div>
						<div
							data-testid="date-picker-controlled"
							{...props(specimenStyles.preview)}
						>
							<DatePicker
								aria-label="Event date"
								onValueChange={setControlledDate}
								value={controlledDate}
							/>
						</div>
					</div>

					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Bounded</Heading>
								<Text>
									Restricted to October 2026 (
									<span {...props(specimenStyles.nowrap)}>2026-10-01</span> to{" "}
									<span {...props(specimenStyles.nowrap)}>2026-10-31</span>).
								</Text>
							</Stack>
						</div>
						<div
							data-testid="date-picker-bounded"
							{...props(specimenStyles.preview)}
						>
							<DatePicker
								aria-label="Booking date"
								maxValue={BOUNDED_MAX}
								minValue={BOUNDED_MIN}
								onValueChange={setBoundedDate}
								value={boundedDate}
							/>
						</div>
					</div>

					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Disabled</Heading>
								<Text>Interaction prevented on both input and trigger.</Text>
							</Stack>
						</div>
						<div
							data-testid="date-picker-disabled"
							{...props(specimenStyles.preview)}
						>
							<DatePicker
								aria-label="Archived date"
								defaultValue={INITIAL_DATE}
								disabled
							/>
						</div>
					</div>

					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Read-only</Heading>
								<Text>Input is read-only; opens calendar for inspection.</Text>
							</Stack>
						</div>
						<div
							data-testid="date-picker-readonly"
							{...props(specimenStyles.preview)}
						>
							<DatePicker
								aria-label="Read-only release date"
								defaultValue={INITIAL_DATE}
								readOnly
							/>
						</div>
					</div>

					<div {...props(specimenStyles.panel)}>
						<div {...props(specimenStyles.header)}>
							<Stack gap="1">
								<Heading level={3}>Invalid</Heading>
								<Text>Shows error styling via external invalid property.</Text>
							</Stack>
						</div>
						<div
							data-testid="date-picker-invalid"
							{...props(specimenStyles.preview)}
						>
							<DatePicker
								aria-label="Deadline date"
								defaultValue={INITIAL_DATE}
								invalid
							/>
						</div>
					</div>
				</div>
			</div>
		</SpecimenSection>
	);
}
