"use client";

import { SankeyChart } from "@mizen-labs/ui";

const formatHours = (value: number) => `${value}h`;

export function TrackedTime() {
	return (
		<SankeyChart
			aria-label="Tracked time this week, by activity and app"
			formatValue={formatHours}
			links={[
				{ source: "focus", target: "browsing", value: 9 },
				{ source: "focus", target: "writing", value: 12 },
				{ source: "focus", target: "productivity", value: 7 },
				{ source: "focus", target: "other", value: 4 },
				{ source: "meetings", target: "video", value: 12 },
				{ source: "meetings", target: "messaging", value: 4 },
				{ source: "meetings", target: "writing", value: 2 },
				{ source: "breaks", target: "browsing", value: 6 },
				{ source: "breaks", target: "messaging", value: 3 },
				{ source: "breaks", target: "other", value: 3 },
				{ source: "admin", target: "email", value: 7 },
				{ source: "admin", target: "messaging", value: 4 },
				{ source: "admin", target: "productivity", value: 3 },
				{ source: "learning", target: "browsing", value: 4 },
				{ source: "learning", target: "other", value: 4 },
				{ source: "learning", target: "writing", value: 2 },
			]}
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
	);
}
