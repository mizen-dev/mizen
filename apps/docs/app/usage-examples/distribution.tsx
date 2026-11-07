"use client";

import { Distribution } from "@mizen/ui";
import { useCallback } from "react";

export function ResponseTimeDistribution() {
	const values = [12, 18, 21, 24, 29, 31, 33, 37, 42, 49, 55, 68];
	const formatAxisValue = useCallback((value: number) => String(value), []);
	const formatValue = useCallback((value: number) => `${value} min`, []);
	return (
		<Distribution
			aria-description="Response times in minutes."
			aria-label="Response time distribution"
			binCount={8}
			domain={[0, 80]}
			formatAxisValue={formatAxisValue}
			formatValue={formatValue}
			seriesLabel="Response time"
			values={values}
		/>
	);
}
