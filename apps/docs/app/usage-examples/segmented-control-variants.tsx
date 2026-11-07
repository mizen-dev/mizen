"use client";
import {
	Badge,
	Grid,
	Heading,
	SegmentedControl,
	SegmentedControlItem,
	Stack,
	Text,
} from "@mizen/ui";
import { IconChartBar, IconLayoutGrid, IconList } from "@tabler/icons-react";
import { useState } from "react";

export function SegmentedControlProjectViewsExample1() {
	const [view, setView] = useState<string[]>(["list"]);
	return (
		<Stack gap="4">
			<SegmentedControl
				aria-label="Project view"
				onValueChange={setView}
				value={view}
			>
				<SegmentedControlItem value="list">List</SegmentedControlItem>
				<SegmentedControlItem value="board">Board</SegmentedControlItem>
				<SegmentedControlItem disabled value="timeline">
					Timeline
				</SegmentedControlItem>
			</SegmentedControl>
			{view.includes("board") ? (
				<Grid>
					<Stack gap="2">
						<Badge variant="outline">In progress</Badge>
						<Text>Northstar launch</Text>
						<Text size="ui" tone="muted">
							Maya Chen
						</Text>
					</Stack>
					<Stack gap="2">
						<Badge variant="outline">In review</Badge>
						<Text>Design system</Text>
						<Text size="ui" tone="muted">
							Sam Lee
						</Text>
					</Stack>
				</Grid>
			) : (
				<Stack gap="3">
					<Text>Northstar launch · In progress</Text>
					<Text>Design system · In review</Text>
				</Stack>
			)}
			<Text data-testid="project-view-status" size="ui" tone="muted">
				{view[0] ? `Selected view: ${view[0]}` : "No view selected."}
			</Text>
		</Stack>
	);
}
export function SegmentedControlReportSettingsExample2() {
	return (
		<Stack>
			<Heading level={3}>Report settings</Heading>
			<Text size="ui" tone="muted">
				Choose a period. The workspace controls the managed view.
			</Text>
			<SegmentedControl
				aria-label="Report period"
				defaultValue={["week"]}
				size="sm"
			>
				<SegmentedControlItem value="day">Day</SegmentedControlItem>
				<SegmentedControlItem value="week">Week</SegmentedControlItem>
				<SegmentedControlItem value="month">Month</SegmentedControlItem>
			</SegmentedControl>
			<SegmentedControl
				aria-label="Managed view"
				defaultValue={["table"]}
				disabled
				size="lg"
			>
				<SegmentedControlItem value="table">Table</SegmentedControlItem>
				<SegmentedControlItem value="chart">Chart</SegmentedControlItem>
			</SegmentedControl>
		</Stack>
	);
}

export function SegmentedControlStates() {
	return (
		<Stack gap="4">
			{(["sm", "default", "lg"] as const).map((size) => (
				<SegmentedControl
					aria-label={`${size} views`}
					defaultValue={["list"]}
					key={size}
					size={size}
				>
					<SegmentedControlItem value="list">
						<IconList aria-hidden="true" />
						List
					</SegmentedControlItem>
					<SegmentedControlItem value="board">
						<IconLayoutGrid aria-hidden="true" />
						Board
					</SegmentedControlItem>
					<SegmentedControlItem disabled value="chart">
						<IconChartBar aria-hidden="true" />
						Chart
					</SegmentedControlItem>
				</SegmentedControl>
			))}
			<SegmentedControl
				aria-label="Vertical views"
				defaultValue={["list"]}
				orientation="vertical"
			>
				<SegmentedControlItem value="list">List</SegmentedControlItem>
				<SegmentedControlItem value="board">Board</SegmentedControlItem>
			</SegmentedControl>
		</Stack>
	);
}
