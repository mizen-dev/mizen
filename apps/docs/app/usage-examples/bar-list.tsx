"use client";

import { BarList } from "@mizen/ui";
import {
	IconDeviceDesktop,
	IconDeviceMobile,
	IconDeviceTablet,
} from "@tabler/icons-react";

const formatShare = (value: number) => `${value}%`;

export function VisitorsByDevice() {
	return (
		<BarList
			aria-label="Visitors by device"
			formatValue={formatShare}
			items={[
				{
					icon: <IconDeviceMobile />,
					id: "mobile",
					label: "Mobile",
					value: 31,
				},
				{
					icon: <IconDeviceDesktop />,
					id: "desktop",
					label: "Desktop",
					value: 61,
				},
				{ icon: <IconDeviceTablet />, id: "tablet", label: "Tablet", value: 8 },
			]}
			valueLabel="Visitors"
		/>
	);
}
