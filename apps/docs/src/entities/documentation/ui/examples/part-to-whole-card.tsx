"use client";

import { MetricDelta, MetricTrend, PartToWhole } from "@mizen-labs/ui";
import { IconHeadset } from "@tabler/icons-react";
import { useState } from "react";
import { PeriodSelect } from "./chart-controls";

const PERIODS = ["This month", "Last month"] as const;
type Period = (typeof PERIODS)[number];
const requestsByPeriod: Record<
	Period,
	{ delta: number; email: number; chat: number; phone: number }
> = {
	"Last month": { chat: 2210, delta: 0.264, email: 610, phone: 180 },
	"This month": { chat: 856, delta: -0.041, email: 1284, phone: 535 },
};

export function SupportChannelsCard() {
	const [period, setPeriod] = useState<Period>("This month");
	const { chat, delta, email, phone } = requestsByPeriod[period];
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
			delta={<MetricDelta good="down" value={delta} />}
			icon={<IconHeadset />}
			label="Support requests"
			value={(email + chat + phone).toLocaleString("en-US")}
		>
			<PartToWhole
				aria-label="Support requests by channel"
				parts={[
					{ id: "email", label: "Email", value: email },
					{ id: "chat", label: "Chat", value: chat },
					{ id: "phone", label: "Phone", value: phone },
				]}
				totalLabel="Requests"
			/>
		</MetricTrend>
	);
}
