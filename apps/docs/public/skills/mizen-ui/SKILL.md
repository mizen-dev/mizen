---
name: mizen-ui
description: Build React interfaces with an existing Mizen UI installation. Use published components, the layout layer, and screen recipes without inventing imports, styling props, layout CSS, or runtime behavior.
---

# Build with Mizen UI

Use the application's configured Mizen docs origin. Resolve the paths below
against that origin. Mizen is published on npm as `@mizen-labs/ui`.
Install it with `npm install @mizen-labs/ui`. If the host app is not configured,
read `/docs/installation/markdown` before changing its compiler, fonts, or theme
setup.

## Find the existing contract

Start at `/llms.txt`. Read the relevant component Markdown and focused example
before writing code. Prefer a small focused example for a small task; do not
copy a whole demo to render one control.

Reviewed component contracts are available at
`/docs/components/<slug>/metadata`. Anatomy, imports, dependencies, client
boundaries, and state ownership are present only where reviewed. Missing contract
metadata means consult the component's Markdown and exported TypeScript types;
do not infer unsupported props from another UI library.

Preserve the state-specific props and integration requirements in each component's
reviewed metadata. Consult `/docs/components/approval-card/metadata` for approval
callbacks and `/docs/components/data-table/metadata` for table features. Retain
those requirements when simplifying a copied example.

## Lay out the screen

Lay out every screen with the layout layer. Do not write layout CSS.

Start from the closest screen recipe in `/docs/components/page/markdown`
(dashboard, record list, record detail, settings form), then change its content.
Read `/docs/layout/markdown` for the rules behind the recipes.

Every screen has the same anatomy:

```tsx
<Page>
  <PageHeader>
    <PageTitle>…</PageTitle>
    <PageDescription>…</PageDescription>
    <PageAction>…</PageAction>
  </PageHeader>
  <Section aria-labelledby="…">
    <SectionHeader>
      <SectionTitle id="…">…</SectionTitle>
      <SectionDescription>…</SectionDescription>
      <SectionAction>…</SectionAction>
    </SectionHeader>
    …content…
  </Section>
</Page>
```

Choose the arrangement by what the content is:

| The content is | Use |
| --- | --- |
| Blocks that follow each other | `Stack` with `gap` |
| A few items on one line, such as buttons | `Inline` with `gap`; `justify="between"` for two ends |
| Peer cards or metrics | `Grid` with `columns="2"`, `"3"`, or `"4"` |
| Many cards of one kind | `Grid columns="auto"` |
| A main area beside a narrower one | `Grid columns="2:1"` or `"1:2"` |
| A form or settings | `Page width="narrow"`, `Fieldset`, `Field`, `Stack gap="4"` |
| Records | `Table` or `DataTable` in a `Section`; filters in an `Inline` above it |
| One number that matters | `Metric`, alone or in a `Card` |

Rules:

- One `Page` per screen, with one `PageTitle`. The app shell around it adds no
  padding; `Page` owns the inset and the space between sections.
- Set space only with `gap` props. Steps are 4px each: `"1"` is 4px, `"4"` is
  16px. Use `"2"` inside a group, `"4"` between fields or cards. `Page` already
  puts 32px between sections.
- `Grid` columns follow the grid's own width. Do not add breakpoints for a
  sidebar or a narrow panel. Columns are sized for cards: two need 30rem,
  three and the ratios need 45rem, four need 60rem. Below that they stack.
- A `Grid` takes the width of its parent. Do not put it in a parent that takes
  its width from its content, such as a centered item.
- A `Section` groups one topic. Give it a `SectionTitle` and point
  `aria-labelledby` at it. Use a `Card` only for an item that stands alone,
  such as one metric, one record, or one plan. Do not put a card in a card or
  a card around every section.
- One brand button per screen, for the main action. Other actions are
  `outline` or `ghost`.
- Numbers that people compare use `Metric`, a numeric table column, or
  `typographyStyles.tabularNums`.

Never do these in application code:

- `display: grid` or `display: flex`, widths, margins, or paddings for layout.
- Media queries or container queries.
- Font sizes, font weights, line heights, or colors written by hand.
- Hover or focus outlines, shadows, or radii of your own.
- A private stylesheet per page.

If the layout layer cannot express what the screen needs, say so and name the
missing capability. StyleX on an application-owned host element is for geometry
only the app knows, such as the height of a chart or a map. Use Mizen tokens
there, never literal values.

## Compose the interface

- Import only documented exports from `@mizen-labs/ui` or its documented subpaths.
  Compound parts are named exports, not guessed namespace properties.
- Styling contracts are closed. Do not pass `className`, `style`, `sx`, or
  `xstyle` to components that omit them. Use their semantic props.
- Keep the look: a white canvas, neutral workareas, white fields with a hairline
  edge, neutral ink, wine actions, and neutral selection. Typography and
  spacing provide hierarchy. Read `/docs/foundations/markdown` and
  `/docs/composition/markdown` when composing a larger view.
- Add `"use client"` to the consumer component that uses hooks, browser APIs,
  or event handlers. A library Client Component can appear in a Server Component;
  that alone does not make its parent a Client Component. Keep render callbacks
  inside client boundaries. Read `/docs/integrations/markdown` for TanStack setup.
- Keep data, validation, persistence, and operation outcomes in the application.
  Derive filtered results from current inputs. Use event handlers for actions.
  Do not add an effect to synchronize derived state.
- Give fields visible labels, associate descriptions and errors, name icon
  actions, and use native form submission. Keep loading and errors explicit.
  Approval Card reports a caller-owned decision; the application authorizes and
  executes the operation.

## Verify the result

Run the host's TypeScript and lint checks. Then check the screen itself:

- The screen is a `Page` with one `PageTitle`, and the application code has no
  layout CSS, media queries, or hand-written type or color values.
- At a narrow width nothing overflows, columns stack, and actions stay
  reachable. In dark theme every text is readable.
- Every section has a title, every field a visible label, every icon action a
  name.
- The keyboard reaches every control and shows focus. Validation, empty
  results, dismissal, and focus return work where relevant.

Describe local demo outcomes truthfully. Use real persistence or runtime
adapters only when the task requests them.

If a needed capability is missing, report the gap. Do not disguise a new API or
backend behavior as an existing Mizen feature.
