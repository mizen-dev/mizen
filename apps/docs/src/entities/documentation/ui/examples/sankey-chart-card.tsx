"use client";

import { MetricTrend, SankeyChart } from "@mizen-labs/ui";
import { IconClock } from "@tabler/icons-react";
import { useState } from "react";
import { PeriodSelect } from "./chart-controls";

const formatHours = (value: number) => `${value}h`;

const PERIODS = ["This week", "Last week"] as const;
type Period = (typeof PERIODS)[number];
type Flow = [source: string, target: string, hours: number];
// Hours from each activity into each app.
const flowsByPeriod: Record<Period, Flow[]> = {
	// A launch week: meetings and messaging took most of the time.
	"Last week": [
		["focus", "writing", 6],
		["focus", "browsing", 3],
		["meetings", "video", 24],
		["meetings", "messaging", 9],
		["meetings", "writing", 4],
		["breaks", "browsing", 3],
		["breaks", "other", 2],
		["admin", "email", 12],
		["admin", "messaging", 8],
		["admin", "productivity", 3],
		["learning", "other", 1],
		["learning", "browsing", 1],
	],
	"This week": [
		["focus", "browsing", 9],
		["focus", "writing", 12],
		["focus", "productivity", 7],
		["focus", "other", 4],
		["meetings", "video", 12],
		["meetings", "messaging", 4],
		["meetings", "writing", 2],
		["breaks", "browsing", 6],
		["breaks", "messaging", 3],
		["breaks", "other", 3],
		["admin", "email", 7],
		["admin", "messaging", 4],
		["admin", "productivity", 3],
		["learning", "browsing", 4],
		["learning", "other", 4],
		["learning", "writing", 2],
	],
};

export function TrackedTimeCard() {
	const [period, setPeriod] = useState<Period>("This week");
	const links = flowsByPeriod[period].map(([source, target, value]) => ({
		source,
		target,
		value,
	}));
	const hours = links.reduce((sum, { value }) => sum + value, 0);
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
			icon={<IconClock />}
			label="Tracked time"
			value={String(hours)}
			valueSuffix="h"
		>
			<SankeyChart
				aria-label={`Tracked time ${period.toLowerCase()}, by activity and app`}
				formatValue={formatHours}
				links={links}
				sources={[
					{ id: "focus", label: "Focus" },
					{ id: "meetings", label: "Meetings" },
					{ id: "breaks", label: "Breaks" },
					{ id: "admin", label: "Admin" },
					{ id: "learning", label: "Learning" },
				]}
				targets={[
					{ id: "browsing", label: "Browsing" },
					{ id: "writing", label: "Writing" },
					{ id: "messaging", label: "Messaging" },
					{ id: "productivity", label: "Productivity" },
					{ id: "email", label: "Email" },
					{ id: "video", label: "Video calls" },
					{ id: "other", label: "Everything else" },
				]}
			/>
		</MetricTrend>
	);
}
