"use client";

import { Funnel } from "@mizen/ui";

// presentation="flow" draws one band that narrows from stage to stage.
export function FunnelFlowExample() {
	return (
		<Funnel
			aria-label="Sign-up funnel, last 7 days"
			presentation="flow"
			stages={[
				{ id: "opened", label: "Link opened", value: 197 },
				{ id: "started", label: "Started", value: 110 },
				{ id: "completed", label: "Completed", value: 77 },
				{ id: "converted", label: "Converted", value: 38 },
			]}
		/>
	);
}
