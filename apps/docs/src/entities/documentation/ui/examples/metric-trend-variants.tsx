"use client";
import {
	Grid,
	Heading,
	MetricDelta,
	MetricTrend,
	Stack,
	Text,
	TimeSeries,
} from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";
import {
	IconCoin,
	IconReceiptRefund,
	IconShoppingCart,
	IconUsers,
} from "@tabler/icons-react";

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
export function MetricTrendDailySigninsExample1() {
	return (
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
	);
}

// Stat cards: MetricTrend without a chart. Refunds rising is bad news, so its
// delta marks "down" as the good direction.
export function MetricTrendStatCardsExample() {
	return (
		<Grid>
			<MetricTrend
				delta={<MetricDelta value={0.16} />}
				description="From last month"
				icon={<IconCoin />}
				label="Total revenue"
				value="152,313.92"
				valuePrefix="$"
			/>
			<MetricTrend
				delta={<MetricDelta value={0.2} />}
				description="From last month"
				icon={<IconShoppingCart />}
				label="Total orders"
				value="25,162"
			/>
			<MetricTrend
				delta={<MetricDelta value={0.081} />}
				description="From last month"
				icon={<IconUsers />}
				label="New customers"
				value="3,847"
			/>
			<MetricTrend
				delta={<MetricDelta good="down" value={0.024} />}
				description="From last month"
				icon={<IconReceiptRefund />}
				label="Refunds"
				value="4,209.44"
				valuePrefix="$"
			/>
		</Grid>
	);
}

// deltaPlacement="footer" moves the comparison into an inset strip, so the
// value stands alone at the top of the card.
export function MetricTrendStatCardsFooterExample() {
	return (
		<Grid>
			<MetricTrend
				delta={<MetricDelta value={0.16} />}
				deltaPlacement="footer"
				description="From last month"
				icon={<IconCoin />}
				label="Total revenue"
				value="152,313.92"
				valuePrefix="$"
			/>
			<MetricTrend
				delta={<MetricDelta good="down" value={0.024} />}
				deltaPlacement="footer"
				description="From last month"
				icon={<IconReceiptRefund />}
				label="Refunds"
				value="4,209.44"
				valuePrefix="$"
			/>
		</Grid>
	);
}
