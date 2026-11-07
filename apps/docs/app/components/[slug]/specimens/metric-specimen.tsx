import { Badge, Card, CardContent, Code, Grid, Stack } from "@mizen-labs/ui";
import {
	Metric,
	MetricDescription,
	MetricLabel,
	MetricValue,
} from "@mizen-labs/ui/metric";
import { SpecimenSection } from "./specimen-section";

export function MetricSpecimen() {
	return (
		<Stack gap="8">
			<SpecimenSection primary title="Subscriptions">
				<Metric data-testid="metric-standalone">
					<MetricLabel>Active subscriptions</MetricLabel>
					<MetricValue>14,820</MetricValue>
					<MetricDescription>
						Active paid organizations in current billing period.
					</MetricDescription>
				</Metric>
			</SpecimenSection>

			<SpecimenSection canvas={false} title="Revenue and uptime">
				<Grid data-testid="metric-grid">
					<Card data-testid="metric-card-revenue">
						<CardContent>
							<Metric data-testid="metric-revenue">
								<MetricLabel>Monthly recurring revenue</MetricLabel>
								<MetricValue>$84,250</MetricValue>
								<MetricDescription>
									Total invoiced revenue across all subscription tiers.
								</MetricDescription>
							</Metric>
						</CardContent>
					</Card>
					<Card data-testid="metric-card-uptime">
						<CardContent>
							<Metric data-testid="metric-uptime">
								<MetricLabel>Service availability</MetricLabel>
								<MetricValue>99.98%</MetricValue>
								<MetricDescription>
									Rolling 90-day system uptime across production clusters.
								</MetricDescription>
							</Metric>
						</CardContent>
					</Card>
				</Grid>
			</SpecimenSection>

			<SpecimenSection title="Traffic and cache">
				<Stack>
					<Metric data-testid="metric-rich-badge">
						<MetricLabel>API request volume</MetricLabel>
						<MetricValue>4,821,090</MetricValue>
						<MetricDescription>
							<Badge variant="success">+14.2%</Badge> Increased from previous
							30-day window.
						</MetricDescription>
					</Metric>
					<Metric data-testid="metric-rich-code">
						<MetricLabel>Cache hit ratio</MetricLabel>
						<MetricValue>98.7%</MetricValue>
						<MetricDescription>
							Monitored via query <Code>edge.cache.hit_ratio</Code> across all
							regions.
						</MetricDescription>
					</Metric>
				</Stack>
			</SpecimenSection>
		</Stack>
	);
}
