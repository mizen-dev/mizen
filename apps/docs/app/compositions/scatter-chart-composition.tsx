"use client";

import {
	Button,
	Card,
	CardPanel,
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
	Heading,
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
	ScatterChart,
	Section,
	Stack,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { chartExampleStyles } from "./chart-composition.styles";

const points = [
	{ id: "student-1", label: "Student 1", x: 2, y: 62 },
	{ id: "student-2", label: "Student 2", x: 4, y: 71 },
	{ id: "student-3", label: "Student 3", x: 5, y: 74 },
	{ id: "student-4", label: "Student 4", x: 6, y: 79 },
	{ id: "student-5", label: "Student 5", x: 8, y: 83 },
	{ id: "student-6", label: "Student 6", x: 10, y: 88 },
	{ id: "student-7", label: "Student 7", x: 12, y: 91 },
] as const;

const formatHours = (value: number) => String(value);
const formatPoints = (value: number) => String(value);

export function ScatterChartExamples() {
	return (
		<Section
			aria-labelledby="scatter-chart-heading"
			data-testid="scatter-chart-example"
		>
			<div {...props(chartExampleStyles.workarea)}>
				<Stack gap="4">
					<Card>
						<CardPanel>
							<Stack gap="3">
								<div {...props(chartExampleStyles.header)}>
									<div>
										<Heading
											id="scatter-chart-heading"
											level={2}
											size="heading"
										>
											Study time and assessment score
										</Heading>
										<Text size="ui" tone="muted">
											Hours per week · assessment points
										</Text>
									</div>
									<Metric>
										<MetricLabel>Students observed</MetricLabel>
										<MetricValue>{points.length}</MetricValue>
										<MetricDescription>
											2–12 hours of weekly study
										</MetricDescription>
									</Metric>
								</div>
								<ScatterChart
									aria-description="Assessment scores by weekly study hours for seven students."
									aria-label="Assessment scores by study hours"
									formatX={formatHours}
									formatY={formatPoints}
									points={points}
									xAxisLabel="Study hours per week"
									yAxisLabel="Assessment score"
								/>
							</Stack>
						</CardPanel>
					</Card>
					<Collapsible>
						<CollapsibleTrigger render={<Button size="sm" variant="ghost" />}>
							Single-observation example
						</CollapsibleTrigger>
						<CollapsiblePanel>
							<Card>
								<CardPanel>
									<ScatterChart
										aria-label="Single observation"
										data-testid="scatter-single-point"
										points={[{ id: "single", label: "Reference", x: 0, y: 0 }]}
										xAxisLabel="Hours"
										yAxisLabel="Score"
									/>
								</CardPanel>
							</Card>
						</CollapsiblePanel>
					</Collapsible>
				</Stack>
			</div>
		</Section>
	);
}
