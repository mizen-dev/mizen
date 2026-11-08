import { ChartTooltip } from "@mizen-labs/ui";

export function RevenueTooltip() {
	const items = [
		{
			id: "current",
			label: "Current year",
			tone: "series1" as const,
			value: "$42,000",
		},
		{
			id: "previous",
			label: "Previous year",
			tone: "series2" as const,
			value: "$36,500",
		},
	];
	return <ChartTooltip items={items} label="April" />;
}
