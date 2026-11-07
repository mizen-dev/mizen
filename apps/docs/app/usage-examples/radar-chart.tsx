"use client";

import { RadarChart } from "@mizen/ui";

const axes = [
	{ id: "speed", label: "Speed" },
	{ id: "reliability", label: "Reliability" },
	{ id: "support", label: "Support" },
	{ id: "price", label: "Price" },
	{ id: "features", label: "Features" },
	{ id: "security", label: "Security" },
];

export function VendorProfiles() {
	return (
		<RadarChart
			aria-label="Vendor scores out of 10"
			axes={axes}
			max={10}
			series={[
				{ id: "current", label: "Current vendor", values: [6, 8, 5, 7, 6, 9] },
				{ id: "candidate", label: "Candidate", values: [9, 7, 8, 5, 8, 7] },
			]}
		/>
	);
}
