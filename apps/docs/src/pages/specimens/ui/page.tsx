import { Heading, Stack, Text } from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { ActionContentComposition } from "../../../entities/documentation/ui/compositions/action-content-composition";
import { AgentSelectorExamples } from "../../../entities/documentation/ui/compositions/agent-selector-composition";
import { AnalyticsWorkspaceExamples } from "../../../entities/documentation/ui/compositions/analytics-workspace-composition";
import { CategoryComparisonExamples } from "../../../entities/documentation/ui/compositions/category-comparison-composition";
import {
	ChartFrameExamples,
	ChartPaletteExamples,
} from "../../../entities/documentation/ui/compositions/charts-composition";
import { CodeBlockExamples } from "../../../entities/documentation/ui/compositions/code-block-composition";
import { CompoundActionsComposition } from "../../../entities/documentation/ui/compositions/compound-actions-composition";
import { DataSystemsComposition } from "../../../entities/documentation/ui/compositions/data-systems-composition";
import { DataTableExamples } from "../../../entities/documentation/ui/compositions/data-table-composition";
import { DistributionExamples } from "../../../entities/documentation/ui/compositions/distribution-composition";
import { FoundationStudy } from "../../../entities/documentation/ui/compositions/foundation-study-composition";
import { HeatmapExamples } from "../../../entities/documentation/ui/compositions/heatmap-composition";
import { ListExamples } from "../../../entities/documentation/ui/compositions/list-composition";
import { MediaContentComposition } from "../../../entities/documentation/ui/compositions/media-content-composition";
import { NavigationComposition } from "../../../entities/documentation/ui/compositions/navigation-composition";
import { NotificationCenterExamples } from "../../../entities/documentation/ui/compositions/notification-center-composition";
import { OutlineExamples } from "../../../entities/documentation/ui/compositions/outline-composition";
import { OverlayComposition } from "../../../entities/documentation/ui/compositions/overlay-composition";
import { PartToWholeExamples } from "../../../entities/documentation/ui/compositions/part-to-whole-composition";
import { PrimitiveGapComposition } from "../../../entities/documentation/ui/compositions/primitive-gap-composition";
import { RecordsComposition } from "../../../entities/documentation/ui/compositions/records-composition";
import { RichContentComposition } from "../../../entities/documentation/ui/compositions/rich-content-composition";
import { ScatterChartExamples } from "../../../entities/documentation/ui/compositions/scatter-chart-composition";
import { SettingsComposition } from "../../../entities/documentation/ui/compositions/settings-composition";
import { SiteNavigationComposition } from "../../../entities/documentation/ui/compositions/site-navigation-composition";
import { TableExamples } from "../../../entities/documentation/ui/compositions/table-composition";
import { TemporalInputsComposition } from "../../../entities/documentation/ui/compositions/temporal-inputs-composition";
import {
	MetricTrendExamples,
	TimeSeriesExamples,
} from "../../../entities/documentation/ui/compositions/time-series-composition";
import { TreeListExamples } from "../../../entities/documentation/ui/compositions/tree-list-composition";
import { UsagePanelExamples } from "../../../entities/documentation/ui/compositions/usage-panel-composition";
import { pageStyles } from "../../../entities/documentation/ui/page.styles";

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
					<Link to="/docs">Browse components</Link>
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
