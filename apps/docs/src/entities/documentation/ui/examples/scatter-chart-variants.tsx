"use client";
import {
	Heading,
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
	ScatterChart,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { chartExampleStyles } from "../compositions/chart-composition.styles";

const studyHours = [
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
export function ScatterChartStudyTimeAndAssessmentScoreExample1() {
	return (
		<Stack gap="3">
			<div {...props(chartExampleStyles.header)}>
				<div>
					<Heading id="scatter-chart-heading" level={2} size="heading">
						Study time and assessment score
					</Heading>
					<Text size="ui" tone="muted">
						Hours per week · assessment points
					</Text>
				</div>
				<Metric>
					<MetricLabel>Students observed</MetricLabel>
					<MetricValue>{studyHours.length}</MetricValue>
					<MetricDescription>2–12 hours of weekly study</MetricDescription>
				</Metric>
			</div>
			<ScatterChart
				aria-description="Assessment scores by weekly study hours for seven students."
				aria-label="Assessment scores by study hours"
				formatX={formatHours}
				formatY={formatPoints}
				points={studyHours}
				xAxisLabel="Study hours per week"
				yAxisLabel="Assessment score"
			/>
		</Stack>
	);
}

const accounts = [
	{ group: "starter", revenue: 180, seats: 2, sessions: 12 },
	{ group: "starter", revenue: 240, seats: 3, sessions: 18 },
	{ group: "starter", revenue: 210, seats: 2, sessions: 24 },
	{ group: "starter", revenue: 320, seats: 4, sessions: 31 },
	{ group: "starter", revenue: 290, seats: 3, sessions: 38 },
	{ group: "starter", revenue: 360, seats: 5, sessions: 45 },
	{ group: "growth", revenue: 610, seats: 8, sessions: 42 },
	{ group: "growth", revenue: 740, seats: 12, sessions: 55 },
	{ group: "growth", revenue: 690, seats: 10, sessions: 61 },
	{ group: "growth", revenue: 860, seats: 14, sessions: 68 },
	{ group: "growth", revenue: 820, seats: 12, sessions: 74 },
	{ group: "growth", revenue: 980, seats: 16, sessions: 83 },
	{ group: "scale", revenue: 1290, seats: 30, sessions: 78 },
	{ group: "scale", revenue: 1480, seats: 38, sessions: 86 },
	{ group: "scale", revenue: 1350, seats: 34, sessions: 92 },
	{ group: "scale", revenue: 1620, seats: 44, sessions: 97 },
];

// Groups take the first three palette hues; size draws seats as bubble area.
export function ScatterChartAccountTiersExample() {
	return (
		<ScatterChart
			aria-label="Revenue per account against sessions, by plan"
			groups={[
				{ id: "starter", label: "Starter" },
				{ id: "growth", label: "Growth" },
				{ id: "scale", label: "Scale" },
			]}
			points={accounts.map(({ group, revenue, seats, sessions }, index) => ({
				group,
				id: `account-${index}`,
				label: `Account ${index + 1} · ${seats} seats`,
				size: seats,
				x: sessions,
				y: revenue,
			}))}
			xAxisLabel="Sessions"
			yAxisLabel="Revenue per account"
		/>
	);
}
