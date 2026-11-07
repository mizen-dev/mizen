"use client";

import { BarList, MetricDelta, MetricTrend } from "@mizen/ui";
import {
	IconDeviceDesktop,
	IconDeviceMobile,
	IconDeviceTablet,
	IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { PeriodSelect } from "./chart-controls";

const formatShare = (value: number) => `${value}%`;
const PERIODS = ["Last 7 days", "Last 30 days"] as const;
type Period = (typeof PERIODS)[number];
const devicesByPeriod: Record<
	Period,
	{ delta: number; shares: [number, number, number]; visitors: string }
> = {
	"Last 7 days": { delta: 0.052, shares: [61, 31, 8], visitors: "12,480" },
	"Last 30 days": { delta: -0.021, shares: [36, 52, 12], visitors: "51,930" },
};

export function DevicesCard() {
	const [period, setPeriod] = useState<Period>("Last 7 days");
	const { delta, shares, visitors } = devicesByPeriod[period];
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
			icon={<IconUsers />}
			label="Visitors"
			value={visitors}
		>
			<BarList
				aria-label="Visitors by device"
				formatValue={formatShare}
				items={[
					{
						icon: <IconDeviceDesktop />,
						id: "desktop",
						label: "Desktop",
						value: shares[0],
					},
					{
						icon: <IconDeviceMobile />,
						id: "mobile",
						label: "Mobile",
						value: shares[1],
					},
					{
						icon: <IconDeviceTablet />,
						id: "tablet",
						label: "Tablet",
						value: shares[2],
					},
				]}
				valueLabel="Share"
			/>
		</MetricTrend>
	);
}
