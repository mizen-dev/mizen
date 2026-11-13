---
name: mizen-ui
description: Build React interfaces with an existing Mizen UI installation. Use published components, the layout layer, and screen recipes without inventing imports, styling props, layout CSS, or runtime behavior.
---

# Build with Mizen UI

Mizen is published on npm as `@mizen-labs/ui`. This skill ships inside that
package, at `skills/mizen-ui/SKILL.md`, and describes the version it ships
with. Use the copy in the app's `node_modules/@mizen-labs/ui`. A copy from the
docs site or another project can describe a newer version.

## Match the installed version

Read `version` in `node_modules/@mizen-labs/ui/package.json` first. The
`exports` map in that file lists every import path the installed version has.

Read a component's contract from the CLI of the same version. The CLI and the
package share one version number, and each CLI release carries the catalog of
its UI release:

```sh
npx @mizen-labs/cli@<installed version> search <words>
npx @mizen-labs/cli@<installed version> info <slug>
npx @mizen-labs/cli@<installed version> info <slug> --json
```

`info` prints the import path, props with defaults, guidance, boundaries, and
the reviewed contract where one exists. It works offline once the CLI is
installed in the app (`npm install --save-dev @mizen-labs/cli@<installed version>`,
then `npx --no-install mizen info <slug>`). Run it in the app, or pass
`--cwd <app>`.

When the versions differ, `info` says so. When the installed package lacks the
component, `info` fails and names both versions. Then:

- Do not upgrade `@mizen-labs/ui` to follow guidance. An upgrade is the
  user's decision; ask first.
- Do not write an import that the installed `exports` map lacks.
- Build with what the installed version has, and report the gap.

A missing contract means: read the component's props from `info` and its
exported TypeScript types. Do not infer props from another UI library.

Preserve the state-specific props and integration requirements in a reviewed
contract. `info approval-card` has the approval callbacks and `info data-table`
the table features. Retain those requirements when simplifying an example.

If the app does not import `@mizen-labs/ui/styles.css` yet, set it up before
writing screens: `npx @mizen-labs/cli@<installed version> init` prints the
plan, and `doctor` checks an existing setup. Do not change the compiler, fonts,
or theme setup by hand.

The app owns its global defaults. `@mizen-labs/ui/reset.css` is an opt-in
reset: `box-sizing`, the `body` margin and font inheritance on form controls.
Components do not need it. Add or remove it only when the user asks.

The app's theme is one file, `mizen-theme.css`, when it has one. It declares
`--mizen-*` token variables on `:root`, with dark values under
`[data-theme="dark"]`. Change the look there and nowhere else: never per page
or per component. `init --preset vivid` writes a starting file. Read
`/docs/theming/markdown` before changing it.

The docs site, https://ui.mizen-labs.dev, has the guides and the full
examples: `/llms.txt` is its index, and each page has a Markdown form at
`/docs/<guide>/markdown` and `/docs/components/<slug>/markdown`. The site
describes the latest release. When it disagrees with the installed version,
the installed package and its matching CLI win.

For a whole screen, start from an app: `/apps/dashboard/markdown` has the
sources of a dashboard in an application shell with a sidebar. Its shell
styles are StyleX. In an app without a StyleX build, write those rules in
plain CSS with the token variables.

## Lay out the screen

Lay out every screen with the layout layer. Do not write layout CSS.

Start from the closest screen recipe in `/docs/components/page/markdown` on
the docs site (dashboard, record list, record detail, settings form), then
change its content. Check each component of a recipe with `info` before use.
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

- A control takes its width from the layout. `Input`, `Select`, `NumberField`,
  `InputGroup`, `DatePicker` and `DateRangePicker` fill the width in a `Stack`,
  a `Field` or a `Grid` cell, and are as wide as their content in an `Inline`
  or a header action. Do not set a width on a control or wrap it to size it.
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
- Numbers that people compare use `Metric` or a `numeric` table column. On an
  application-owned element, set `font-variant-numeric: tabular-nums`.

Never do these in application code:

- `display: grid` or `display: flex`, widths, margins, or paddings for layout.
- Media queries or container queries.
- Font sizes, font weights, line heights, or colors written by hand.
- Hover or focus outlines, shadows, or radii of your own.
- A private stylesheet per page.

If the layout layer cannot express what the screen needs, say so and name the
missing capability. CSS on an application-owned element is for geometry only
the app knows, such as the height of a chart or a map. Use the Mizen token
variables there, such as `var(--mizen-space-4)` and
`var(--mizen-color-content)`, never literal values. Do not set up StyleX in the
app for this.

## Compose the interface

- Import only exports of the installed version, from `@mizen-labs/ui` or the
  subpath that `info` names. Compound parts are named exports, not guessed
  namespace properties.
- Styling contracts are closed. Do not pass `className`, `style`, `sx`, or
  `xstyle` to components that omit them. Use their semantic props.
- Keep the look the tokens give: by default a white canvas, neutral workareas,
  white fields with a hairline edge, neutral ink, wine actions, and neutral
  selection. A theme file may change those values; screens never do. Typography and
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
