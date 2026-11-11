import type { Guide } from "./guides";

export const layoutGuide: Guide = {
	description:
		"Lay out every screen with Page, Section, Grid, Stack, and Inline. The application writes no layout CSS.",
	sections: [
		{
			code: {
				title: "tsx",
				value: `import { Button } from "@mizen-labs/ui/button";
import { Grid } from "@mizen-labs/ui/grid";
import { MetricTrend } from "@mizen-labs/ui/metric-trend";
import {
  Page,
  PageAction,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@mizen-labs/ui/page";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@mizen-labs/ui/section";

export function Overview() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>Overview</PageTitle>
        <PageDescription>How the workspace is doing.</PageDescription>
        <PageAction>
          <Button variant="brand">New report</Button>
        </PageAction>
      </PageHeader>
      <Section aria-labelledby="overview-week">
        <SectionHeader>
          <SectionTitle id="overview-week">This week</SectionTitle>
          <SectionDescription>Compared with last week.</SectionDescription>
        </SectionHeader>
        <Grid columns="4" gap="4">
          <MetricTrend label="Revenue" value="$48,200" />
          <MetricTrend label="Orders" value="1,204" />
          <MetricTrend label="Customers" value="3,140" />
          <MetricTrend label="Refunds" value="23" />
        </Grid>
      </Section>
    </Page>
  );
}`,
			},
			id: "anatomy",
			links: [
				{ href: "/docs/components/page", label: "Page and the screen recipes" },
				{ href: "/docs/components/section", label: "Section" },
			],
			paragraphs: [
				"Every screen has the same anatomy: one Page, a PageHeader with the title and the main action, then Sections. A Section groups one topic under a SectionTitle.",
				"Page owns the inset around the content and the 32px between sections. The application shell around it adds no padding. Beside a sidebar or under a top bar, Page takes the space that is left.",
				"Start from the closest recipe on the Page page: dashboard, record list, record detail, or settings form. Then change its content.",
			],
			title: "One anatomy for every screen",
		},
		{
			id: "arrange",
			links: [
				{ href: "/docs/components/stack", label: "Stack" },
				{ href: "/docs/components/inline", label: "Inline" },
				{ href: "/docs/components/grid", label: "Grid" },
			],
			paragraphs: [
				"Choose the arrangement by what the content is. Blocks that follow each other go in a Stack. A few items on one line, such as buttons or a count beside its actions, go in an Inline. Peer cards or metrics go in a Grid.",
				'Use Grid columns "2", "3", or "4" for a known number of peers, "auto" for many cards of one kind, and "2:1" or "1:2" for a main area beside a narrower one.',
				'A form or a settings screen uses Page width "narrow", with Fieldset, Field, and Stack gap "4". Records go in a Table or DataTable inside a Section; put the search field in SectionAction.',
			],
			title: "Choose the arrangement by the content",
		},
		{
			id: "width",
			links: [
				{
					href: "/docs/examples/PageDashboardExample1",
					label: "The dashboard recipe at full width",
				},
			],
			paragraphs: [
				"The layout follows the space it has, not the window. A Grid steps its columns by its own width, so the same code works on a wide screen, beside a sidebar, and inside a narrow panel. Write no media queries or container queries.",
				'Columns are sized for cards. Two columns need 30rem, three columns and the ratios need 45rem, and four need 60rem. Below that they stack; "4" steps to two columns before it stacks.',
				"PageHeader and SectionHeader follow the same rule. The action sits beside the title when the header is at least 30rem wide, and under the text when it is narrower.",
				"A Grid takes the width of its parent. Inside a parent that takes its width from its content, such as a centered item, it is one 16rem column. Give such a parent a width, or use Inline for small items.",
			],
			title: "Width comes from the container",
		},
		{
			id: "spacing",
			links: [{ href: "/docs/foundations", label: "Foundations" }],
			paragraphs: [
				'Set space only with gap props. A step is 4px: "1" is 4px and "4" is 16px. Use "2" inside a group, such as a row of buttons. Use "4" between fields or cards. Use "8" between sections that sit side by side.',
				"Page puts 32px between sections, and Section puts 16px between its header and its content. Do not add margins, paddings, or spacer elements to adjust them.",
			],
			title: "Spacing is a gap, never a margin",
		},
		{
			id: "surfaces",
			links: [
				{ href: "/docs/components/card", label: "Card" },
				{ href: "/docs/composition", label: "Composition" },
			],
			paragraphs: [
				"A Section has no surface. Titles and space separate topics. Use a Card only for an item that stands alone, such as one metric, one record, or one plan.",
				"Do not put a card in a card, and do not wrap every section in a card. Use one brand button per screen, for the main action. Other actions are outline or ghost.",
			],
			title: "Sections group, cards stand alone",
		},
		{
			code: {
				title: "css",
				value: `/* Geometry only the app knows: how tall the map is. */
.store-map {
  block-size: calc(var(--mizen-space-16) * 5);
}`,
			},
			id: "limits",
			links: [{ href: "/docs/styling", label: "Styling" }],
			paragraphs: [
				"Application code has no display grid or flex, no widths, margins, or paddings for layout, and no stylesheet per page. Type sizes, colors, shadows, and radii come from components.",
				"CSS on an application-owned element is for geometry only the app knows, such as the height of a chart or a map. Use the token variables there, never literal values.",
				"If the layout layer cannot express what a screen needs, report the missing capability. Do not work around it with CSS.",
			],
			title: "What the application does not write",
		},
	],
	slug: "layout",
	title: "Layout",
};
