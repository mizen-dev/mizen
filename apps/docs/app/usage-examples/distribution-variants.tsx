"use client";
import {
	Distribution,
	Heading,
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
	Stack,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { chartExampleStyles } from "../compositions/chart-composition.styles";

const observations = [
	12, 15, 17, 18, 19, 20, 20, 21, 22, 22, 23, 24, 24, 25, 26, 27, 27, 28, 29,
	30, 30, 31, 32, 33, 34, 35, 36, 38, 40, 42, 45, 48, 52, 58, 64, 72,
] as const;
const formatObservation = (value: number) => `${value} minutes`;
const formatAxisObservation = (value: number) => String(value);
export function DistributionSupportResolutionTimeExample1() {
	return (
		<Stack gap="3">
			<div {...props(chartExampleStyles.header)}>
				<div>
					<Heading id="distribution-heading" level={2} size="heading">
						Support resolution time
					</Heading>
					<Text size="ui" tone="muted">
						Resolution time · minutes
					</Text>
				</div>
				<Metric>
					<MetricLabel>Tickets reviewed</MetricLabel>
					<MetricValue>{observations.length}</MetricValue>
					<MetricDescription>Ten-minute intervals</MetricDescription>
				</Metric>
			</div>
			<Distribution
				aria-label="Support resolution time distribution"
				binCount={8}
				domain={[0, 80]}
				formatAxisValue={formatAxisObservation}
				formatValue={formatObservation}
				seriesLabel="Tickets"
				values={observations}
			/>
		</Stack>
	);
}
