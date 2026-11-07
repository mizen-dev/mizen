import {
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
} from "@mizen-labs/ui";

export function ActiveSubscriptions() {
	return (
		<Metric>
			<MetricLabel>Active subscriptions</MetricLabel>
			<MetricValue>14,820</MetricValue>
			<MetricDescription>
				Active paid organizations in this billing period.
			</MetricDescription>
		</Metric>
	);
}
