import { Heading, Stack, Text } from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import Link from "next/link";
import { ActionContentComposition } from "../../compositions/action-content-composition";
import { AgentSelectorExamples } from "../../compositions/agent-selector-composition";
import { AnalyticsWorkspaceExamples } from "../../compositions/analytics-workspace-composition";
import { CategoryComparisonExamples } from "../../compositions/category-comparison-composition";
import {
	ChartFrameExamples,
	ChartPaletteExamples,
} from "../../compositions/charts-composition";
import { CodeBlockExamples } from "../../compositions/code-block-composition";
import { CompoundActionsComposition } from "../../compositions/compound-actions-composition";
import { DataSystemsComposition } from "../../compositions/data-systems-composition";
import { DataTableExamples } from "../../compositions/data-table-composition";
import { DistributionExamples } from "../../compositions/distribution-composition";
import { FoundationStudy } from "../../compositions/foundation-study-composition";
import { HeatmapExamples } from "../../compositions/heatmap-composition";
import { ListExamples } from "../../compositions/list-composition";
import { MediaContentComposition } from "../../compositions/media-content-composition";
import { NavigationComposition } from "../../compositions/navigation-composition";
import { NotificationCenterExamples } from "../../compositions/notification-center-composition";
import { OutlineExamples } from "../../compositions/outline-composition";
import { OverlayComposition } from "../../compositions/overlay-composition";
import { PartToWholeExamples } from "../../compositions/part-to-whole-composition";
import { PrimitiveGapComposition } from "../../compositions/primitive-gap-composition";
import { RecordsComposition } from "../../compositions/records-composition";
import { RichContentComposition } from "../../compositions/rich-content-composition";
import { ScatterChartExamples } from "../../compositions/scatter-chart-composition";
import { SettingsComposition } from "../../compositions/settings-composition";
import { SiteNavigationComposition } from "../../compositions/site-navigation-composition";
import { TableExamples } from "../../compositions/table-composition";
import { TemporalInputsComposition } from "../../compositions/temporal-inputs-composition";
import {
	MetricTrendExamples,
	TimeSeriesExamples,
} from "../../compositions/time-series-composition";
import { TreeListExamples } from "../../compositions/tree-list-composition";
import { UsagePanelExamples } from "../../compositions/usage-panel-composition";
import { pageStyles } from "../../page.styles";

export default function Page() {
	return (
		<main id="docs-content" {...props(pageStyles.page)}>
			<Stack gap="6">
				<Stack gap="3">
					<Heading level={1} size="display">
						Mizen
					</Heading>
					<Text>
						Small, opinionated controls with stable APIs and deliberate
						interaction.
					</Text>
					<Link href="/docs">Browse components</Link>
				</Stack>
				<FoundationStudy />
				<section aria-label="Analytics workspace" id="analytics-workspace">
					<AnalyticsWorkspaceExamples showExamples />
				</section>
				<Stack gap="6">
					<SettingsComposition showExamples />
					<TemporalInputsComposition />
					<CompoundActionsComposition />
					<NavigationComposition />
					<SiteNavigationComposition />
					<OverlayComposition />
					<RecordsComposition showExamples />
					<TableExamples />
					<DataTableExamples />
					<OutlineExamples />
					<ListExamples />
					<NotificationCenterExamples />
					<DataSystemsComposition />
					<TreeListExamples />
					<ChartFrameExamples />
					<ChartPaletteExamples />
					<HeatmapExamples />
					<ScatterChartExamples />
					<MetricTrendExamples />
					<UsagePanelExamples />
					<TimeSeriesExamples />
					<CategoryComparisonExamples />
					<DistributionExamples />
					<PartToWholeExamples />
					<AgentSelectorExamples />
					<MediaContentComposition />
					<CodeBlockExamples />
					<RichContentComposition />
					<PrimitiveGapComposition />
					<ActionContentComposition />
				</Stack>
			</Stack>
		</main>
	);
}
