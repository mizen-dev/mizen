"use client";

import { CategoryComparison } from "@mizen/ui";
import { useCallback } from "react";

export function TicketsByTeam() {
	const categories = [
		{ id: "design", label: "Design", value: 18 },
		{ id: "engineering", label: "Engineering", value: 26 },
		{ id: "support", label: "Support", value: 12 },
	];
	const formatValue = useCallback((value: number) => String(value), []);
	return (
		<CategoryComparison
			aria-description="Open tickets by team."
			aria-label="Open tickets by team"
			categories={categories}
			formatValue={formatValue}
			seriesLabel="Open tickets"
		/>
	);
}
