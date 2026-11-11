---
"@mizen-labs/ui": minor
---

A layout layer for whole screens, so an application writes no layout CSS.

- `Page` (preview, `@mizen-labs/ui/page`) lays out one screen: `PageHeader`, `PageTitle`, `PageDescription`, and `PageAction`, then sections 32px apart. `width="narrow"` keeps a form in one 42rem column.
- `Section` gains `SectionHeader`, `SectionTitle` (`level` 2 to 6), `SectionDescription`, and `SectionAction`.
- `Grid` gains `columns` (`"1"` to `"4"`, `"auto"`, `"2:1"`, `"1:2"`) and `gap`.
- `Inline` gains `justify="center"`.

`Grid` behaves differently. Its columns now follow the grid's own width, not the window's: two columns need 30rem, three columns and the ratios need 45rem, four need 60rem. A grid in a narrow panel or beside a sidebar therefore stacks earlier than before. The grid is now a container element around one track element (`data-slot="grid-track"`) and takes the full width of its parent. Inside a parent that takes its width from its content, it is one 16rem column. Use `Inline` for a pair of buttons.

A `Badge` no longer breaks a word into single letters when its table column is narrow. A long label still wraps.
