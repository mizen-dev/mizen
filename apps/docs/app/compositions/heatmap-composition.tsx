import {
	Card,
	CardPanel,
	Heading,
	Heatmap,
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
	Section,
	Stack,
	Text,
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { chartExampleStyles } from "./chart-composition.styles";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function HeatmapExamples() {
	return (
		<Section aria-labelledby="heatmap-examples-heading">
			<div {...props(chartExampleStyles.workarea)}>
				<Card>
					<CardPanel>
						<Stack gap="3">
							<div {...props(chartExampleStyles.header)}>
								<div>
									<Heading
										id="heatmap-examples-heading"
										level={2}
										size="heading"
									>
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
					</CardPanel>
				</Card>
			</div>
		</Section>
	);
}
