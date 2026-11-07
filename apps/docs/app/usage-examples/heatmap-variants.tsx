import {
	Heading,
	Heatmap,
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
	Stack,
	Text,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { chartExampleStyles } from "../compositions/chart-composition.styles";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export function HeatmapRequestsByWeekdayAndTimeExample1() {
	return (
		<Stack gap="3">
			<div {...props(chartExampleStyles.header)}>
				<div>
					<Heading id="heatmap-examples-heading" level={2} size="heading">
						Requests by weekday and time
					</Heading>
					<Text size="ui" tone="muted">
						Weekly activity · requests per period
					</Text>
				</div>
				<Metric>
					<MetricLabel>Peak requests</MetricLabel>
					<MetricValue>24</MetricValue>
					<MetricDescription>Wednesday afternoon</MetricDescription>
				</Metric>
			</div>
			<Heatmap
				aria-label="Requests by weekday and time"
				columns={weekdays}
				data-testid="heatmap-example"
				max={24}
				rows={[
					{ label: "Morning", values: [12, 16, 19, 15, 21, 9, 0] },
					{
						label: "Afternoon",
						values: [18, 20, 24, 17, 22, 11, null],
					},
					{ label: "Evening", values: [7, 8, 11, 13, 10, 6, 2] },
					{ label: "Night", values: [1, 0, 2, 1, 3, 4, 1] },
				]}
				valueLabel="Requests"
			/>
		</Stack>
	);
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 12 }, (_, index) =>
	String(index * 2).padStart(2, "0")
);
// Weekday traffic peaks mid-afternoon; weekends stay flatter.
const activeUsers = DAYS.map((day, dayIndex) => ({
	label: day,
	values: HOURS.map((_, hourIndex) => {
		const peak = Math.max(0, 6 - Math.abs(hourIndex - 7));
		return Math.round(peak * (dayIndex < 5 ? 14 : 6) + 8 + dayIndex);
	}),
}));

// A dense day-by-hour grid keeps every cell compact and square.
export function HeatmapActiveUsersByHourExample() {
	return (
		<Heatmap
			aria-label="Active users by weekday and hour"
			columns={HOURS}
			rows={activeUsers}
			tone="series5"
			valueLabel="Active users"
		/>
	);
}
