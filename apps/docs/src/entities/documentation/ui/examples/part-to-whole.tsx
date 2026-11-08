"use client";

import { PartToWhole } from "@mizen-labs/ui";

export function SupportShare() {
	const parts = [
		{ id: "email", label: "Email", value: 1284 },
		{ id: "chat", label: "Chat", value: 856 },
		{ id: "phone", label: "Phone", value: 535 },
	];
	return (
		<PartToWhole
			aria-description="Share of support requests by channel."
			aria-label="Support requests by channel"
			parts={parts}
			totalLabel="Requests"
		/>
	);
}
