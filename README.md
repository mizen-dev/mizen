# Mizen

An opinionated React UI library, built with Base UI and StyleX. The docs app is
the integration specimen. Components own their appearance and interaction;
application compositions own data, validation, and task state.

## Development

Use Node.js 22.18+ within 22.x, or 24.11+, and the pnpm version in `package.json`.

```sh
pnpm install
pnpm dev
```

Start from the workspace root. This compiles UI source into `dist` before Next.js
starts, then watches both packages. Running Next.js alone does not start the UI
compiler. Use the port printed by Next.js.

## Where code belongs

| Responsibility | Owner |
| --- | --- |
| Public component anatomy, props, and behavior | `packages/ui/src/components/<component>/` |
| Static spacing, dimensions, radii, type, and motion | `packages/ui/src/styles/*.stylex.ts` using `defineConsts` |
| Semantic colors and finite theme overrides | `colors.stylex.ts` and `themes.ts` |
| Root theme bootstrap, storage, and synchronization | `packages/ui/src/theme/` |
| Form integration and invalid-control focus | `packages/ui/src/form.ts` |
| Public root and subpath imports | `packages/ui/src/index.ts` and `packages/ui/package.json` |
| Complete product flows using existing components | `apps/docs/app/compositions/` |
| Component inventory, navigation, and API metadata | `apps/docs/app/docs-registry-data.json` |
| Foundational guides, navigation labels, and Markdown content | `apps/docs/app/guides.ts` |
| Individual component demonstrations | `apps/docs/app/components/[slug]/specimens/` |
| Behavior, browser, and public type checks | `apps/docs/tests/` |

Keep behavior beside the component that owns it. Split styles, types, and helpers
when they clarify that behavior. Share a helper only when callers already repeat
the same contract. A composition stays application source until repeated use
proves a reusable API.

## How compilation connects

```text
UI TypeScript + StyleX declarations
  -> Babel emits packages/ui/dist JavaScript
  -> TypeScript emits declarations into dist
  -> StyleX PostCSS emits dist/styles.css during the package build
  -> Consumers import @mizen-labs/ui/styles.css once at the app root
```

Components retain imports for their structural CSS. Next uses `transpilePackages`;
TanStack Start uses `ssr.noExternal`. Client React/Vite needs no special bundling
setting. Consumers do not need StyleX compiler plugins.
The docs workspace still extracts UI and docs source together for local authoring.
Generated class names are not an API.

Server routes can compose Mizen components. Interactive components retain their
`"use client"` boundaries and need client code for handlers and state. Keep those
boundaries in compiled output. Root theme tokens cover body portals; a local
theme scope needs an explicit portal container inside that scope.

Portaled native fields need an explicit form owner when DOM ancestry no longer
connects them to the form. Select exposes `form` for its mounted hidden input.
Closing an unmounted Dialog also removes nested fields. Keep submission values
in caller state and in the persistent form when they must survive that closure.
The packed fixture demonstrates one hidden input, without duplicate field names.

The manifest targets an unpublished `0.1.0` release candidate, with public access
and an MIT license. Use a workspace dependency or packed archive for now. The docs site's Installation
guide covers setup.

## CLI

The unpublished `@mizen-labs/cli` candidate provides offline component discovery:

```sh
pnpm --filter @mizen-labs/cli build
node packages/cli/dist/cli.js search approval
node packages/cli/dist/cli.js info button --json
```

It bundles the same metadata and guidance as the docs and makes no project edits.
See [the CLI package](./packages/cli/README.md).
Doctor provides local diagnostics with `--cwd`, `--json`, and optional `--strict`.
Init previews exact setup edits and applies them only with `--yes`; see the CLI
package guide for supported npm/pnpm consumers and archive installation.

## Component metadata and discovery

The docs registry is the source for component names, categories, status, summaries,
and API tables. Browse and search components in the `/docs` aside; open documentation
at `/docs/components/<slug>` and Markdown at `/docs/components/<slug>/markdown`.
Old component URLs redirect to those routes. `/llms.txt` lists component entries
and the internal artifact example.

Home (`/`) has a separate landing composition. `/docs` owns the documentation
shell. Blocks and Apps were removed on 2026-10-31 and will be rebuilt from scratch.
The full development gallery lives at `/internal/specimens`.
Installation and foundation guides are published. Consumer agent guidance and
the full landing design remain unfinished.

`Stable` means the current API and behavior have established contract coverage.
`Preview` means those details may change. Neither label promises support across
browsers, devices, or assistive technologies. The established components are Stable; the optional Diagram integration is Preview.

Component styles use closed StyleX APIs. Compose documented props and exported
parts instead of depending on generated classes or arbitrary style overrides.
Reusable appearance and token behavior belongs beside package components and
theme definitions. Product-specific layout and task state belong in app
compositions; use existing semantic tokens before adding a local value. Keep
examples aligned with real package exports and type-check them against the public
entry point.

## Verification

```sh
pnpm lint:check
pnpm typecheck
pnpm --filter @mizen-labs/docs test
```

Vitest compiles the UI once before starting its browser server. With
`MIZEN_DOCS_TEST_URL` set, it reuses that server and skips compilation; keep the UI
watcher current. The route suite uses Playwright Chromium. Focused Dialog, Drawer,
and Table checks also pass in Chromium and WebKit for keyboard use, reduced motion,
themes, RTL, and enlarged text. Firefox remains unverified: Playwright 1.64.1's
Firefox build exits with `Could not find profile folder` on macOS 27, even after a
forced reinstall and outside the sandbox. The cross-browser suite reports two
passing engines and one failed launch. Rerun it on another macOS or Linux host, or
after a Playwright release with a compatible Firefox build.

```sh
pnpm --filter @mizen-labs/docs exec playwright install chromium firefox webkit
```

Run focused tests during a slice. Run `pnpm build` at integration or release
checkpoints, rather than after each visual adjustment. Biome handles general
linting and formatting; ESLint supplies specialized StyleX and complexity checks.
The strict consumer type fixture checks public imports without `allowJs`; its
`skipLibCheck` setting applies to declarations. Public consumer examples remain
type-checked against the emitted package API. Tests use one worker and a 30-second deadline for complete
browser flows. The archive test checks that every declared export ships its runtime
and type files.

The packed Next and TanStack Start consumers are opt-in integration checkpoints:

```sh
pnpm --filter @mizen-labs/ui build
MIZEN_PACKED_CONSUMER=1 MIZEN_DOCS_TEST_URL=http://localhost:3000 pnpm --filter @mizen-labs/docs exec vitest run tests/package-consumer.integration.test.ts
```

It packs the UI, installs the archive in a temporary independent app, and builds it.
The archive type contract, shared React and ReactDOM host identity, single-worker
Next production build, compiled CSS and app-owned font loading, theme bootstrap, RSC composition,
and runtime/browser checks passed. The distribution check passed 1/1 as well. The
fixture pins direct framework versions; transitive dependencies
resolve during installation. Its baseline is not a locked release dependency
graph. It removes its temporary app and server afterward.
Ordinary test runs skip this production build. The fixtures load the precompiled
stylesheet without consumer Babel or PostCSS configuration. Fonts are
loaded by the consuming app from its own dependency.

## Adoption limits

The manifest declares `0.1.0`; no public npm release is available yet. React and ReactDOM have
`^19.2.8` peer ranges. The pinned Next.js, React, and StyleX versions do not
establish a broader compatibility range. There is no browser or assistive-
technology support policy beyond the browser target below, and Firefox remains
unverified.

## Supported browsers

Mizen targets browsers in the Baseline "Widely available" set: current Chrome,
Edge, Firefox, and Safari on desktop, Safari on iOS, and Chrome on Android. The
package relies on `:has()`, `color-mix()`, `oklch()`, and container queries, which
are all in that set. Older engines are not supported.

Evidence today: focused Dialog, Drawer, and Table flows pass in Chromium and
WebKit, and the full route suite runs in Chromium. Firefox, real touch devices,
native zoom, and screen-reader sessions are not yet verified.

The package declares MIT licensing and public npm access. Before publication,
finalize the version/support policy and source ownership. A future source installer should copy proven component anatomy
and its shared foundations from the existing registry, report dependencies, and
preserve local edits. Installation and update tooling remain deferred until those
ownership rules are concrete. No generated-class contract or second catalog is
needed.

## Local date and time values

`TimeInput` and `DateTimeInput` reuse `Input` styling and `Field` binding. They use
native `time` and `datetime-local` controls. Values are local strings:
`HH:mm` and `YYYY-MM-DDTHH:mm`; `step={1}` permits seconds. An empty string clears
the value. These controls do not convert time zones or accept `Date` objects.

The browser owns picker UI and localized display. Use native `min`, `max`,
`step`, and `required` constraints. Applications own the time zone and any
conversion needed when saving a scheduled event. Both controls are Stable.

## Action groups and single selection

`ButtonGroup` joins direct `Button` children and keeps normal Tab navigation.
Each Button retains its size and appearance. Attached edges use a small scoped
CSS rule; root layout remains StyleX. Long horizontal groups scroll locally.

`Toolbar` uses Base UI roving focus. Use `ToolbarButton`, `ToolbarGroup`,
`ToolbarSeparator`, and `ToolbarLink` for participating controls. The default
ToolbarButton reuses a ghost Button. A supplied `render` element owns its
appearance; compose a Toggle or popup trigger rather than nesting buttons.
Disabled toolbar items remain arrow-focusable by default; set
`focusableWhenDisabled={false}` to skip one.

`SegmentedControl` and `SegmentedControlItem` reuse ToggleGroup and Toggle.
They keep the existing array-value contract with single selection. An empty
array clears selection; pressing the selected segment clears it. These controls
choose values, rather than navigate tabs or replace a required RadioGroup.

### Navigation and progress

`Breadcrumb` composes `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, and `BreadcrumbPage`. Links support `render` for framework routing. The current page remains text with `aria-current="page"`. Name any menu trigger that uses `BreadcrumbEllipsis` to reveal omitted ancestors.

`Pagination` composes an explicit list of page links. A supplied render element owns its routing destination, following Base UI render composition. `active` marks the current page. `PaginationPrevious` and `PaginationNext` accept `disabled` at unavailable boundaries. Disabled links omit their destination and skip Tab navigation. They render a native anchor rather than a supplied framework Link, avoiding a missing required `href`. The application owns page ranges and data loading.

`Stepper` is a named ordered list. Each `StepperItem` declares `complete`, `current`, or `upcoming`; `StepperIndicator`, `StepperTitle`, and `StepperDescription` provide its content. The layout stacks on narrow screens. The application owns state, validation, and actions; progress items remain non-interactive.

`NavigationMenu` pairs each trigger with its content inside the matching item and uses one `NavigationMenuPopup` after the list. It supports horizontal navigation; the popup accepts placement options and `portalProps`, including a custom portal container. It supports framework links through `render`. The docs composition shows two menu groups and direct component browsing.

Breadcrumb, Pagination, and Stepper anatomy can compose from server components. NavigationMenu and polymorphic link implementations retain client boundaries. Breadcrumb, Pagination, Stepper, and NavigationMenu are Stable.

### Charts

`ChartFrame` adapts TanStack Charts 1.1.0 with a required accessible name and deterministic initial width for server rendering. Definitions keep datum and axis callback types inferred. Axes default to 12px regular text, and chart colors follow the active theme. `ChartTooltip` supplies the body while TanStack owns placement and interaction. `ChartLegend` renders a named native list with matching series tones. `TimeSeries` accepts unique integer epoch-millisecond points on a UTC temporal scale. `null` values create gaps, while zero remains a value. Set an explicit `timeZone` for displayed dates. Its optional `formatValue` callback formats values in both the axis and tooltip. The component supports a full chart or compact sparkline and draws one series. `MetricTrend` composes existing metric parts with a caller-owned chart or sparkline and caller-owned value; it does not infer change. `CategoryComparison` draws one caller-ordered horizontal series around zero; unique IDs allow repeated labels, and signed values extend on either side. Its `formatValue` applies to axis ticks and tooltips. `Distribution` bins caller-provided finite numeric values into equal-width intervals over a required explicit domain. It defaults to eight bins, includes both domain endpoints, uses left-inclusive/right-exclusive interior bins, and includes the maximum in the final bin. Values outside the domain are rejected; an empty sample reports an empty state. Its optional `formatValue` formats domain units on the axis and tooltip, while bin counts use the selected locale. `PartToWhole` shows caller-ordered nonnegative values in one donut chart; zero-value categories stay in the legend beside their share. Import chart parts and types from `@mizen-labs/ui` or their matching subpaths.

### Agentic

`Composer` combines a named draft input with a form submit action. Enter submits, Shift+Enter inserts a line break, and IME composition stays intact. `submitDisabled` blocks sending while preserving the draft; the caller owns asynchronous state and clearing. Import it from `@mizen-labs/ui` or `@mizen-labs/ui/composer`.

The Agentic group includes conversation, streaming text, tool calls, approvals, questions, and task progress. Consult the component catalog for current APIs and examples. The internal specimen gallery keeps the Agent Selector recipe, composed from `Field` and `Select`.

Construct definitions and callbacks in a client component. Chart Frame still renders SVG during server rendering; its first text measurements use TanStack's estimates before browser font measurement. Tooltip bodies and legends support native server rendering.

### Table

`TableContainer` names and contains a native table with horizontal or two-axis scrolling. Compose `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, and `TableCaption`. Headers stick by default. Mark the first header, row header, and footer cell with `sticky` to keep the category column visible on wide screens. `numeric` aligns values with tabular numerals. The application owns data and totals; `DataTable` remains a separate integration for sorting, filtering, or selection behavior.

Row headings reserve at least 8rem below 40rem and 16rem on wider screens; labels can wrap. All nine parts support server rendering. They and their prop types are available from both `@mizen-labs/ui` and `@mizen-labs/ui/table`. Consult `packages/ui/package.json` for the current export map.

### Data Table

`DataTable` accepts a caller-owned TanStack Table v9 instance and a required `caption`. Register `rowSortingFeature`, `rowPaginationFeature`, `columnVisibilityFeature`, and `columnSizingFeature` on the instance. Column metadata uses `meta.mizen` for `numeric`, `rowHeader`, and `sticky` presentation. `DataTablePagination` uses the same instance for native page actions. Configure row models and state through TanStack; Mizen does not maintain a second data model.

Paging is the default. Set `virtualized` for large, read-only datasets; TanStack Virtual measures row heights as text and viewport dimensions change. Use paged mode for editable cells, browser search, or access to every row on the current page through assistive tools. Virtualization mounts only a window of rows and adds native row counts and indices. The example searches and filters 10,000 records, exposes page and filtered-match selection, and applies a reversible local review marker. Virtualized mode remains read-only and hides selection controls.

### List

`List`, `ListItem`, `ListContent`, and `ListActions` compose a named native list with separate record content and trailing controls. Keep actions inside `ListActions`; rows remain plain list items rather than clickable containers. The props and components are available from `@mizen-labs/ui` and `@mizen-labs/ui/list`.

### Data compositions

Metadata lists use the existing `PropertyList`, `PropertyListItem`, `PropertyListLabel`, and `PropertyListValue` anatomy. There is no second key/value API.

`ActivityFeed` is an ordered native list. Compose `ActivityFeedItem`, `ActivityFeedContent`, and `ActivityFeedTime`; `dateTime` carries the machine-readable timestamp, and callers format its visible text. Static feed anatomy supports server rendering.

`OverflowList` accepts `ListItem` children and an explicit nonnegative integer `visibleCount`, defaulting to three. Remaining items appear in the existing Popover family. The explicit count avoids a measurement engine; it does not automatically hide more items as the container narrows.

`Tree` accepts uniquely identified hierarchical items and a required accessible name. It supports controlled or uncontrolled expansion, root focus with `aria-activedescendant`, arrow keys, Home/End, and text search. Optional single-item selection can be controlled with `selectedItemId` or initialized with `defaultSelectedItemId`; arrows move focus while Enter, Space, and clicks select enabled rows. Activation remains caller-owned; use Side Navigation for ordinary site links.

`Tree` provides hierarchy, expansion, keyboard navigation, typeahead, disabled items, RTL, and optional single-item selection. The Tree List recipe reuses this API; it adds no component export. `List` provides flat native content and actions.

The internal specimen gallery demonstrates all four capabilities. Tree and Overflow List isolate their interactive client boundaries.

### Media and quoted content

`AspectRatio` reserves a native CSS ratio frame, defaulting to 16:9. Set `ratio` to a finite positive width-to-height value. Content fills the frame; applications choose image fit and loading behavior.

`Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, and `CarouselNext` compose a named horizontal carousel. Native scrolling handles touch and keyboard input. Controls follow scroll boundaries, direction, and reduced-motion preferences. Slides fill the viewport; autoplay and looping are not part of this API.

`Lightbox` reuses Dialog's modal behavior. Compose its trigger, large popup, title, description, and image. `LightboxImage` requires `src` and `alt`, preserves its proportions, and fits within viewport bounds. This version previews one image; gallery navigation and zoom are separate product decisions.

`Blockquote` groups `BlockquoteContent` and `BlockquoteAttribution` as a native figure, quotation, and caption. Keep the author or work title outside the quoted content. `Citation` marks a work title with native `cite` semantics and inherits the surrounding text size.

All five families have root and component subpath exports. Aspect Ratio, Blockquote, and Citation support native server rendering. Interactive Carousel and Lightbox parts use isolated client boundaries.

### Code Block

`CodeBlock` composes a figure, caption, named preformatted source, and optional copy action. The caller owns the source string and can provide highlighted React content. No syntax-highlighting engine or code-language configuration is included. The components and props are available from `@mizen-labs/ui` and `@mizen-labs/ui/code-block`.

### Markdown, Thumbnail, and Timestamp

`Markdown` is the reading layout for a rendered document, and `markdownComponents` maps Markdown elements to Mizen styles for any renderer with a components prop, such as react-markdown or MDX. Mizen ships no parser: the app chooses plugins (for example remark-gfm), skips raw HTML, and keeps URL sanitizing. Pass the document `id` as the parser's footnote prefix; remark-rehype still shares one footnote label ID per page.

`Thumbnail` renders a native image with required `src` and `alt`, and a finite `sm`, `default`, or `lg` size. `Timestamp` renders a native `time` element from an ISO instant with `Z` or an explicit offset. Set its `locale`, `timeZone`, and `format` for stable display; the source instant remains machine-readable.

All three components and their prop types are available from `@mizen-labs/ui` and their matching subpaths. They support server rendering.

### Link, Visually Hidden, and Meter

`Link` is a styled native anchor with a required `href`. `VisuallyHidden` keeps its child text available to assistive technology while clipping it visually. `Meter` uses Base UI range semantics; provide a value and name it with `MeterLabel`, `aria-label`, or `aria-labelledby`. The component props and anatomy are available from the root package and matching subpaths. Link and Visually Hidden support server rendering; Meter keeps its client boundary for Base UI behavior.

### Menubar and Attachment

`Menubar` provides keyboard menu navigation through the existing Menu parts.
`Attachment` presents file content with optional media, descriptions, and actions.

Use Combobox chips for multiple selection. Token and Tokenizer are no longer
exported.

The Page Outline recipe composes existing `List` and `Link` parts with named section targets. It adds no package export.

### Optional diagrams

Install `pele` and import `Diagram` from `@mizen-labs/ui/diagram`. This entry point
is separate from the root import, so other components do not load the diagram
engine. The first version supports flowcharts, sequences, entity relationships,
and state diagrams. Give each diagram an `aria-label`, and describe its important
relationships with `aria-description`. Rendering happens after hydration.

Package maintainers: `pnpm release:check` packs UI and CLI and verifies them in isolated npm and pnpm apps.
