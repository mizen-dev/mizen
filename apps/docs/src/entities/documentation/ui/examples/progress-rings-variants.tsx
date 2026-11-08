"use client";

import { ProgressRings } from "@mizen-labs/ui";
import { create, props } from "@stylexjs/stylex";

const styles = create({
	day: {
		alignItems: "center",
		display: "flex",
		flexDirection: "column",
		gap: "0.25rem",
	},
	week: {
		display: "flex",
		flexWrap: "wrap",
		gap: "1rem",
		justifyContent: "center",
	},
});

const DAYS = [
	["Mon", 0.9, 0.7, 0.5],
	["Tue", 0.6, 0.8, 0.9],
	["Wed", 1, 1, 0.7],
	["Thu", 0.4, 0.3, 0.2],
	["Fri", 0.8, 0.9, 1],
	["Sat", 0.3, 0.5, 0],
	["Sun", 0.7, 0.6, 0.4],
] as const;

// size="sm" draws a 32px glyph for dense grids; its values stay readable to
// assistive technology.
export function ProgressRingsWeekExample() {
	return (
		<div {...props(styles.week)}>
			{DAYS.map(([day, move, exercise, running]) => (
				<div key={day} {...props(styles.day)}>
					<ProgressRings
						aria-label={`Activity on ${day}`}
						rings={[
							{ goal: 1, id: "move", label: "Move", value: move },
							{ goal: 1, id: "exercise", label: "Exercise", value: exercise },
							{ goal: 1, id: "running", label: "Running", value: running },
						]}
						size="sm"
					/>
					<span>{day}</span>
				</div>
			))}
		</div>
	);
}
