"use client";

import { BarList } from "@mizen/ui";

// Without icons, a longer list of sources ranks by visits.
export function BarListTopSourcesExample() {
	return (
		<BarList
			aria-label="Top referral sources"
			items={[
				{ id: "google", label: "google.com", value: 4812 },
				{ id: "github", label: "github.com", value: 2146 },
				{ id: "newsletter", label: "Newsletter", value: 1388 },
				{ id: "x", label: "x.com", value: 902 },
				{ id: "reddit", label: "reddit.com", value: 611 },
			]}
			tone="series5"
			valueLabel="Visits"
		/>
	);
}
