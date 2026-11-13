# @mizen-labs/ui

## 0.3.0

### Minor Changes

- 679f01d: A control takes its width from the layout. `InputGroup`, `Select` and `NumberField` no longer set `width: 100%`, so they behave like `Input`: they fill the width in a `Stack`, a `Field` or a `Grid` cell, and are as wide as their content in an `Inline`, a `SectionAction` or a `PageAction`. `DatePicker` and `DateRangePicker` are as wide as their date format there, so a row of filters stays on one line. A group's input or textarea shrinks below its native width, so a group no longer overflows a narrow row.
  
  This changes existing layouts: a `Select`, `NumberField`, `InputGroup`, `Combobox`, `DatePicker` or `DateRangePicker` that filled a whole line of an `Inline`, or stood directly in a plain block element in the case of `Select`, is now as wide as its content. To make a control fill a line, put it in a `Stack` or a `Grid`.
- 8098d8b: `MetricTrend` accepts `iconColor`: `"brand"` (the default), `"neutral"`, `"blue"`, `"purple"`, `"green"` or `"orange"`. It colors the icon tile by category with the `AvatarFallback` palette, so stat cards of different kinds can be told apart. Existing cards keep the brand tile.
- 91fdb8f: `MetricTrend` accepts `loading`. The card keeps the height of its loaded state and sets `aria-busy`. Each of `value`, `description` and `delta` that the card names renders as a placeholder, even when its data is not there yet, as in `value={data?.total}`. The label stays readable, and children render as given.
  
  `Skeleton` placeholders stay visible in forced-colors mode.
- 91fdb8f: `MetricDelta` accepts `good="none"` for a change that is neither good nor bad. The chip keeps the flat tone for any sign; the sign and the percent format do not change.
- efbb86b: Add `@mizen-labs/ui/reset.css`, an opt-in reset. It sets `box-sizing: border-box` on every element and pseudo-element, removes the `body` margin, and makes form controls inherit `font` and `letter-spacing`. Its rules sit in the `mizen-reset` cascade layer, so any CSS outside a layer wins over them. No component and no other stylesheet imports it, and components render the same with it and without it.
- d61d5f7: `MetricDelta` accepts `appearance="soft"`. The chip then fills with the tint of its tone instead of showing a dot, like a soft `Badge`. The default stays `"dot"`, so existing chips do not change.
- 7f76413: `Badge` accepts `appearance="soft"`. A `destructive`, `info`, `success` or `warning` badge then fills with its status tint instead of showing a dot. The default stays `"dot"`, so existing badges do not change. Other variants ignore the prop.
- 4bf320f: An application can now replace the `space`, `control-size`, `glyph-size`, `shadow`, `duration` and `easing` tokens. Declare `--mizen-space-4`, `--mizen-control-size-md`, `--mizen-shadow-floating` or `--mizen-duration-fast` again on `:root` and the components follow, as they do for colors and radii. Before, these variables could only be read.
  
  For an app that compiles StyleX itself: `space`, `controlSize`, `glyphSize`, `shadows`, `duration` and `easing` are now `defineVars` groups. Their values are `var(...)` references, so they no longer work inside a media query or in JavaScript arithmetic.
- cd24a33: `Timestamp` accepts `format="time"`. It shows the hour and minute in the given `locale` and `timeZone`, for a line whose surrounding text already states the day. The text shows no zone, so the exact date, time and zone are in the `title`. The `dateTime` attribute does not change.

### Patch Changes

- f9ac290: Keep the hue of a color that mixes with a neutral token. Avatar identity colors, Token tones, code syntax colors and invalid field edges had drifted toward pink, because the mix rotated their hue toward the hue of the neutral.
- 76aef0c: A default `PopoverPopup` wraps its text at 18rem. Base UI sets the popup width to `auto`, so the 18rem fallback never applied and a text-only popup grew to one long line. A popup is now as wide as its content, up to 18rem. It still grows for content that cannot shrink, such as a calendar, and narrows when the window leaves less room. A popup with `portalProps={{ keepMounted: true }}` follows the same rule; it was always 18rem before.
- 0246602: The agent skill points to the dashboard app on the docs site, `/apps/dashboard/markdown`, as the starting point for a whole screen.
- b3a674b: A hovered or selected `Table` row is now a band with rounded ends. Selected rows that touch form one band, and the rules above and below a band give way to its edge. The hover band is lighter, so a secondary control or a neutral avatar keeps its shape inside it. A `grid` table keeps square bands. `DataTable` marks a selected record with the same band when row selection is on.
- 273d0e2: A toast action sits on the first line of the title, like the icon. It was centered in the row, 4px below a one-line title. The action no longer adds height: a one-line toast with an action is 8px shorter.

## 0.2.0

### Minor Changes

- e0d9495: `ChartLegend` has a `rows` variant: each item takes its own row, with its value at the row's end and a hairline between rows. Use it when readers compare exact numbers.
  
  `PartToWhole` now uses it for its breakdown. Each part was laid out as a wrapping inline item before, so the values did not line up and the separators stopped short. The label under the total is also centred for short labels.
  
  A legend item with a value now has a space between the label and the value, so copied and read text is "Organic 50,500", not "Organic50,500".
- 6155ff4: A layout layer for whole screens, so an application writes no layout CSS.
  
  - `Page` (preview, `@mizen-labs/ui/page`) lays out one screen: `PageHeader`, `PageTitle`, `PageDescription`, and `PageAction`, then sections 32px apart. `width="narrow"` keeps a form in one 42rem column.
  - `Section` gains `SectionHeader`, `SectionTitle` (`level` 2 to 6), `SectionDescription`, and `SectionAction`.
  - `Grid` gains `columns` (`"1"` to `"4"`, `"auto"`, `"2:1"`, `"1:2"`) and `gap`.
  - `Inline` gains `justify="center"`.
  
  `Grid` behaves differently. Its columns now follow the grid's own width, not the window's: two columns need 30rem, three columns and the ratios need 45rem, four need 60rem. A grid in a narrow panel or beside a sidebar therefore stacks earlier than before. The grid is now a container element around one track element (`data-slot="grid-track"`) and takes the full width of its parent. Inside a parent that takes its width from its content, it is one 16rem column. Use `Inline` for a pair of buttons.
  
  A `Badge` no longer breaks a word into single letters when its table column is narrow. A long label still wraps.
- 342bc0e: `ActivityFeed`, `List` and `OverflowList` now set their text at the 14px body tier (14px on a 20px line) instead of 16px on 24px. Activity summaries, comment details and plain list rows get smaller; times and descriptions were 14px already. A row title in a `Text` keeps the size of that `Text`: use `<Text size="ui">` to match.
- bb592fa: Every token is now a CSS variable in `@mizen-labs/ui/styles.css`, named `--mizen-<group>-<name>`: `--mizen-color-content`, `--mizen-space-4`, `--mizen-font-size-14`. An app styles its own elements with them in plain CSS and needs no StyleX setup.
  
  The themed groups (`color`, `field-color`, `font`, `shape`, `letter-spacing`) can be changed: declare a variable again on `:root` after the Mizen stylesheet, and add a `[data-theme="dark"]` rule for a separate dark value. Components follow it. The scales (`space`, sizes, type sizes, `shadow`, `palette`, motion) are read-only.
  
  The library's own values sit in the `mizen-tokens` cascade layer, so a plain app rule wins in both themes. An app that compiles StyleX itself must compile the Mizen source in the same StyleX build instead of importing `styles.css`; two separately compiled StyleX stylesheets do not agree on rule priority.
- f1b1d77: Removed `controlSize["2xs"]` from `@mizen-labs/ui/dimensions.stylex`. It had the same 24px value as `controlSize.xs`; use `xs`. The published stylesheet has `--mizen-control-size-xs` and no `--mizen-control-size-2xs`.
- b3a11c1: Removed `fonts.sans` from `@mizen-labs/ui/fonts.stylex`. No component read it: components inherit the interface font from `body`. Set your font family on `body`. `fonts.mono` and `fonts.sizeAdjust` stay, as `--mizen-font-mono` and `--mizen-font-size-adjust` in the published stylesheet.
- 64520ae: The agent skill now ships inside the package, at `skills/mizen-ui/SKILL.md`, also importable as `@mizen-labs/ui/skills/mizen-ui/SKILL.md`. Point your agent at the copy in `node_modules/@mizen-labs/ui`: it describes the version you have installed. The skill on the docs site describes the latest release, which can name components your version lacks.
- 131a9ea: Redesign the components with a cleaner, tighter look. Review your screens after you upgrade: sizes, corners, and text sizes change.
  
  - Controls: the default control is 32px high (was 36px), `sm` is 28px, and `xs` is 24px. Corners are tighter: 6px, 8px, and 10px controls, 12px floating surfaces, 16px cards, 20px large surfaces.
  - Fields are white with a hairline edge and a small drop, not filled. `shadows.recessedRest` is replaced by `shadows.fieldRest`.
  - Focus is the solid brand color. Controls show a 2px ring, 2px off their edge. Fields color their edge and add a soft halo; an invalid field keeps its error color.
  - Type: interface text is 14px, labels and supporting text are 13px, and buttons are 14px medium. Card, popover, and legend titles are 14px semibold; dialog, sheet, and drawer titles are 16px semibold. A text button sizes its icon for its text: 16px, or 14px in `sm` and `xs`.
  - Tracking is themeable. `letterSpacing` is now a variable group with a new `ui` token for 13–16px text. The defaults are unchanged; override them with `createTheme` to suit your font.
  - Spacing: labels, controls, and help text sit 6px apart (`space["1.5"]`). `SelectLabel` and `SliderLabel` now match `FieldLabel`, and `Field` renders `data-slot="field"`. Card sections sit closer together. `CheckboxGroup` and `RadioGroup` no longer force full width, so `<Fieldset render={<RadioGroup />}>` gives one named group.
  - Selection is neutral (`colors.selected`). Badges use a dot and a hairline edge. Tables are frameless. The switch has a light track.
  - Motion: a switch thumb and a selection indicator move with a spring (`easing.spring`, `duration.spring`). Buttons and toggles press 1px inward (was 2px), and a ghost button fades in at full size. Checkboxes and radios no longer scale on press.
  - New tokens: `colors.controlBorder`, `colors.controlIndicator`, `colors.outlineSurface`, `colors.selected`, `colors.infoSolid`, `shape.controlRadiusSmall`, `focusOutline.fieldWidth`, `focusOutline.fieldOffset`, `focusOutline.fieldHalo`, and `conditions.anchored`.
  
  Migration: replace `shadows.recessedRest` with `shadows.fieldRest`. Remove CSS that assumes 36px controls or the old radii. If a choice group must fill its container inside a centered flex parent, set the width on that parent. If you set your own font, check its tracking and override `letterSpacing` where needed.

### Patch Changes

- 1229a8f: `Attachment` sets its name at 14px medium and its description at 13px, the same tiers as a `FileUpload` row. Both were 16px, and the name was semibold.
- 9c8379e: `Badge` keeps its own width inside a `Stack` or a grid cell. It stretched to a full-width bar there, so it needed an `Inline` wrapper.
- 183e163: The published stylesheet no longer contains border and outline widths without a unit, such as `border-width: 1`. A browser drops such a value, so borders were 3px wide in an app that loads `styles.css` without a CSS normalizer. `borderWidth.thin` and `borderWidth.focus` from `@mizen-labs/ui/interaction.stylex` are now `"1px"` and `"2px"`. If your styles append `px` to them, remove it.
- 12c5ae9: `BreadcrumbLink` has a 24px hit area and its focus ring clears the label. The link was as tall as its trimmed text, about 10px, so the pointer target was thin and the ring crossed descenders. The trail keeps its height and position.
- 53442fc: Chart tick labels sit 8px from the plot instead of 4px. The first x label no longer touches the lowest y label where the axes meet, as "Jan" did with "$0" in `TimeSeries`, `AreaChart`, and `Distribution`.
- 86d9aad: Code shows the characters as typed. `Code`, `CodeBlock`, `Terminal`, `ToolCall`, and `Diagram` snippets turn font ligatures off, so a font with code ligatures no longer draws `=>` or `===` as one glyph.
- f648004: `CollapsiblePanel` gains `gap`. The default `"2"` keeps the 8px above the content. `gap="0"` removes it and keeps the height transition, so the first link of a compact navigation group sits directly under its trigger.
- 34d732a: Controls inside a rounded container now share its corner centre: the inner radius equals the outer radius minus the gap, and the gap is the same on every side.
  
  - `Menubar` rounds its root to 15px around its 10px triggers.
  - `ToolbarLink` uses the 10px radius of the other toolbar controls.
  - `Token` takes its radius from its size (6, 8, 10px). Its remove button keeps a 24px target and sits as far from the end edge as from the top and bottom.
  - `InputGroup` places an inline-end button 4px from the end edge, as from the top and bottom.
  - `Combobox` puts its chevron and clear glyph where `Select` puts its chevron, and its leading glyph where `InputGroup` puts one. Chips use the 6px radius.
  - `DatePicker` and `DateRangePicker` round the calendar button to 6px.
- f0e01eb: `DatePicker` and `DateRangePicker` gain `triggerLabel`, the accessible name of the calendar button. It defaults to "Open calendar". `locale` translates the calendar grid only, so pass a translated `triggerLabel` with it.
- 2f7f035: Carousel dots, inline citation triggers, and the search field's clear button no longer keep their hover color after a tap on a touch device.
- 9373daf: The selection indicator of `Tabs` and `SegmentedControl` no longer springs past the edge of its track. Moving to the first or last item made the track scroll sideways for a moment and drew the indicator up to 15px outside the track. The edge that lands on the track edge now stops there, and the opposite edge still springs.
- fd5be05: A Markdown task list item shows its checkbox in place of the list marker. It showed a bullet and then the checkbox.
- 1229a8f: `Meter` sets its label and value at 14px, the same as `Progress`. They were 16px.
- db5e24d: The `MetricTrend` footer strip sits 4px from the card's edges on every side and takes the card's radius less 4px. It sat 8px from the sides and 12px from the bottom with 2px corners, and its text started 4px to the right of the card's content. `ChartLegend` tiles take the 6px radius in place of 2px.
- e9e18e8: `MetricTrend` gains `render`: pass an anchor or a router link element and the whole card becomes that link, with hover and focus states. Leave `actions` out of a linked card.
- 9967005: A `PaginationLink` page number stays on one line. A two-digit number such as "10" broke into two lines, because the 32px square kept 8px of inline padding. The link is now square up to two digits and grows wider past that.
- 1229a8f: A `PropertyList` value is 14px, the same size as its label and as table cells. It was 16px beside a 14px label.
- 2c4ddbb: `ScrollArea` gains `viewportProps`: props and a ref for the element that scrolls. Use it for an `id`, a router's scroll restoration attribute, an accessible name, or a scroll handler. `ref` on `ScrollArea` still names the root.
- 70e5b49: `Table` and `DataTable` keep words whole inside a container that sets `overflow-wrap: anywhere`, such as `AccordionContent`, `PreviewCard`, or an app's own wrapper. The table inherited that rule, so its columns shrank below a word and "Department" broke in two. A word now breaks only when it cannot fit its column.
- 1229a8f: `Timestamp` takes the size and line height of the text around it. It set 16px itself and accepts no style props, so a time in a 14px row, table cell, or `Text size="ui"` stayed 16px. Put a standalone `Timestamp` inside `Text` to give it a size.
- aa8cbcf: A `Tooltip` whose text wraps stays centered on its trigger. The popup was measured as one long line, so the positioner was wider than the visible popup and the popup sat to the left of its trigger.
- 8bd1af4: Buttons, toggles, checkboxes, radios, switches, tabs, and segmented controls now set `touch-action: manipulation` and a transparent tap highlight. A touch device shows only the designed press feedback and does not wait for a double tap. An alert with only a description starts at its padding again.
- 008589b: A `Button` rendered by `MenuTrigger`, `PopoverTrigger`, or another trigger keeps its icon size and loading state. The button now carries a `data-button` attribute, and its own CSS no longer depends on `data-slot`, which a trigger replaces.

## 0.1.1

### Patch Changes

- Correct the package README to install the published package with `npm install @mizen-labs/ui`. Remove the obsolete unpublished-package warning and archive-only installation instructions. No component API migration is required.
