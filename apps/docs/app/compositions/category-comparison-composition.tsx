"use client";

import {
	Card,
	CardPanel,
	CategoryComparison,
	Heading,
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
	Section,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { chartExampleStyles } from "./chart-composition.styles";

const categories = [
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

export function CategoryComparisonExamples() {
	return (
		<Section
			aria-labelledby="category-comparison-heading"
			data-testid="category-comparison-example"
		>
			<div {...props(chartExampleStyles.workarea)}>
				<Card>
					<CardPanel>
						<Stack gap="3">
							<div {...props(chartExampleStyles.header)}>
								<div>
									<Heading
										id="category-comparison-heading"
										level={2}
										size="heading"
									>
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
											categories.reduce(
												(sum, category) => sum + category.value,
												0
											)
										)}
									</MetricValue>
									<MetricDescription>
										Four regions against plan
									</MetricDescription>
								</Metric>
							</div>
							<CategoryComparison
								aria-label="Regional revenue variance"
								categories={categories}
								formatAxisValue={formatAxisCurrency}
								formatValue={formatCurrency}
								seriesLabel="Variance"
							/>
						</Stack>
					</CardPanel>
				</Card>
			</div>
		</Section>
	);
}
