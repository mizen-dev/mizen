import type {
	HeatmapProps as RootHeatmapProps,
	HeatmapRow as RootHeatmapRow,
	ScatterChartPoint as RootScatterChartPoint,
	ScatterChartProps as RootScatterChartProps,
} from "@mizen-labs/ui";
import {
	ActivityFeed,
	ActivityFeedContent,
	ActivityFeedItem,
	ActivityFeedTime,
	AspectRatio,
	Blockquote,
	BlockquoteAttribution,
	BlockquoteContent,
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	ButtonGroup,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	CategoryComparison,
	ChartFrame,
	ChartLegend,
	ChartTooltip,
	Citation,
	CodeBlock,
	CodeBlockContent,
	CodeBlockCopy,
	CodeBlockHeader,
	CodeBlockTitle,
	chartColors,
	DataTable,
	DataTablePagination,
	type DataTableProps,
	DateTimeInput,
	Distribution,
	Lightbox,
	LightboxDescription,
	LightboxImage,
	LightboxPopup,
	LightboxTitle,
	LightboxTrigger,
	Link,
	List,
	ListActions,
	type ListActionsProps,
	ListContent,
	type ListContentProps,
	ListItem,
	type ListItemProps,
	type ListProps,
	Markdown,
	Meter,
	MeterIndicator,
	MeterLabel,
	MeterTrack,
	MeterValue,
	MetricTrend,
	markdownComponents,
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuPopup,
	NavigationMenuTrigger,
	OverflowList,
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PartToWhole,
	type PartToWholePart,
	type CategoryComparisonDatum as RootCategoryComparisonDatum,
	type CategoryComparisonProps as RootCategoryComparisonProps,
	type ChartFrameProps as RootChartFrameProps,
	type ChartLegendItem as RootChartLegendItem,
	type ChartLegendProps as RootChartLegendProps,
	type ChartSeriesTone as RootChartSeriesTone,
	type ChartTooltipItem as RootChartTooltipItem,
	type ChartTooltipProps as RootChartTooltipProps,
	type CodeBlockContentProps as RootCodeBlockContentProps,
	type CodeBlockCopyProps as RootCodeBlockCopyProps,
	type CodeBlockHeaderProps as RootCodeBlockHeaderProps,
	type CodeBlockProps as RootCodeBlockProps,
	type CodeBlockTitleProps as RootCodeBlockTitleProps,
	type DistributionProps as RootDistributionProps,
	Heatmap as RootHeatmap,
	type LinkProps as RootLinkProps,
	type MarkdownProps as RootMarkdownProps,
	type MeterProps as RootMeterProps,
	type MetricTrendProps as RootMetricTrendProps,
	type PartToWholeProps as RootPartToWholeProps,
	ScatterChart as RootScatterChart,
	type ThumbnailProps as RootThumbnailProps,
	type ThumbnailSize as RootThumbnailSize,
	type TimeSeriesProps as RootTimeSeriesProps,
	type TimestampFormat as RootTimestampFormat,
	type TimestampProps as RootTimestampProps,
	type VisuallyHiddenProps as RootVisuallyHiddenProps,
	SegmentedControl,
	SegmentedControlItem,
	Stepper,
	StepperIndicator,
	StepperItem,
	StepperTitle,
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableContainer,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
	Thumbnail,
	TimeInput,
	TimeSeries,
	type TimeSeriesPoint,
	Timestamp,
	Toolbar,
	ToolbarButton,
	Tree,
	VisuallyHidden,
} from "@mizen-labs/ui";
import { ActivityFeed as SubpathActivityFeed } from "@mizen-labs/ui/activity-feed";
import { applicationStructure } from "@mizen-labs/ui/application-structure.stylex";
import { AspectRatio as SubpathAspectRatio } from "@mizen-labs/ui/aspect-ratio";
import { Blockquote as SubpathBlockquote } from "@mizen-labs/ui/blockquote";
import { Button, type ButtonProps } from "@mizen-labs/ui/button";
import { Carousel as SubpathCarousel } from "@mizen-labs/ui/carousel";
import {
	type CategoryComparisonProps,
	CategoryComparison as SubpathCategoryComparison,
} from "@mizen-labs/ui/category-comparison";
import {
	type ChartFrameProps,
	ChartFrame as SubpathChartFrame,
} from "@mizen-labs/ui/chart-frame";
import {
	type ChartLegendItem,
	type ChartLegendProps,
	ChartLegend as SubpathChartLegend,
} from "@mizen-labs/ui/chart-legend";
import {
	type ChartTooltipItem,
	type ChartTooltipProps,
	ChartTooltip as SubpathChartTooltip,
} from "@mizen-labs/ui/chart-tooltip";
import { Citation as SubpathCitation } from "@mizen-labs/ui/citation";
import {
	type CodeBlockContentProps,
	type CodeBlockCopyProps,
	type CodeBlockHeaderProps,
	type CodeBlockProps,
	type CodeBlockTitleProps,
	CodeBlock as SubpathCodeBlock,
	CodeBlockContent as SubpathCodeBlockContent,
	CodeBlockCopy as SubpathCodeBlockCopy,
	CodeBlockHeader as SubpathCodeBlockHeader,
	CodeBlockTitle as SubpathCodeBlockTitle,
} from "@mizen-labs/ui/code-block";
import {
	Composer,
	ComposerActionGroup,
	ComposerActions,
	ComposerInput,
	type ComposerProps,
	ComposerSubmit,
	type ComposerValue,
	getComposerText,
} from "@mizen-labs/ui/composer";
import {
	DataTable as SubpathDataTable,
	DataTablePagination as SubpathDataTablePagination,
	type DataTableProps as SubpathDataTableProps,
} from "@mizen-labs/ui/data-table";
import {
	DateRangePicker,
	type DateRangePreset,
} from "@mizen-labs/ui/date-range-picker";
import {
	type DiagramProps,
	Diagram as OptionalDiagram,
} from "@mizen-labs/ui/diagram";
import {
	type DistributionProps,
	Distribution as SubpathDistribution,
} from "@mizen-labs/ui/distribution";
import type {
	HeatmapProps as SubpathHeatmapProps,
	HeatmapRow as SubpathHeatmapRow,
} from "@mizen-labs/ui/heatmap";
import { Heatmap as SubpathHeatmap } from "@mizen-labs/ui/heatmap";
import { Input, type InputProps } from "@mizen-labs/ui/input";
import { Lightbox as SubpathLightbox } from "@mizen-labs/ui/lightbox";
import { type LinkProps, Link as SubpathLink } from "@mizen-labs/ui/link";
import {
	List as SubpathList,
	ListActions as SubpathListActions,
	type ListActionsProps as SubpathListActionsProps,
	ListContent as SubpathListContent,
	type ListContentProps as SubpathListContentProps,
	ListItem as SubpathListItem,
	type ListItemProps as SubpathListItemProps,
	type ListProps as SubpathListProps,
} from "@mizen-labs/ui/list";
import {
	type MarkdownProps,
	Markdown as SubpathMarkdown,
} from "@mizen-labs/ui/markdown";
import {
	type MeterProps,
	Meter as SubpathMeter,
	MeterIndicator as SubpathMeterIndicator,
	MeterLabel as SubpathMeterLabel,
	MeterTrack as SubpathMeterTrack,
	MeterValue as SubpathMeterValue,
} from "@mizen-labs/ui/meter";
import type { MetricTrendProps } from "@mizen-labs/ui/metric-trend";
import { MetricTrend as SubpathMetricTrend } from "@mizen-labs/ui/metric-trend";
import { OverflowList as SubpathOverflowList } from "@mizen-labs/ui/overflow-list";
import { palette } from "@mizen-labs/ui/palette.stylex";
import {
	type PartToWholeProps,
	PartToWhole as SubpathPartToWhole,
} from "@mizen-labs/ui/part-to-whole";
import type {
	ScatterChartPoint as SubpathScatterChartPoint,
	ScatterChartProps as SubpathScatterChartProps,
} from "@mizen-labs/ui/scatter-chart";
import { ScatterChart as SubpathScatterChart } from "@mizen-labs/ui/scatter-chart";
import {
	Select as SubpathSelect,
	SelectItem as SubpathSelectItem,
	SelectPopup as SubpathSelectPopup,
	type SelectProps as SubpathSelectProps,
	SelectTrigger as SubpathSelectTrigger,
	SelectValue as SubpathSelectValue,
} from "@mizen-labs/ui/select";
import { TableContainer as SubpathTableContainer } from "@mizen-labs/ui/table";
import {
	Thumbnail as SubpathThumbnail,
	type ThumbnailProps as SubpathThumbnailProps,
	type ThumbnailSize,
} from "@mizen-labs/ui/thumbnail";
import {
	TimeSeries as SubpathTimeSeries,
	type TimeSeriesProps,
} from "@mizen-labs/ui/time-series";
import {
	Timestamp as SubpathTimestamp,
	type TimestampFormat,
	type TimestampProps,
} from "@mizen-labs/ui/timestamp";
import { Tree as SubpathTree } from "@mizen-labs/ui/tree";
import {
	VisuallyHidden as SubpathVisuallyHidden,
	type VisuallyHiddenProps,
} from "@mizen-labs/ui/visually-hidden";
import { defineChart, lineY } from "@tanstack/charts";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip } from "@tanstack/charts/tooltip";
import {
	type ColumnDef,
	columnSizingFeature,
	columnVisibilityFeature,
	createPaginatedRowModel,
	createSortedRowModel,
	type ReactTable,
	rowPaginationFeature,
	rowSortingFeature,
	tableFeatures,
} from "@tanstack/react-table";

// Resolve public imports without the docs app's allowJs escape hatch.
export type PublicModules = [
	typeof import("@mizen-labs/ui"),
	typeof import("@mizen-labs/ui/colors.stylex"),
	typeof import("@mizen-labs/ui/conditions.stylex"),
	typeof import("@mizen-labs/ui/dimensions.stylex"),
	typeof import("@mizen-labs/ui/fonts.stylex"),
	typeof import("@mizen-labs/ui/palette.stylex"),
	typeof import("@mizen-labs/ui/interaction.stylex"),
	typeof import("@mizen-labs/ui/motion.stylex"),
	typeof import("@mizen-labs/ui/shape.stylex"),
	typeof import("@mizen-labs/ui/spacing.stylex"),
	typeof import("@mizen-labs/ui/shadows.stylex"),
	typeof import("@mizen-labs/ui/typography.stylex"),
	typeof import("@mizen-labs/ui/typography.styles"),
	typeof import("@mizen-labs/ui/application-structure.stylex"),
	typeof import("@mizen-labs/ui/accordion"),
	typeof import("@mizen-labs/ui/attachment"),
	typeof import("@mizen-labs/ui/alert"),
	typeof import("@mizen-labs/ui/alert-dialog"),
	typeof import("@mizen-labs/ui/avatar"),
	typeof import("@mizen-labs/ui/avatar-group"),
	typeof import("@mizen-labs/ui/badge"),
	typeof import("@mizen-labs/ui/breadcrumb"),
	typeof import("@mizen-labs/ui/button"),
	typeof import("@mizen-labs/ui/button-group"),
	typeof import("@mizen-labs/ui/calendar"),
	typeof import("@mizen-labs/ui/card"),
	typeof import("@mizen-labs/ui/chart-frame"),
	typeof import("@mizen-labs/ui/category-comparison"),
	typeof import("@mizen-labs/ui/distribution"),
	typeof import("@mizen-labs/ui/heatmap"),
	typeof import("@mizen-labs/ui/part-to-whole"),
	typeof import("@mizen-labs/ui/scatter-chart"),
	typeof import("@mizen-labs/ui/chart-legend"),
	typeof import("@mizen-labs/ui/chart-tooltip"),
	typeof import("@mizen-labs/ui/metric-trend"),
	typeof import("@mizen-labs/ui/checkbox"),
	typeof import("@mizen-labs/ui/checkbox-card"),
	typeof import("@mizen-labs/ui/checkbox-group"),
	typeof import("@mizen-labs/ui/code"),
	typeof import("@mizen-labs/ui/code-block"),
	typeof import("@mizen-labs/ui/collapsible"),
	typeof import("@mizen-labs/ui/combobox"),
	typeof import("@mizen-labs/ui/command"),
	typeof import("@mizen-labs/ui/context-menu"),
	typeof import("@mizen-labs/ui/date-picker"),
	typeof import("@mizen-labs/ui/date-range-picker"),
	typeof import("@mizen-labs/ui/date-time-input"),
	typeof import("@mizen-labs/ui/dialog"),
	typeof import("@mizen-labs/ui/drawer"),
	typeof import("@mizen-labs/ui/empty"),
	typeof import("@mizen-labs/ui/error-state"),
	typeof import("@mizen-labs/ui/field"),
	typeof import("@mizen-labs/ui/fieldset"),
	typeof import("@mizen-labs/ui/file-upload"),
	typeof import("@mizen-labs/ui/form"),
	typeof import("@mizen-labs/ui/frame"),
	typeof import("@mizen-labs/ui/grid"),
	typeof import("@mizen-labs/ui/group"),
	typeof import("@mizen-labs/ui/heading"),
	typeof import("@mizen-labs/ui/input"),
	typeof import("@mizen-labs/ui/input-group"),
	typeof import("@mizen-labs/ui/inline"),
	typeof import("@mizen-labs/ui/kbd"),
	typeof import("@mizen-labs/ui/label"),
	typeof import("@mizen-labs/ui/link"),
	typeof import("@mizen-labs/ui/list"),
	typeof import("@mizen-labs/ui/markdown"),
	typeof import("@mizen-labs/ui/menu"),
	typeof import("@mizen-labs/ui/menubar"),
	typeof import("@mizen-labs/ui/meter"),
	typeof import("@mizen-labs/ui/metric"),
	typeof import("@mizen-labs/ui/navigation-menu"),
	typeof import("@mizen-labs/ui/number-field"),
	typeof import("@mizen-labs/ui/otp-field"),
	typeof import("@mizen-labs/ui/pagination"),
	typeof import("@mizen-labs/ui/popover"),
	typeof import("@mizen-labs/ui/preview-card"),
	typeof import("@mizen-labs/ui/progress"),
	typeof import("@mizen-labs/ui/property-list"),
	typeof import("@mizen-labs/ui/radio"),
	typeof import("@mizen-labs/ui/radio-card"),
	typeof import("@mizen-labs/ui/radio-group"),
	typeof import("@mizen-labs/ui/scroll-area"),
	typeof import("@mizen-labs/ui/section"),
	typeof import("@mizen-labs/ui/separator"),
	typeof import("@mizen-labs/ui/sheet"),
	typeof import("@mizen-labs/ui/skeleton"),
	typeof import("@mizen-labs/ui/slider"),
	typeof import("@mizen-labs/ui/spacer"),
	typeof import("@mizen-labs/ui/spinner"),
	typeof import("@mizen-labs/ui/stack"),
	typeof import("@mizen-labs/ui/status-dot"),
	typeof import("@mizen-labs/ui/stepper"),
	typeof import("@mizen-labs/ui/table"),
	typeof import("@mizen-labs/ui/data-table"),
	typeof import("@mizen-labs/ui/text"),
	typeof import("@mizen-labs/ui/textarea"),
	typeof import("@mizen-labs/ui/thumbnail"),
	typeof import("@mizen-labs/ui/switch"),
	typeof import("@mizen-labs/ui/select"),
	typeof import("@mizen-labs/ui/segmented-control"),
	typeof import("@mizen-labs/ui/toggle"),
	typeof import("@mizen-labs/ui/toggle-group"),
	typeof import("@mizen-labs/ui/tabs"),
	typeof import("@mizen-labs/ui/theme"),
	typeof import("@mizen-labs/ui/time-input"),
	typeof import("@mizen-labs/ui/timestamp"),
	typeof import("@mizen-labs/ui/time-series"),
	typeof import("@mizen-labs/ui/toast"),
	typeof import("@mizen-labs/ui/visually-hidden"),
	typeof import("@mizen-labs/ui/tooltip"),
	typeof import("@mizen-labs/ui/toolbar"),
];

const buttonProps: ButtonProps = { "aria-label": "Add", size: "icon-sm" };
const inputProps: InputProps = { "aria-label": "Name", size: "sm" };

export const controls = (
	<>
		<Button {...buttonProps} />
		<Input {...inputProps} />
	</>
);

// @ts-expect-error An untyped public export would silently accept this size.
export const invalidButton = <Button size="enormous" />;
// @ts-expect-error An untyped public export would silently accept this size.
export const invalidInput = <Input size="enormous" />;

const preset: DateRangePreset = {
	label: "Release week",
	value: { from: new Date(2026, 9, 5), to: new Date(2026, 9, 11) },
};

// Clearing a controlled picker remains a controlled value.
export const clearedRange = (
	<DateRangePicker presets={[preset]} value={undefined} />
);
export const incompletePreset: DateRangePreset = {
	label: "Pending",
	// @ts-expect-error A preset must have both endpoints, unlike a pending calendar selection.
	value: { from: new Date() },
};
// @ts-expect-error Public date values must not silently accept serialized strings.
export const invalidRange = <DateRangePicker value="2026-10-05" />;

export const timeInput = (
	<TimeInput max="18:00" min="08:00" step={900} value="09:30" />
);
export const dateTimeInput = <DateTimeInput defaultValue="2026-10-07T09:30" />;
// @ts-expect-error Time values must stay strings.
export const invalidTimeNumber = <TimeInput value={930} />;
// @ts-expect-error Local date-times are not Date objects.
export const invalidDateTimeDate = <DateTimeInput value={new Date()} />;
// @ts-expect-error Native type is owned by the component.
export const invalidTimeType = <TimeInput type="text" />;
// @ts-expect-error Polymorphism cannot replace native date-time semantics.
export const invalidDateTimeRender = <DateTimeInput render={<textarea />} />;

export const connectedButtons = (
	<ButtonGroup orientation="vertical">
		<Button>Save</Button>
	</ButtonGroup>
);
export const actionToolbar = (
	<Toolbar aria-label="Editor">
		<ToolbarButton aria-label="Add" size="icon">
			+
		</ToolbarButton>
	</Toolbar>
);
export const viewSegments = (
	<SegmentedControl defaultValue={["list"]}>
		<SegmentedControlItem value="list">List</SegmentedControlItem>
	</SegmentedControl>
);
// @ts-expect-error Toolbar icon buttons require an accessible name.
export const unnamedToolbarIcon = <ToolbarButton size="icon">+</ToolbarButton>;
// @ts-expect-error Segmented controls own single-selection semantics.
export const multipleSegments = <SegmentedControl multiple />;
// @ts-expect-error Segmented controls use the existing array value contract.
export const scalarSegment = <SegmentedControl value="list" />;
// @ts-expect-error Button Group does not expose arbitrary styles.
export const styledButtonGroup = <ButtonGroup style={{ gap: 20 }} />;

export const navigationControls = (
	<>
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/">Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbItem>
					<BreadcrumbPage>Project</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationLink active href="?page=1">
						1
					</PaginationLink>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
		<Stepper aria-label="Project setup">
			<StepperItem status="current">
				<StepperIndicator>1</StepperIndicator>
				<StepperTitle>Details</StepperTitle>
			</StepperItem>
		</Stepper>
	</>
);

export const siteNavigationControls = (
	<>
		<NavigationMenu aria-label="Site sections">
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Components</NavigationMenuTrigger>
					<NavigationMenuContent>
						<NavigationMenuLink href="/components/button">
							Button
						</NavigationMenuLink>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
			<NavigationMenuPopup />
		</NavigationMenu>
	</>
);

export const publicTable = (
	<TableContainer aria-label="Monthly operating budget" scroll="both">
		<Table>
			<TableCaption>Planned costs in rubles.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead sticky>Cost category</TableHead>
					<TableHead numeric>January</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableHead scope="row" sticky>
						01 Salaries
					</TableHead>
					<TableCell numeric>860,000 ₽</TableCell>
				</TableRow>
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableHead scope="row" sticky>
						Total planned
					</TableHead>
					<TableCell numeric>860,000 ₽</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	</TableContainer>
);
export const publicTableSubpath = (
	<SubpathTableContainer aria-label="Monthly operating budget" />
);
// @ts-expect-error TableContainer requires an accessible name.
export const unnamedTable = <TableContainer />;
// @ts-expect-error TableHead only accepts native table scopes.
export const invalidTableHeadScope = <TableHead scope="grid" />;
export const styledBreadcrumb = (
	// @ts-expect-error Breadcrumbs own their visual presentation.
	<BreadcrumbList className="custom-trail" />
);
// @ts-expect-error Page links own their visual presentation.
export const styledPagination = <PaginationLink style={{ color: "red" }} />;
// @ts-expect-error Progress status uses the finite workflow vocabulary.
export const invalidStepStatus = <StepperItem status="selected" />;
// @ts-expect-error Stepper must have an accessible workflow name.
export const unnamedStepper = <Stepper />;
// @ts-expect-error NavigationMenu owns its host styling.
export const styledNavigationMenu = <NavigationMenu style={{ color: "red" }} />;
export const styledNavigationTrigger = (
	// @ts-expect-error NavigationMenuTrigger owns its button appearance.
	<NavigationMenuTrigger style={{ color: "red" }}>
		Components
	</NavigationMenuTrigger>
);
export const styledNavigationLink = (
	// @ts-expect-error NavigationMenuLink owns its link appearance.
	<NavigationMenuLink href="/components" style={{ color: "red" }} />
);

const rootListProps: ListProps = { "aria-label": "Consumer resources" };
const subpathListProps: SubpathListProps = rootListProps;
const rootListItemProps: ListItemProps = { id: "resource" };
const subpathListItemProps: SubpathListItemProps = rootListItemProps;
const rootListContentProps: ListContentProps = { id: "resource-content" };
const subpathListContentProps: SubpathListContentProps = rootListContentProps;
const rootListActionsProps: ListActionsProps = { id: "resource-actions" };
const subpathListActionsProps: SubpathListActionsProps = rootListActionsProps;

export const publicList = (
	<List {...rootListProps}>
		<ListItem {...rootListItemProps}>
			<ListContent {...rootListContentProps}>Budget table</ListContent>
			<ListActions {...rootListActionsProps}>
				<Button>Open</Button>
			</ListActions>
		</ListItem>
	</List>
);
export const publicListSubpath = (
	<SubpathList {...subpathListProps}>
		<SubpathListItem {...subpathListItemProps}>
			<SubpathListContent {...subpathListContentProps}>
				Budget table
			</SubpathListContent>
			<SubpathListActions {...subpathListActionsProps}>
				<Button>Open</Button>
			</SubpathListActions>
		</SubpathListItem>
	</SubpathList>
);
export const styledList = (
	// @ts-expect-error List owns its host styling.
	<List {...rootListProps} style={{ color: "red" }} />
);
export const overriddenListRole = (
	// @ts-expect-error List owns native list semantics.
	<List {...rootListProps} role="menu" />
);
export const styledListSubpath = (
	// @ts-expect-error List owns its host styling through the subpath.
	<SubpathList {...subpathListProps} className="custom" />
);
export const overriddenListItemRole = (
	// @ts-expect-error ListItem owns native list-item semantics.
	<ListItem role="button" />
);

const consumerTableFeatures = tableFeatures({
	columnSizingFeature,
	columnVisibilityFeature,
	paginatedRowModel: createPaginatedRowModel(),
	rowPaginationFeature,
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
});

interface ConsumerRow {
	account: string;
}

const _consumerColumns: ColumnDef<typeof consumerTableFeatures, ConsumerRow>[] =
	[
		{
			accessorKey: "account",
			header: "Account",
			meta: { mizen: { rowHeader: true, sticky: true } },
		},
	];
declare const consumerTable: ReactTable<
	typeof consumerTableFeatures,
	ConsumerRow
>;
const rootDataTableProps: DataTableProps<
	typeof consumerTableFeatures,
	ConsumerRow
> = {
	caption: "Public budget table",
	table: consumerTable,
};
const subpathDataTableProps: SubpathDataTableProps<
	typeof consumerTableFeatures,
	ConsumerRow
> = rootDataTableProps;

export const rootDataTable = <DataTable {...rootDataTableProps} />;
export const subpathDataTable = (
	<SubpathDataTable {...subpathDataTableProps} virtualized />
);
export const rootDataTablePagination = (
	<DataTablePagination table={consumerTable} />
);
export const subpathDataTablePagination = (
	<SubpathDataTablePagination table={consumerTable} />
);
// @ts-expect-error DataTable requires an accessible caption.
export const unnamedDataTable = <DataTable table={consumerTable} />;
export const styledDataTable = (
	// @ts-expect-error DataTable owns its host styling.
	<DataTable {...rootDataTableProps} className="custom" />
);
export const styledDataTableInline = (
	// @ts-expect-error DataTable owns its host styling.
	<DataTable {...rootDataTableProps} style={{ color: "red" }} />
);

const ignoreTreeSelectionChange = (_id: string | null) => undefined;

export const publicDataSystems = (
	<>
		<ActivityFeed aria-label="Activity">
			<ActivityFeedItem>
				<ActivityFeedContent>Published</ActivityFeedContent>
				<ActivityFeedTime dateTime="2026-10-07">October 7</ActivityFeedTime>
			</ActivityFeedItem>
		</ActivityFeed>
		<OverflowList aria-label="People">
			<ListItem>Sam</ListItem>
			<ListItem>Maya</ListItem>
		</OverflowList>
		<Tree
			aria-label="Resources"
			items={[{ id: "first", label: "First" }]}
			onSelectedItemIdChange={ignoreTreeSelectionChange}
			selectedItemId={null}
		/>
	</>
);
export const publicDataSubpaths = [
	SubpathActivityFeed,
	SubpathOverflowList,
	SubpathTree,
];
export const selectedTreeSubpath = (
	<SubpathTree
		aria-label="Saved resources"
		defaultSelectedItemId={null}
		items={[{ id: "saved", label: "Saved" }]}
	/>
);
export const styledTree = (
	// @ts-expect-error Tree owns its styles.
	<Tree aria-label="Resources" items={[]} style={{ color: "red" }} />
);
export const unnamedTree = (
	// @ts-expect-error Tree requires an accessible name.
	<Tree items={[]} />
);
export const invalidActivityTime = (
	// @ts-expect-error Time requires a machine-readable timestamp.
	<ActivityFeedTime>Today</ActivityFeedTime>
);
export const unnamedOverflowList = (
	// @ts-expect-error Overflow lists require accessible names.
	<OverflowList>
		<ListItem>Sam</ListItem>
	</OverflowList>
);

export const publicMediaContent = (
	<>
		<AspectRatio ratio={4 / 3}>Media</AspectRatio>
		<Blockquote>
			<BlockquoteContent cite="https://example.com/source">
				Quoted text
			</BlockquoteContent>
			<BlockquoteAttribution>
				<Citation>Source title</Citation>
			</BlockquoteAttribution>
		</Blockquote>
		<Carousel aria-label="Studies">
			<CarouselContent>
				<CarouselItem aria-label="Study">Study</CarouselItem>
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
		<Lightbox>
			<LightboxTrigger>Open image</LightboxTrigger>
			<LightboxPopup>
				<LightboxTitle>Study</LightboxTitle>
				<LightboxDescription>A study.</LightboxDescription>
				<LightboxImage alt="Study" src="/study.svg" />
			</LightboxPopup>
		</Lightbox>
	</>
);
export const publicMediaSubpaths = [
	SubpathAspectRatio,
	SubpathBlockquote,
	SubpathCitation,
	SubpathCarousel,
	SubpathLightbox,
];

const codeBlockProps: CodeBlockProps = { children: "Code sample" };
const codeBlockHeaderProps: CodeBlockHeaderProps = {
	children: "workspace.tsx",
};
const codeBlockTitleProps: CodeBlockTitleProps = { children: "workspace.tsx" };
const codeBlockContentProps: CodeBlockContentProps = {
	"aria-label": "Workspace settings source",
	children: "const ready = true;",
};
const codeBlockCopyProps: CodeBlockCopyProps = { code: "const ready = true;" };
const rootCodeBlockProps: RootCodeBlockProps = codeBlockProps;
const rootCodeBlockHeaderProps: RootCodeBlockHeaderProps = codeBlockHeaderProps;
const rootCodeBlockTitleProps: RootCodeBlockTitleProps = codeBlockTitleProps;
const rootCodeBlockContentProps: RootCodeBlockContentProps =
	codeBlockContentProps;
const rootCodeBlockCopyProps: RootCodeBlockCopyProps = codeBlockCopyProps;

export const publicCodeBlock = (
	<CodeBlock {...rootCodeBlockProps}>
		<CodeBlockHeader {...rootCodeBlockHeaderProps}>
			<CodeBlockTitle {...rootCodeBlockTitleProps}>
				workspace.tsx
			</CodeBlockTitle>
			<CodeBlockCopy {...rootCodeBlockCopyProps} />
		</CodeBlockHeader>
		<CodeBlockContent {...rootCodeBlockContentProps}>
			const ready = true;
		</CodeBlockContent>
	</CodeBlock>
);
export const publicCodeBlockSubpath = (
	<SubpathCodeBlock>
		<SubpathCodeBlockHeader>
			<SubpathCodeBlockTitle>workspace.tsx</SubpathCodeBlockTitle>
			<SubpathCodeBlockCopy code="const ready = true;" />
		</SubpathCodeBlockHeader>
		<SubpathCodeBlockContent aria-label="Workspace settings source">
			const ready = true;
		</SubpathCodeBlockContent>
	</SubpathCodeBlock>
);
export const unnamedCodeBlockContent = (
	// @ts-expect-error CodeBlockContent requires an accessible name for the scroll region.
	<CodeBlockContent>const ready = true;</CodeBlockContent>
);
export const styledCodeBlock = (
	// @ts-expect-error CodeBlock owns its host styling.
	<CodeBlock className="custom">Source</CodeBlock>
);
export const publicCodeBlockSubpaths = [
	SubpathCodeBlock,
	SubpathCodeBlockContent,
	SubpathCodeBlockCopy,
	SubpathCodeBlockHeader,
	SubpathCodeBlockTitle,
];

const rootMarkdownProps: RootMarkdownProps = {
	children: "### Release notes",
	id: "public-release-notes",
};
const subpathMarkdownProps: MarkdownProps = rootMarkdownProps;
const rootThumbnailProps: RootThumbnailProps = {
	alt: "Lavender study",
	size: "lg",
	src: "/media/lavender-valensole.jpg",
};
const subpathThumbnailProps: SubpathThumbnailProps = rootThumbnailProps;
const rootTimestampProps: RootTimestampProps = {
	dateTime: "2026-10-07T09:00:00Z",
	format: "date-time",
	locale: "en-US",
	timeZone: "UTC",
};
const subpathTimestampProps: TimestampProps = rootTimestampProps;
const rootThumbnailSize: RootThumbnailSize = "lg";
const subpathThumbnailSize: ThumbnailSize = rootThumbnailSize;
const rootTimestampFormat: RootTimestampFormat = "date-time";
const subpathTimestampFormat: TimestampFormat = rootTimestampFormat;

export const publicRichContent = (
	<>
		<Markdown {...rootMarkdownProps} />
		<Thumbnail {...rootThumbnailProps} />
		<Timestamp {...rootTimestampProps} />
	</>
);
export const publicRichContentSubpaths = (
	<>
		<SubpathMarkdown {...subpathMarkdownProps} />
		<SubpathThumbnail {...subpathThumbnailProps} size={subpathThumbnailSize} />
		<SubpathTimestamp
			{...subpathTimestampProps}
			format={subpathTimestampFormat}
		/>
	</>
);
export const renderedMarkdown = (
	<Markdown>
		<markdownComponents.p>Rendered by any parser.</markdownComponents.p>
	</Markdown>
);
export const invalidThumbnailSize = (
	// @ts-expect-error Thumbnail sizes use the finite system scale.
	<Thumbnail alt="Study" size="huge" src="/study.svg" />
);
export const invalidTimestampFormat = (
	// @ts-expect-error Timestamp formats use the finite date vocabulary.
	<Timestamp dateTime="2026-10-07T09:00:00Z" format="full" />
);
export const styledAspectRatio = (
	// @ts-expect-error AspectRatio owns its frame styling.
	<AspectRatio style={{ height: 20 }}>Media</AspectRatio>
);
export const styledCitation = (
	// @ts-expect-error Citation owns its text treatment.
	<Citation className="custom">Source</Citation>
);
export const styledBlockquote = (
	// @ts-expect-error Blockquote owns its geometry.
	<Blockquote style={{ margin: 20 }}>Quote</Blockquote>
);
export const unnamedCarousel = (
	// @ts-expect-error Carousel requires an accessible name.
	<Carousel>Slides</Carousel>
);
export const overriddenCarouselRole = (
	// @ts-expect-error Carousel owns its semantics.
	<Carousel aria-label="Studies" role="menu">
		Slides
	</Carousel>
);
export const missingLightboxAlt = (
	// @ts-expect-error Image alternatives are required.
	<LightboxImage src="/study.svg" />
);
export const overriddenLightboxSize = (
	// @ts-expect-error Lightbox owns the preview popup size.
	<LightboxPopup size="sm" />
);

const rootLinkProps: RootLinkProps = {
	children: "Components",
	href: "/components",
};
const subpathLinkProps: LinkProps = rootLinkProps;
const rootMeterProps: RootMeterProps = { max: 100, value: 72 };
const subpathMeterProps: MeterProps = rootMeterProps;
const rootVisuallyHiddenProps: RootVisuallyHiddenProps = {
	children: "unread notifications",
};
const subpathVisuallyHiddenProps: VisuallyHiddenProps = rootVisuallyHiddenProps;

export const publicPrimitiveGaps = (
	<>
		<Link {...rootLinkProps} />
		<Meter {...rootMeterProps}>
			<MeterLabel>Workspace storage</MeterLabel>
			<MeterValue />
			<MeterTrack>
				<MeterIndicator />
			</MeterTrack>
		</Meter>
		<VisuallyHidden {...rootVisuallyHiddenProps} />
	</>
);
export const publicPrimitiveGapSubpaths = (
	<>
		<SubpathLink {...subpathLinkProps} />
		<SubpathMeter {...subpathMeterProps}>
			<SubpathMeterLabel>Workspace storage</SubpathMeterLabel>
			<SubpathMeterValue />
			<SubpathMeterTrack>
				<SubpathMeterIndicator />
			</SubpathMeterTrack>
		</SubpathMeter>
		<SubpathVisuallyHidden {...subpathVisuallyHiddenProps} />
	</>
);
// @ts-expect-error Native links require their destination.
export const missingLinkHref = <Link>Components</Link>;
export const styledLink = (
	// @ts-expect-error Link owns its visual treatment.
	<Link href="/components" style={{ color: "red" }}>
		Components
	</Link>
);
export const hiddenFromAssistiveTechnology: RootVisuallyHiddenProps = {
	// @ts-expect-error VisuallyHidden protects its content from aria-hidden.
	"aria-hidden": true,
	children: "unread",
};
// @ts-expect-error Meter requires a numeric value.
export const missingMeterValue = <Meter />;
export const overriddenMeterRole = (
	// @ts-expect-error Meter owns its measurement semantics.
	<Meter aria-label="Storage" role="progressbar" value={72} />
);

const consumerChartData = [
	{ month: "Jan", teams: 12 },
	{ month: "Feb", teams: 17 },
] as const;
const consumerChartDefinition = defineChart({
	marks: [lineY(consumerChartData, { points: true, x: "month", y: "teams" })],
	scales: {
		x: { scale: () => scalePoint<string>().padding(0.2) },
		y: { nice: true, scale: scaleLinear },
	},
	tooltip,
});
type ConsumerDatum = (typeof consumerChartData)[number];
const consumerRenderTooltip: NonNullable<
	RootChartFrameProps<ConsumerDatum, string, number>["renderTooltipBody"]
> = ({ points }) => {
	const [point] = points;
	return point ? (
		<ChartTooltip
			items={[
				{
					id: "teams",
					label: point.datum.month,
					tone: "series1",
					value: point.yValue,
				},
			]}
			label={point.xValue}
		/>
	) : null;
};
const consumerFocusChange: NonNullable<
	RootChartFrameProps<ConsumerDatum, string, number>["onFocusChange"]
> = (point) => {
	if (point) {
		return {
			month: point.xValue satisfies string,
			teams: point.yValue satisfies number,
		};
	}
};
const rootChartFrameProps: RootChartFrameProps<ConsumerDatum, string, number> =
	{
		"aria-label": "Monthly teams",
		definition: consumerChartDefinition,
		height: 300,
		initialWidth: 640,
		onFocusChange: consumerFocusChange,
		renderTooltipBody: consumerRenderTooltip,
	};
const subpathChartFrameProps: ChartFrameProps<ConsumerDatum, string, number> =
	rootChartFrameProps;
const rootChartLegendItems: RootChartLegendItem[] = [
	{ id: "teams", label: "Active teams", tone: "series1" },
];
const subpathChartLegendItems: ChartLegendItem[] = rootChartLegendItems;
const rootChartLegendProps: RootChartLegendProps = {
	"aria-label": "Team series",
	items: rootChartLegendItems,
};
const subpathChartLegendProps: ChartLegendProps = {
	...rootChartLegendProps,
	items: subpathChartLegendItems,
};
const rootChartTooltipItems: RootChartTooltipItem[] = [
	{ id: "teams", label: "Active teams", tone: "series1", value: 17 },
];
const subpathChartTooltipItems: ChartTooltipItem[] = rootChartTooltipItems;
const rootChartTooltipProps: RootChartTooltipProps = {
	items: rootChartTooltipItems,
	label: "Feb",
};
const subpathChartTooltipProps: ChartTooltipProps = {
	...rootChartTooltipProps,
	items: subpathChartTooltipItems,
};
const seriesTone: RootChartSeriesTone = "series1";

export const publicCharts = (
	<>
		<ChartFrame {...rootChartFrameProps} />
		<ChartLegend {...rootChartLegendProps} />
		<ChartTooltip {...rootChartTooltipProps} />
	</>
);
export const publicChartSubpaths = (
	<>
		<SubpathChartFrame {...subpathChartFrameProps} />
		<SubpathChartLegend {...subpathChartLegendProps} />
		<SubpathChartTooltip {...subpathChartTooltipProps} />
	</>
);
export const publicChartColors = chartColors[seriesTone];

const comparisonCategories: readonly RootCategoryComparisonDatum[] = [
	{ id: "north", label: "North", value: 12 },
	{ id: "south", label: "South", value: -4 },
	{ id: "flat", label: "Flat", value: 0 },
];
const formatComparisonValue: NonNullable<
	RootCategoryComparisonProps["formatValue"]
> = (value) => `${value satisfies number} units`;
const rootCategoryComparisonProps: RootCategoryComparisonProps = {
	"aria-label": "Consumer variance",
	categories: comparisonCategories,
	formatValue: formatComparisonValue,
	seriesLabel: "Variance",
};
const subpathCategoryComparisonProps: CategoryComparisonProps =
	rootCategoryComparisonProps;
export const publicCategoryComparison = (
	<CategoryComparison {...rootCategoryComparisonProps} />
);
export const publicCategoryComparisonSubpath = (
	<SubpathCategoryComparison {...subpathCategoryComparisonProps} />
);
export const styledCategoryComparison = (
	// @ts-expect-error CategoryComparison owns its chart host styling.
	<CategoryComparison {...rootCategoryComparisonProps} className="custom" />
);
export const overriddenCategoryComparisonRole = (
	// @ts-expect-error CategoryComparison owns its chart role.
	<CategoryComparison {...rootCategoryComparisonProps} role="img" />
);

const consumerDistributionValues = [0, 2, 5, 9, 10] as const;
const formatDistributionValue: NonNullable<
	RootDistributionProps["formatValue"]
> = (value) => `${value satisfies number} minutes`;
const rootDistributionProps: RootDistributionProps = {
	"aria-label": "Consumer response time distribution",
	binCount: 4,
	domain: [0, 10],
	formatValue: formatDistributionValue,
	seriesLabel: "Responses",
	values: consumerDistributionValues,
};
const subpathDistributionProps: DistributionProps = rootDistributionProps;
export const publicDistribution = <Distribution {...rootDistributionProps} />;
export const publicDistributionSubpath = (
	<SubpathDistribution {...subpathDistributionProps} />
);
export const styledDistribution = (
	// @ts-expect-error Distribution owns its chart host styling.
	<Distribution {...rootDistributionProps} className="custom" />
);
export const overriddenDistributionRole = (
	// @ts-expect-error Distribution owns its chart role.
	<Distribution {...rootDistributionProps} role="img" />
);

const consumerParts: readonly PartToWholePart[] = [
	{ id: "delivery", label: "Delivery", value: 72 },
	{ id: "reserve", label: "Reserve", value: 0 },
];
const rootPartToWholeProps: RootPartToWholeProps = {
	"aria-label": "Consumer project allocation",
	parts: consumerParts,
};
const subpathPartToWholeProps: PartToWholeProps = rootPartToWholeProps;
export const publicPartToWhole = <PartToWhole {...rootPartToWholeProps} />;
export const publicPartToWholeSubpath = (
	<SubpathPartToWhole {...subpathPartToWholeProps} />
);
export const styledPartToWhole = (
	// @ts-expect-error PartToWhole owns its chart host styling.
	<PartToWhole {...rootPartToWholeProps} className="custom" />
);
export const styledChartFrame = (
	// @ts-expect-error ChartFrame owns its sizing and host styling.
	<ChartFrame {...rootChartFrameProps} className="custom" />
);
export const competingChartSizes = (
	// @ts-expect-error Choose either fixed height or an aspect ratio.
	<ChartFrame
		aria-label="Monthly teams"
		aspectRatio={16 / 9}
		definition={consumerChartDefinition}
		height={300}
	/>
);
export const unnamedChartLegend = (
	// @ts-expect-error ChartLegend requires an accessible name.
	<ChartLegend items={rootChartLegendItems} />
);
export const styledChartLegend = (
	// @ts-expect-error ChartLegend owns its list styling.
	<ChartLegend aria-label="Team series" className="custom" items={[]} />
);
export const overriddenChartTooltipRole = (
	// @ts-expect-error ChartTooltip leaves tooltip roles to the chart host.
	<ChartTooltip items={rootChartTooltipItems} role="tooltip" />
);

const consumerTimeSeriesPoints: readonly TimeSeriesPoint[] = [
	{ time: Date.parse("2026-03-01T08:00:00Z"), value: 8 },
	{ time: Date.parse("2026-03-05T08:00:00Z"), value: null },
	{ time: Date.parse("2026-03-12T07:00:00Z"), value: 0 },
];
const formatConsumerTimeSeriesValue: NonNullable<
	RootTimeSeriesProps["formatValue"]
> = (value) => `${value satisfies number} sign-ins`;
const rootTimeSeriesProps: RootTimeSeriesProps = {
	"aria-label": "Consumer sign-ins",
	formatValue: formatConsumerTimeSeriesValue,
	points: consumerTimeSeriesPoints,
	seriesLabel: "Sign-ins",
	timeZone: "America/Los_Angeles",
};
const subpathTimeSeriesProps: TimeSeriesProps = rootTimeSeriesProps;
const rootMetricTrendProps: RootMetricTrendProps = {
	children: <TimeSeries {...rootTimeSeriesProps} presentation="sparkline" />,
	label: "Active projects",
	value: "48",
};
const subpathMetricTrendProps: MetricTrendProps = rootMetricTrendProps;

export const publicTimeSeries = (
	<>
		<TimeSeries {...rootTimeSeriesProps} />
		<MetricTrend {...rootMetricTrendProps} />
	</>
);
export const publicTimeSeriesSubpaths = (
	<>
		<SubpathTimeSeries {...subpathTimeSeriesProps} />
		<SubpathMetricTrend {...subpathMetricTrendProps} />
	</>
);
export const styledTimeSeries = (
	// @ts-expect-error TimeSeries owns its host styling.
	<TimeSeries {...rootTimeSeriesProps} className="custom" />
);
export const styledMetricTrend = (
	// @ts-expect-error MetricTrend owns its host styling.
	<MetricTrend {...rootMetricTrendProps} role="status" />
);

const heatmapRows: RootHeatmapRow[] = [{ label: "Monday", values: [4, null] }];
const subpathHeatmapRows: SubpathHeatmapRow[] = heatmapRows;
const rootHeatmapProps: RootHeatmapProps = {
	"aria-label": "Requests by hour",
	columns: ["09:00", "10:00"],
	rows: heatmapRows,
	valueLabel: "Requests",
};
const subpathHeatmapProps: SubpathHeatmapProps = {
	...rootHeatmapProps,
	rows: subpathHeatmapRows,
};
const scatterPoints: RootScatterChartPoint[] = [
	{ id: "team-a", label: "Team A", x: 18, y: 42 },
];
const subpathScatterPoints: SubpathScatterChartPoint[] = scatterPoints;
const scatterChartProps: RootScatterChartProps = {
	"aria-label": "Delivery time by team size",
	points: scatterPoints,
	xAxisLabel: "Team size",
	yAxisLabel: "Delivery time",
};
const subpathScatterChartProps: SubpathScatterChartProps = {
	...scatterChartProps,
	points: subpathScatterPoints,
};
const formAssociatedSelectProps: SubpathSelectProps<string> = {
	form: "workspace-form",
	name: "segment",
	value: "priority",
};
export const formAssociatedSelect = (
	<SubpathSelect {...formAssociatedSelectProps}>
		<SubpathSelectTrigger aria-label="Segment">
			<SubpathSelectValue />
		</SubpathSelectTrigger>
		<SubpathSelectPopup>
			<SubpathSelectItem value="priority">Priority accounts</SubpathSelectItem>
		</SubpathSelectPopup>
	</SubpathSelect>
);
export const applicationStructureBreakpoint: string =
	applicationStructure.wideShell;
export const paletteAccent: string = palette.rose500;
export const publicApplicationStructure = (
	<>
		<RootHeatmap {...rootHeatmapProps} />
		<SubpathHeatmap {...subpathHeatmapProps} />
		<RootScatterChart {...scatterChartProps} />
		<SubpathScatterChart {...subpathScatterChartProps} />
	</>
);

export const renderedFrameworkLink = (
	<SubpathLink render={<a href="/projects" />}>Projects</SubpathLink>
);
export const destinationlessLink = (
	// @ts-expect-error Native Link requires a destination or a framework render target.
	<SubpathLink>Missing destination</SubpathLink>
);

const structuredDraft: ComposerValue = [
	{ text: "Ask ", type: "text" },
	{
		data: "author-1",
		id: "maya",
		kind: "person",
		label: "Maya",
		trigger: "@",
		type: "mention",
	},
];
const composerProps: ComposerProps = {
	defaultValue: structuredDraft,
	layout: "adaptive",
	onSubmit: (draft) => {
		getComposerText(draft);
	},
	submitOnEnter: "desktop",
	triggers: [{ character: "@", items: [{ id: "maya", label: "Maya" }] }],
};
export const publicStructuredComposer = (
	<Composer {...composerProps}>
		<ComposerInput aria-label="Write a message" />
		<ComposerActions>
			<ComposerActionGroup align="end">
				<ComposerSubmit />
			</ComposerActionGroup>
		</ComposerActions>
	</Composer>
);
export const publicPlainComposer = (
	<form>
		<Composer defaultValue={structuredDraft} name="message" render={<div />}>
			<ComposerInput aria-label="Plain draft" render={<textarea />} />
		</Composer>
	</form>
);

const diagramProps: DiagramProps = {
	"aria-label": "Approval flow",
	source: "flowchart LR\n A --> B",
};
export const publicOptionalDiagram = <OptionalDiagram {...diagramProps} />;
export const closedOptionalDiagram = (
	// @ts-expect-error Diagram keeps the closed styling contract.
	<OptionalDiagram {...diagramProps} className="custom" />
);
