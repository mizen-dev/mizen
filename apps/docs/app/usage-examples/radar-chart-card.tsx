"use client";

import {
	ChartLegend,
	MetricDelta,
	MetricTrend,
	RadarChart,
} from "@mizen-labs/ui";
import { IconTargetArrow } from "@tabler/icons-react";

export function VendorScoreCard() {
	return (
		<MetricTrend
			actions={
				<ChartLegend
					aria-label="Vendors"
					items={[
						{ id: "candidate", label: "Candidate", tone: "series1" },
						{ id: "current", label: "Current", tone: "series2" },
					]}
				/>
			}
			delta={<MetricDelta value={0.11} />}
			description="Candidate average"
			icon={<IconTargetArrow />}
			label="Vendor score"
			value="7.3"
			valueSuffix="/10"
		>
			<RadarChart
				aria-label="Vendor scores out of 10"
				axes={[
					{ id: "speed", label: "Speed" },
					{ id: "reliability", label: "Reliability" },
					{ id: "support", label: "Support" },
					{ id: "price", label: "Price" },
					{ id: "features", label: "Features" },
					{ id: "security", label: "Security" },
				]}
				legend={false}
				max={10}
				series={[
					{ id: "candidate", label: "Candidate", values: [9, 7, 8, 5, 8, 7] },
					{ id: "current", label: "Current", values: [6, 8, 5, 7, 6, 9] },
				]}
			/>
		</MetricTrend>
	);
}
