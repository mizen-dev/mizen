"use client";

import { MetricDelta, MetricTrend, RadialBars } from "@mizen/ui";
import { IconWorld } from "@tabler/icons-react";
import { useState } from "react";
import { PeriodSelect } from "./chart-controls";

const PERIODS = ["Last 7 days", "Last 30 days"] as const;
type Period = (typeof PERIODS)[number];
const BROWSERS = [
	{ id: "chrome", label: "Chrome" },
	{ id: "safari", label: "Safari" },
	{ id: "firefox", label: "Firefox" },
	{ id: "edge", label: "Edge" },
	{ id: "other", label: "Other" },
];
// Visitors per browser, in the order above.
const browsersByPeriod: Record<Period, { delta: number; visitors: number[] }> =
	{
		"Last 7 days": { delta: 0.052, visitors: [275, 200, 187, 173, 90] },
		"Last 30 days": { delta: -0.028, visitors: [980, 1640, 420, 150, 620] },
	};

export function BrowsersCard() {
	const [period, setPeriod] = useState<Period>("Last 7 days");
	const { delta, visitors } = browsersByPeriod[period];
	return (
		<MetricTrend
			actions={
				<PeriodSelect
					label="Period"
					onValueChange={setPeriod}
					options={PERIODS}
					value={period}
				/>
			}
			delta={<MetricDelta value={delta} />}
			icon={<IconWorld />}
			label="Visitors"
			value={visitors
				.reduce((sum, value) => sum + value, 0)
				.toLocaleString("en-US")}
		>
			<RadialBars
				aria-label={`Visitors by browser, ${period.toLowerCase()}`}
				items={BROWSERS.map((browser, index) => ({
					...browser,
					value: visitors[index] ?? 0,
				}))}
			/>
		</MetricTrend>
	);
}
