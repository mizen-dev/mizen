import {
	Button,
	Grid,
	MetricTrend,
	Section,
	SectionAction,
	SectionDescription,
	SectionHeader,
	SectionTitle,
} from "@mizen-labs/ui";

const usage = [
	["Requests", "1.2M"],
	["Bandwidth", "84 GB"],
	["Build minutes", "312"],
	["Seats", "8 of 10"],
] as const;

export function UsageSection() {
	return (
		<Section aria-labelledby="usage-title">
			<SectionHeader>
				<SectionTitle id="usage-title">Usage</SectionTitle>
				<SectionDescription>This billing period.</SectionDescription>
				<SectionAction>
					<Button size="sm" variant="outline">
						Export
					</Button>
				</SectionAction>
			</SectionHeader>
			<Grid columns="4" gap="4">
				{usage.map(([label, value]) => (
					<MetricTrend key={label} label={label} value={value} />
				))}
			</Grid>
		</Section>
	);
}
