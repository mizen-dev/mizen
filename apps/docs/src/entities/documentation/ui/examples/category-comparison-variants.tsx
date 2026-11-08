"use client";
import {
	CategoryComparison,
	Heading,
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { chartExampleStyles } from "../compositions/chart-composition.styles";

const regionalVariance = [
	{ id: "west", label: "West", value: 24_000 },
	{ id: "east", label: "East", value: -8500 },
	{ id: "central", label: "Central", value: 0 },
	{ id: "south", label: "South", value: 12_100 },
] as const;
const currencyFormat = new Intl.NumberFormat("en-US", {
	currency: "USD",
	maximumFractionDigits: 0,
	signDisplay: "always",
	style: "currency",
});
const formatCurrency = (value: number) => currencyFormat.format(value);
const formatAxisCurrency = (value: number) => {
	const magnitude = Math.abs(value);
	const thousands = magnitude >= 1000;
	const rounded = (magnitude / (thousands ? 1000 : 1)).toFixed(
		thousands ? 1 : 0
	);
	const amount = rounded.endsWith(".0") ? rounded.slice(0, -2) : rounded;
	return `${value < 0 ? "−" : "+"}$${amount}${thousands ? "K" : ""}`;
};
export function CategoryComparisonRegionalRevenueVarianceExample1() {
	return (
		<Stack gap="3">
			<div {...props(chartExampleStyles.header)}>
				<div>
					<Heading id="category-comparison-heading" level={2} size="heading">
						Regional revenue variance
					</Heading>
					<Text size="ui" tone="muted">
						Year to date · USD
					</Text>
				</div>
				<Metric>
					<MetricLabel>Net variance</MetricLabel>
					<MetricValue>
						{formatCurrency(
							regionalVariance.reduce(
								(sum, category) => sum + category.value,
								0
							)
						)}
					</MetricValue>
					<MetricDescription>Four regions against plan</MetricDescription>
				</Metric>
			</div>
			<CategoryComparison
				aria-label="Regional revenue variance"
				categories={regionalVariance}
				formatAxisValue={formatAxisCurrency}
				formatValue={formatCurrency}
				seriesLabel="Variance"
			/>
		</Stack>
	);
}

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
const ordersThisYear = [
	1720, 1790, 1960, 1880, 2100, 2210, 2380, 2290, 2420, 2510, 2390, 2460,
];
const ordersLastYear = [
	1530, 1490, 1660, 1640, 1720, 1770, 1840, 1910, 1950, 2010, 1830, 1810,
];

// Vertical bars suit ordered categories such as months; comparison draws last
// year as a quieter bar beside each month.
export function CategoryComparisonOrdersByMonthExample() {
	return (
		<CategoryComparison
			aria-label="Monthly orders, this year against last year"
			categories={MONTHS.map((label, index) => ({
				comparison: ordersLastYear[index],
				id: label.toLowerCase(),
				label,
				value: ordersThisYear[index],
			}))}
			comparisonLabel="Last year"
			orientation="vertical"
			seriesLabel="This year"
		/>
	);
}

const earnings = [
	1400, 6100, 8800, 5900, 2900, 1800, 3100, 4200, 5700, 3700, 9700, 7000,
];
const formatDollars = (value: number) =>
	value.toLocaleString("en-US", {
		currency: "USD",
		maximumFractionDigits: 0,
		notation: "compact",
		style: "currency",
	});

// A track behind each bar shows the full scale, like a progress bar.
export function CategoryComparisonEarningsTrackExample() {
	return (
		<CategoryComparison
			aria-label="Monthly earnings"
			categories={MONTHS.map((label, index) => ({
				id: label.toLowerCase(),
				label,
				value: earnings[index],
			}))}
			formatValue={formatDollars}
			orientation="vertical"
			seriesLabel="Earnings"
			track
		/>
	);
}
