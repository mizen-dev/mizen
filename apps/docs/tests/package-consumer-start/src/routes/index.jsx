import { Card, Heatmap, Inline, ScatterChart, Stack } from "@mizen-labs/ui";
import { createFileRoute } from "@tanstack/react-router";
import { ThemeSelect } from "../theme-select";
import { WorkspaceControls } from "../workspace-controls";

const rows = [
	{ label: "Monday", values: [4, 8, 6, null, 3] },
	{ label: "Tuesday", values: [5, 7, 9, 4, 2] },
	{ label: "Wednesday", values: [3, 6, 8, 5, 4] },
	{ label: "Thursday", values: [7, 9, 5, 3, 6] },
	{ label: "Friday", values: [6, 5, 4, 2, 1] },
];
const points = [
	{ id: "team-a", label: "Team A", x: 18, y: 42 },
	{ id: "team-b", label: "Team B", x: 22, y: 38 },
	{ id: "team-c", label: "Team C", x: 15, y: 55 },
	{ id: "team-d", label: "Team D", x: 31, y: 48 },
	{ id: "team-e", label: "Team E", x: 27, y: 36 },
];

export const Route = createFileRoute("/")({ component: Page });

function Page() {
	return (
		<Stack gap="6">
			<Card render={<header />}>
				<Inline gap="3">
					<span>Packed consumer</span>
					<ThemeSelect />
				</Inline>
			</Card>
			<main>
				<Stack gap="4">
					<h1>Package compiles from its archive</h1>
					<WorkspaceControls />
					<Heatmap
						aria-label="Requests by hour"
						columns={["09:00", "11:00", "13:00", "15:00", "17:00"]}
						rows={rows}
						valueLabel="Requests"
					/>
					<ScatterChart
						aria-description="Five teams compared by team size and delivery time."
						aria-label="Delivery time by team size"
						points={points}
						xAxisLabel="Team size"
						yAxisLabel="Delivery time"
					/>
				</Stack>
			</main>
		</Stack>
	);
}
