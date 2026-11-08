"use client";

import { Heatmap } from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";

// A small grid sizes to its cells, so it sits centered in the stage.
const styles = create({
	fit: {
		inlineSize: "fit-content",
		marginInline: "auto",
		maxInlineSize: "100%",
	},
});

export function WeeklyActivity() {
	const columns = ["Mon", "Tue", "Wed", "Thu", "Fri"];
	const rows = [
		{ label: "Design", values: [3, 5, 2, 4, 1] },
		{ label: "Engineering", values: [6, 4, 7, null, 5] },
	];
	return (
		<div {...props(styles.fit)}>
			<Heatmap
				aria-label="Weekly activity by team"
				columns={columns}
				max={7}
				rows={rows}
				valueLabel="tasks"
			/>
		</div>
	);
}
