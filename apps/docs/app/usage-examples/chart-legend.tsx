import { ChartLegend } from "@mizen/ui";

export function RevenueLegend() {
	const items = [
		{ id: "current", label: "Current year", tone: "series1" as const },
		{ id: "previous", label: "Previous year", tone: "series2" as const },
	];
	return <ChartLegend aria-label="Revenue series" items={items} />;
}
