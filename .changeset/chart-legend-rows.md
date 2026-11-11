---
"@mizen-labs/ui": minor
---

`ChartLegend` has a `rows` variant: each item takes its own row, with its value at the row's end and a hairline between rows. Use it when readers compare exact numbers.

`PartToWhole` now uses it for its breakdown. Each part was laid out as a wrapping inline item before, so the values did not line up and the separators stopped short. The label under the total is also centred for short labels.

A legend item with a value now has a space between the label and the value, so copied and read text is "Organic 50,500", not "Organic50,500".
