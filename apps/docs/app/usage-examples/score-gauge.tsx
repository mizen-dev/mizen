"use client";

import { ScoreGauge } from "@mizen/ui";

export function SleepScore() {
	return (
		<ScoreGauge
			aria-label="Sleep score"
			parts={[
				{
					detail: "7h 50m",
					id: "duration",
					label: "Duration",
					max: 50,
					value: 49,
				},
				{
					detail: "20m earlier",
					id: "bedtime",
					label: "Bedtime",
					max: 30,
					value: 29,
				},
				{
					detail: "5m awake",
					id: "interruptions",
					label: "Interruptions",
					max: 20,
					value: 20,
				},
			]}
		/>
	);
}
