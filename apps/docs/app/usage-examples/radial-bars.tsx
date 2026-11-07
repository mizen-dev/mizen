"use client";

import { RadialBars } from "@mizen/ui";

export function VisitorsByBrowser() {
	return (
		<RadialBars
			aria-label="Visitors by browser, last 7 days"
			items={[
				{ id: "chrome", label: "Chrome", value: 275 },
				{ id: "safari", label: "Safari", value: 200 },
				{ id: "firefox", label: "Firefox", value: 187 },
				{ id: "edge", label: "Edge", value: 173 },
				{ id: "other", label: "Other", value: 90 },
			]}
		/>
	);
}
