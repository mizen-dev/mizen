"use client";

import { MetricTrend, ScoreGauge } from "@mizen-labs/ui";
import { IconMoon } from "@tabler/icons-react";
import { useState } from "react";
import { PeriodSelect } from "./chart-controls";

const WEEKS = ["29 Jun – 5 Jul", "22 – 28 Jun"] as const;
type Week = (typeof WEEKS)[number];
const sleepByWeek: Record<
	Week,
	{
		rating: string;
		duration: [string, number];
		bedtime: [string, number];
		interruptions: [string, number];
	}
> = {
	"22 – 28 Jun": {
		bedtime: ["55m later", 14],
		duration: ["5h 50m", 26],
		interruptions: ["32m awake", 11],
		rating: "Fair",
	},
	"29 Jun – 5 Jul": {
		bedtime: ["20m earlier", 29],
		duration: ["7h 50m", 49],
		interruptions: ["5m awake", 20],
		rating: "Excellent",
	},
};

export function SleepScoreCard() {
	const [week, setWeek] = useState<Week>("29 Jun – 5 Jul");
	const { bedtime, duration, interruptions, rating } = sleepByWeek[week];
	return (
		<MetricTrend
			actions={
				<PeriodSelect
					label="Week"
					onValueChange={setWeek}
					options={WEEKS}
					value={week}
				/>
			}
			icon={<IconMoon />}
			label="Sleep score"
			value={rating}
		>
			<ScoreGauge
				aria-label="Sleep score"
				parts={[
					{
						detail: duration[0],
						id: "duration",
						label: "Duration",
						max: 50,
						value: duration[1],
					},
					{
						detail: bedtime[0],
						id: "bedtime",
						label: "Bedtime",
						max: 30,
						value: bedtime[1],
					},
					{
						detail: interruptions[0],
						id: "interruptions",
						label: "Interruptions",
						max: 20,
						value: interruptions[1],
					},
				]}
			/>
		</MetricTrend>
	);
}
