---
"@mizen-labs/ui": minor
---

A control takes its width from the layout. `InputGroup`, `Select` and `NumberField` no longer set `width: 100%`, so they behave like `Input`: they fill the width in a `Stack`, a `Field` or a `Grid` cell, and are as wide as their content in an `Inline`, a `SectionAction` or a `PageAction`. `DatePicker` and `DateRangePicker` are as wide as their date format there, so a row of filters stays on one line. A group's input shrinks below its native width, so a group no longer overflows a narrow row.

This changes existing layouts: a `Select`, `NumberField`, `InputGroup`, `Combobox`, `DatePicker` or `DateRangePicker` that filled a whole line of an `Inline`, or stood directly in a plain block element in the case of `Select`, is now as wide as its content. To make a control fill a line, put it in a `Stack` or a `Grid`.
