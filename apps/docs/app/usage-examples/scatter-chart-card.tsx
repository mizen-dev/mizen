"use client";

import { MetricDelta, MetricTrend, ScatterChart } from "@mizen/ui";
import { IconCoin } from "@tabler/icons-react";
import { useState } from "react";
import { PeriodSelect } from "./chart-controls";

const accountRows = [
	["starter", 12, 180, 2],
	["starter", 18, 240, 3],
	["starter", 24, 210, 2],
	["starter", 31, 320, 4],
	["starter", 38, 290, 3],
	["starter", 45, 360, 5],
	["growth", 42, 610, 8],
	["growth", 55, 740, 12],
	["growth", 61, 690, 10],
	["growth", 68, 860, 14],
	["growth", 74, 820, 12],
	["growth", 83, 980, 16],
	["scale", 78, 1290, 30],
	["scale", 86, 1480, 38],
	["scale", 92, 1350, 34],
	["scale", 97, 1620, 44],
] as const;

const PERIODS = ["This quarter", "Last quarter"] as const;
type Period = (typeof PERIODS)[number];
// Last quarter, before the Growth plan launched: Starter accounts spread
// wide, and Scale accounts earned less per session.
const lastQuarterRows = [
	["starter", 8, 120, 1],
	["starter", 22, 380, 3],
	["starter", 35, 150, 2],
	["starter", 47, 520, 4],
	["starter", 58, 260, 2],
	["starter", 66, 610, 5],
	["starter", 74, 340, 3],
	["growth", 52, 430, 6],
	["growth", 61, 470, 7],
	["scale", 70, 820, 22],
	["scale", 81, 760, 26],
	["scale", 88, 940, 30],
	["scale", 95, 880, 28],
] as const;
const accountsByPeriod = {
	"Last quarter": { delta: -0.052, rows: lastQuarterRows, value: "512" },
	"This quarter": { delta: 0.068, rows: accountRows, value: "742" },
};

export function RevenuePerAccountCard() {
	const [period, setPeriod] = useState<Period>("This quarter");
	const { delta, rows, value } = accountsByPeriod[period];
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
			icon={<IconCoin />}
			label="Revenue per account"
			value={value}
			valuePrefix="$"
		>
			<ScatterChart
				aria-label="Revenue per account against sessions, by plan"
				groups={[
					{ id: "starter", label: "Starter" },
					{ id: "growth", label: "Growth" },
					{ id: "scale", label: "Scale" },
				]}
				points={rows.map(([group, sessions, revenue, seats], index) => ({
					group,
					id: `account-${index}`,
					label: `Account ${index + 1} · ${seats} seats`,
					size: seats,
					x: sessions,
					y: revenue,
				}))}
				xAxisLabel="Sessions"
				yAxisLabel="Revenue per account"
			/>
		</MetricTrend>
	);
}
