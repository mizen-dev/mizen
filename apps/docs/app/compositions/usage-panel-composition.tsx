"use client";

import {
	Card,
	CardPanel,
	Heading,
	Meter,
	MeterIndicator,
	MeterLabel,
	MeterTrack,
	MeterValue,
	Section,
	Stack,
	Text,
} from "@mizen-labs/ui";

const numberFormat = new Intl.NumberFormat("en-US");

const weeklyLimits = [
	{ label: "All models", max: 50_000, unit: "credits", used: 43_200 },
	{ label: "Pro models", max: 120, unit: "requests", used: 92 },
] as const;

export function UsageQuota({
	label,
	max,
	unit,
	used,
}: {
	label: string;
	max: number;
	unit: string;
	used: number;
}) {
	const remaining = max - used;

	return (
		<Stack gap="1">
			<Meter
				aria-valuetext={`${numberFormat.format(used)} of ${numberFormat.format(max)} ${unit} used`}
				max={max}
				value={used}
			>
				<MeterLabel>{label}</MeterLabel>
				<MeterValue>
					{(_formattedValue, value) =>
						`${numberFormat.format(value)} of ${numberFormat.format(max)} ${unit}`
					}
				</MeterValue>
				<MeterTrack>
					<MeterIndicator />
				</MeterTrack>
			</Meter>
			<Text size="ui" tone="muted">
				{numberFormat.format(remaining)} {unit} remaining
				{used / max >= 0.85 ? " · Near limit" : ""}
			</Text>
		</Stack>
	);
}

export function UsagePanelExamples() {
	return (
		<Section
			aria-labelledby="usage-panel-heading"
			data-testid="usage-panel-example"
		>
			<Stack gap="3">
				<div>
					<Heading id="usage-panel-heading" level={2} size="title">
						Usage limits
					</Heading>
					<Text>
						Sample workspace usage with remaining capacity and fixed reset
						times.
					</Text>
				</div>
				<Card>
					<CardPanel>
						<Stack gap="3">
							<Stack gap="1">
								<Heading level={3} size="heading">
									5-hour limit
								</Heading>
								<UsageQuota
									label="Requests"
									max={100}
									unit="requests"
									used={87}
								/>
								<Text size="ui" tone="muted">
									Resets{" "}
									<time dateTime="2026-10-09T16:30:00Z">
										9 October 2026 at 16:30 UTC
									</time>
								</Text>
							</Stack>
							<Stack gap="3">
								<Heading level={3} size="heading">
									Weekly limits
								</Heading>
								{weeklyLimits.map((limit) => (
									<UsageQuota key={limit.label} {...limit} />
								))}
								<Text size="ui" tone="muted">
									Reset{" "}
									<time dateTime="2026-10-14T16:30:00Z">
										14 October 2026 at 16:30 UTC
									</time>
								</Text>
							</Stack>
						</Stack>
					</CardPanel>
				</Card>
			</Stack>
		</Section>
	);
}
