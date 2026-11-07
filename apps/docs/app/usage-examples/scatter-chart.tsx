"use client";

import { ScatterChart } from "@mizen/ui";
import { useCallback } from "react";

export function StudyOutcomes() {
	const points = [
		{ id: "student-1", label: "Student 1", x: 2, y: 62 },
		{ id: "student-2", label: "Student 2", x: 4, y: 71 },
		{ id: "student-3", label: "Student 3", x: 7, y: 83 },
		{ id: "student-4", label: "Student 4", x: 10, y: 88 },
	];
	const formatValue = useCallback((value: number) => String(value), []);
	return (
		<ScatterChart
			aria-description="Assessment scores compared with weekly study hours."
			aria-label="Study hours and assessment scores"
			formatX={formatValue}
			formatY={formatValue}
			points={points}
			xAxisLabel="Study hours per week"
			yAxisLabel="Assessment score"
		/>
	);
}
