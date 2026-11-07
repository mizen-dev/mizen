"use client";
import {
	Heading,
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
	PartToWhole,
	Stack,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { chartExampleStyles } from "../compositions/chart-composition.styles";

const budgetParts = [
	{ id: "payroll", label: "Payroll", value: 52_000 },
	{ id: "infrastructure", label: "Infrastructure", value: 21_000 },
	{ id: "research", label: "Research", value: 15_000 },
	{ id: "operations", label: "Operations", value: 9000 },
	{ id: "reserve", label: "Reserve", value: 3000 },
] as const;
const currencyFormat = new Intl.NumberFormat("en-US", {
	currency: "USD",
	maximumFractionDigits: 0,
	style: "currency",
});
const formatCurrency = (value: number) => currencyFormat.format(value);
export function PartToWholeQuarterlyBudgetMixExample1() {
	return (
		<Stack gap="3">
			<div {...props(chartExampleStyles.header)}>
				<div>
					<Heading id="part-to-whole-heading" level={2} size="heading">
						Quarterly budget mix
					</Heading>
					<Text size="ui" tone="muted">
						Planned allocation · USD
					</Text>
				</div>
				<Metric>
					<MetricLabel>Total budget</MetricLabel>
					<MetricValue>
						{formatCurrency(
							budgetParts.reduce((sum, part) => sum + part.value, 0)
						)}
					</MetricValue>
					<MetricDescription>Five cost categories</MetricDescription>
				</Metric>
			</div>
			<PartToWhole
				aria-label="Quarterly budget allocation"
				formatValue={formatCurrency}
				parts={budgetParts}
			/>
		</Stack>
	);
}
