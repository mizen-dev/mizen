import type { ComponentType } from "react";
import {
	AttachmentExamples,
	MenubarExamples,
} from "../compositions/action-content-composition";
import { CategoryComparisonExamples } from "../compositions/category-comparison-composition";
import { ChartFrameExamples } from "../compositions/charts-composition";
import { CodeBlockExamples } from "../compositions/code-block-composition";
import {
	ButtonGroupExamples,
	SegmentedControlExamples,
	ToolbarExamples,
} from "../compositions/compound-actions-composition";
import {
	ActivityFeedExamples,
	OverflowListExamples,
	TreeExamples,
} from "../compositions/data-systems-composition";
import { DataTableExamples } from "../compositions/data-table-composition";
import { DistributionExamples } from "../compositions/distribution-composition";
import { HeatmapExamples } from "../compositions/heatmap-composition";
import { ListExamples } from "../compositions/list-composition";
import {
	AspectRatioExamples,
	BlockquoteExamples,
	CarouselExamples,
	CitationExamples,
	LightboxExamples,
} from "../compositions/media-content-composition";
import {
	BreadcrumbExamples,
	PaginationExamples,
	StepperExamples,
} from "../compositions/navigation-composition";
import { PartToWholeExamples } from "../compositions/part-to-whole-composition";
import {
	LinkExamples,
	MeterExamples,
	VisuallyHiddenExamples,
} from "../compositions/primitive-gap-composition";
import {
	MarkdownExamples,
	ThumbnailExamples,
	TimestampExamples,
} from "../compositions/rich-content-composition";
import { ScatterChartExamples } from "../compositions/scatter-chart-composition";
import { NavigationMenuExamples } from "../compositions/site-navigation-composition";
import { TableExamples } from "../compositions/table-composition";
import {
	DateTimeInputExamples,
	TimeInputExamples,
} from "../compositions/temporal-inputs-composition";
import {
	MetricTrendExamples,
	TimeSeriesExamples,
} from "../compositions/time-series-composition";
import { VisitorsBySource } from "../examples/area-chart";
import { VisitorsByDevice } from "../examples/bar-list";
import { ContributionsThisYear } from "../examples/calendar-heatmap";
import { ProjectPromptComposer } from "../examples/composer";
import { ApprovalWorkflow } from "../examples/diagram";
import { SignupPipeline } from "../examples/funnel";
import { DailyActivityRings } from "../examples/progress-rings";
import { VendorProfiles } from "../examples/radar-chart";
import { VisitorsByBrowser } from "../examples/radial-bars";
import { TrackedTime } from "../examples/sankey-chart";
import { SleepScore } from "../examples/score-gauge";
import { CategoryTokens } from "../examples/token";
import { AccordionSpecimen } from "./accordion-specimen";
import { AlertDialogSpecimen } from "./alert-dialog-specimen";
import { AlertSpecimen } from "./alert-specimen";
import { AvatarGroupSpecimen } from "./avatar-group-specimen";
import { AvatarSpecimen } from "./avatar-specimen";
import { BadgeSpecimen } from "./badge-specimen";
import { ButtonSpecimen } from "./button-specimen";
import { CalendarSpecimen } from "./calendar-specimen";
import { CardSpecimen } from "./card-specimen";
import { CheckboxGroupSpecimen } from "./checkbox-group-specimen";
import { CheckboxSpecimen } from "./checkbox-specimen";
import { CodeSpecimen } from "./code-specimen";
import { CollapsibleSpecimen } from "./collapsible-specimen";
import { ComboboxSpecimen } from "./combobox-specimen";
import { CommandSpecimen } from "./command-specimen";
import { ContextMenuSpecimen } from "./context-menu-specimen";
import { DatePickerSpecimen } from "./date-picker-specimen";
import { DateRangePickerSpecimen } from "./date-range-picker-specimen";
import { DialogSpecimen } from "./dialog-specimen";
import { DrawerSpecimen } from "./drawer-specimen";
import { EmptySpecimen } from "./empty-specimen";
import { ErrorStateSpecimen } from "./error-state-specimen";
import { FieldSpecimen } from "./field-specimen";
import { FieldsetSpecimen } from "./fieldset-specimen";
import { FileUploadSpecimen } from "./file-upload-specimen";
import { FormSpecimen } from "./form-specimen";
import { FrameSpecimen } from "./frame-specimen";
import { GridSpecimen } from "./grid-specimen";
import { GroupSpecimen } from "./group-specimen";
import { HeadingSpecimen } from "./heading-specimen";
import { InlineSpecimen } from "./inline-specimen";
import { InputGroupSpecimen } from "./input-group-specimen";
import { InputSpecimen } from "./input-specimen";
import { KbdSpecimen } from "./kbd-specimen";
import { LabelSpecimen } from "./label-specimen";
import { MenuSpecimen } from "./menu-specimen";
import { MetricSpecimen } from "./metric-specimen";
import { NumberFieldSpecimen } from "./number-field-specimen";
import { OtpFieldSpecimen } from "./otp-field-specimen";
import { PageSpecimen } from "./page-specimen";
import { PopoverSpecimen } from "./popover-specimen";
import { PreviewCardSpecimen } from "./preview-card-specimen";
import { ProgressSpecimen } from "./progress-specimen";
import { PropertyListSpecimen } from "./property-list-specimen";
import { RadioGroupSpecimen } from "./radio-group-specimen";
import { ScrollAreaSpecimen } from "./scroll-area-specimen";
import { SectionSpecimen } from "./section-specimen";
import { SelectSpecimen } from "./select-specimen";
import { SeparatorSpecimen } from "./separator-specimen";
import { SheetSpecimen } from "./sheet-specimen";
import { SkeletonSpecimen } from "./skeleton-specimen";
import { SliderSpecimen } from "./slider-specimen";
import { SpacerSpecimen } from "./spacer-specimen";
import { SpinnerSpecimen } from "./spinner-specimen";
import { StackSpecimen } from "./stack-specimen";
import { StatusDotSpecimen } from "./status-dot-specimen";
import { SwitchSpecimen } from "./switch-specimen";
import { TabsSpecimen } from "./tabs-specimen";
import { TextSpecimen } from "./text-specimen";
import { TextareaSpecimen } from "./textarea-specimen";
import { ToastSpecimen } from "./toast-specimen";
import { ToggleGroupSpecimen } from "./toggle-group-specimen";
import { ToggleSpecimen } from "./toggle-specimen";
import { TooltipSpecimen } from "./tooltip-specimen";

export const specimenRegistry: Record<string, ComponentType> = {
	accordion: AccordionSpecimen,
	"activity-feed": ActivityFeedExamples,
	alert: AlertSpecimen,
	"alert-dialog": AlertDialogSpecimen,
	"area-chart": VisitorsBySource,
	"aspect-ratio": AspectRatioExamples,
	attachment: AttachmentExamples,
	avatar: AvatarSpecimen,
	"avatar-group": AvatarGroupSpecimen,
	badge: BadgeSpecimen,
	"bar-list": VisitorsByDevice,
	blockquote: BlockquoteExamples,
	breadcrumb: BreadcrumbExamples,
	button: ButtonSpecimen,
	"button-group": ButtonGroupExamples,
	calendar: CalendarSpecimen,
	"calendar-heatmap": ContributionsThisYear,
	card: CardSpecimen,
	carousel: CarouselExamples,
	"category-comparison": CategoryComparisonExamples,
	"chart-frame": ChartFrameExamples,
	"chart-legend": ChartFrameExamples,
	"chart-tooltip": ChartFrameExamples,
	checkbox: CheckboxSpecimen,
	"checkbox-group": CheckboxGroupSpecimen,
	citation: CitationExamples,
	code: CodeSpecimen,
	"code-block": CodeBlockExamples,
	collapsible: CollapsibleSpecimen,
	combobox: ComboboxSpecimen,
	command: CommandSpecimen,
	composer: ProjectPromptComposer,
	"context-menu": ContextMenuSpecimen,
	"data-table": DataTableExamples,
	"date-picker": DatePickerSpecimen,
	"date-range-picker": DateRangePickerSpecimen,
	"date-time-input": DateTimeInputExamples,
	diagram: ApprovalWorkflow,
	dialog: DialogSpecimen,
	distribution: DistributionExamples,
	drawer: DrawerSpecimen,
	empty: EmptySpecimen,
	"error-state": ErrorStateSpecimen,
	field: FieldSpecimen,
	fieldset: FieldsetSpecimen,
	"file-upload": FileUploadSpecimen,
	form: FormSpecimen,
	frame: FrameSpecimen,
	funnel: SignupPipeline,
	grid: GridSpecimen,
	group: GroupSpecimen,
	heading: HeadingSpecimen,
	heatmap: HeatmapExamples,
	inline: InlineSpecimen,
	input: InputSpecimen,
	"input-group": InputGroupSpecimen,
	kbd: KbdSpecimen,
	label: LabelSpecimen,
	lightbox: LightboxExamples,
	link: LinkExamples,
	list: ListExamples,
	markdown: MarkdownExamples,
	menu: MenuSpecimen,
	menubar: MenubarExamples,
	meter: MeterExamples,
	metric: MetricSpecimen,
	"metric-trend": MetricTrendExamples,
	"navigation-menu": NavigationMenuExamples,
	"number-field": NumberFieldSpecimen,
	"otp-field": OtpFieldSpecimen,
	"overflow-list": OverflowListExamples,
	page: PageSpecimen,
	pagination: PaginationExamples,
	"part-to-whole": PartToWholeExamples,
	popover: PopoverSpecimen,
	"preview-card": PreviewCardSpecimen,
	progress: ProgressSpecimen,
	"progress-rings": DailyActivityRings,
	"property-list": PropertyListSpecimen,
	"radar-chart": VendorProfiles,
	"radial-bars": VisitorsByBrowser,
	"radio-group": RadioGroupSpecimen,
	"sankey-chart": TrackedTime,
	"scatter-chart": ScatterChartExamples,
	"score-gauge": SleepScore,
	"scroll-area": ScrollAreaSpecimen,
	section: SectionSpecimen,
	"segmented-control": SegmentedControlExamples,
	select: SelectSpecimen,
	separator: SeparatorSpecimen,
	sheet: SheetSpecimen,
	skeleton: SkeletonSpecimen,
	slider: SliderSpecimen,
	spacer: SpacerSpecimen,
	spinner: SpinnerSpecimen,
	stack: StackSpecimen,
	"status-dot": StatusDotSpecimen,
	stepper: StepperExamples,
	switch: SwitchSpecimen,
	table: TableExamples,
	tabs: TabsSpecimen,
	text: TextSpecimen,
	textarea: TextareaSpecimen,
	thumbnail: ThumbnailExamples,
	"time-input": TimeInputExamples,
	"time-series": TimeSeriesExamples,
	timestamp: TimestampExamples,
	toast: ToastSpecimen,
	toggle: ToggleSpecimen,
	"toggle-group": ToggleGroupSpecimen,
	token: CategoryTokens,
	toolbar: ToolbarExamples,
	tooltip: TooltipSpecimen,
	tree: TreeExamples,
	"visually-hidden": VisuallyHiddenExamples,
};

export function getSpecimen(slug: string): ComponentType | undefined {
	return specimenRegistry[slug];
}
