import { Tabs, TabsList, TabsPanel, TabsTab } from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { tabsPreviewStyles } from "./tabs-preview.styles";
export function ProjectTabs() {
	return (
		<div {...props(tabsPreviewStyles.centered)}>
			<Tabs defaultValue="overview">
				<TabsList aria-label="Project sections">
					<TabsTab value="overview">Overview</TabsTab>
					<TabsTab value="activity">Activity</TabsTab>
					<TabsTab value="settings">Settings</TabsTab>
				</TabsList>
				<TabsPanel value="overview">
					Northstar ships on October 12. Three tasks remain.
				</TabsPanel>
				<TabsPanel value="activity">
					Maya approved the launch identity an hour ago.
				</TabsPanel>
				<TabsPanel value="settings">
					Members, notifications, and access for Northstar.
				</TabsPanel>
			</Tabs>
		</div>
	);
}
