"use client";

import {
	Card,
	CardPanel,
	Heading,
	Metric,
	MetricDescription,
	MetricLabel,
	MetricTrend,
	MetricValue,
	Section,
	Stack,
	Text,
	TimeSeries,
} from "@mizen/ui";
import { create, props } from "@stylexjs/stylex";
import { chartExampleStyles } from "./chart-composition.styles";

const signInPoints = [
	{ time: Date.parse("2026-03-01T08:00:00Z"), value: 8 },
	{ time: Date.parse("2026-03-02T08:00:00Z"), value: 12 },
	{ time: Date.parse("2026-03-05T08:00:00Z"), value: 10 },
	{ time: Date.parse("2026-03-11T07:00:00Z"), value: null },
	{ time: Date.parse("2026-03-12T07:00:00Z"), value: 0 },
	{ time: Date.parse("2026-03-20T07:00:00Z"), value: 17 },
] as const;

const formatSignIns = (value: number) => String(value);
const formatSignInAxis = (value: number) => String(value);
const exampleStyles = create({
	metricTrend: { maxInlineSize: "40rem", width: "100%" },
});

export function MetricTrendExamples() {
	return (
		<Section
			aria-labelledby="metric-trend-heading"
			data-testid="metric-trend-example"
		>
			<Stack gap="3">
				<Heading id="metric-trend-heading" level={2} size="title">
					Daily sign-ins
				</Heading>
				<Text size="ui" tone="muted">
					March 2026 · America/Los Angeles
				</Text>
				<div
					data-testid="metric-trend-layout"
					{...props(exampleStyles.metricTrend)}
				>
					<MetricTrend
						description="One day was not reported in March."
						label="Sign-ins on March 20"
						value="17"
					>
						<TimeSeries
							aria-label="Sign-in activity sparkline"
							formatAxisValue={formatSignInAxis}
							formatValue={formatSignIns}
							points={signInPoints}
							presentation="sparkline"
							seriesLabel="Sign-ins"
							timeZone="America/Los_Angeles"
						/>
					</MetricTrend>
				</div>
			</Stack>
		</Section>
	);
}

export function TimeSeriesExamples() {
	return (
		<Section
			aria-labelledby="time-series-heading"
			data-testid="time-series-example"
		>
			<div {...props(chartExampleStyles.workarea)}>
				<Card>
					<CardPanel>
						<Stack gap="3">
							<div {...props(chartExampleStyles.header)}>
								<div>
									<Heading id="time-series-heading" level={2} size="heading">
										Daily sign-ins
									</Heading>
									<Text size="ui" tone="muted">
										March 1–20, 2026 · America/Los Angeles
									</Text>
								</div>
								<Metric>
									<MetricLabel>Latest reported day</MetricLabel>
									<MetricValue>17</MetricValue>
									<MetricDescription>One day unreported</MetricDescription>
								</Metric>
							</div>
							<TimeSeries
								aria-description="Sign-ins from March 1 through March 20, 2026. One observation is missing."
								aria-label="Daily sign-ins"
								formatAxisValue={formatSignInAxis}
								formatValue={formatSignIns}
								points={signInPoints}
								seriesLabel="Sign-ins"
								timeZone="America/Los_Angeles"
							/>
						</Stack>
					</CardPanel>
				</Card>
			</div>
		</Section>
	);
}
