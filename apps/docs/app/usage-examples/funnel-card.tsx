"use client";

import { Funnel, MetricDelta, MetricTrend } from "@mizen/ui";
import {
	IconBolt,
	IconBuilding,
	IconChartFunnel,
	IconCrown,
	IconEye,
	IconUserPlus,
	IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { PeriodSelect } from "./chart-controls";

const PERIODS = ["Last 7 days", "Last 30 days"] as const;
type Period = (typeof PERIODS)[number];
// Visits, sign-up, active, pro, team, and enterprise.
const pipelineByPeriod: Record<Period, { delta: number; stages: number[] }> = {
	"Last 7 days": { delta: 0.024, stages: [1180, 790, 460, 250, 120, 40] },
	"Last 30 days": { delta: -0.063, stages: [4920, 1310, 1120, 880, 610, 290] },
};
// Link opened, started, completed, and converted.
const signupsByPeriod: Record<Period, { delta: number; stages: number[] }> = {
	"Last 7 days": { delta: 0.052, stages: [197, 110, 77, 38] },
	"Last 30 days": { delta: 0.118, stages: [842, 701, 602, 455] },
};
const count = (value: number) => value.toLocaleString("en-US");

export function PipelineCard() {
	const [period, setPeriod] = useState<Period>("Last 7 days");
	const { delta, stages } = pipelineByPeriod[period];
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
			icon={<IconChartFunnel />}
			label="Pipeline"
			value={count(stages[0])}
		>
			<Funnel
				aria-label={`Signup pipeline, ${period.toLowerCase()}`}
				stages={[
					{
						icon: <IconEye />,
						id: "visits",
						label: "Visits",
						value: stages[0],
					},
					{
						icon: <IconUserPlus />,
						id: "signup",
						label: "Sign-up",
						value: stages[1],
					},
					{
						icon: <IconBolt />,
						id: "active",
						label: "Active",
						value: stages[2],
					},
					{ icon: <IconCrown />, id: "pro", label: "Pro", value: stages[3] },
					{ icon: <IconUsers />, id: "team", label: "Team", value: stages[4] },
					{
						icon: <IconBuilding />,
						id: "enterprise",
						label: "Enterprise",
						value: stages[5],
					},
				]}
			/>
		</MetricTrend>
	);
}

export function SignupFlowCard() {
	const [period, setPeriod] = useState<Period>("Last 7 days");
	const { delta, stages: flow } = signupsByPeriod[period];
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
			icon={<IconUserPlus />}
			label="Sign-up funnel"
			value={count(flow[0])}
		>
			<Funnel
				aria-label={`Sign-up funnel, ${period.toLowerCase()}`}
				presentation="flow"
				stages={[
					{ id: "opened", label: "Link opened", value: flow[0] },
					{ id: "started", label: "Started", value: flow[1] },
					{ id: "completed", label: "Completed", value: flow[2] },
					{ id: "converted", label: "Converted", value: flow[3] },
				]}
			/>
		</MetricTrend>
	);
}
