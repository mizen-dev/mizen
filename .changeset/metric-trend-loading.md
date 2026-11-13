---
"@mizen-labs/ui": minor
---

`MetricTrend` accepts `loading`. The card keeps the height of its loaded state and sets `aria-busy`. Each of `value`, `description` and `delta` that the card names renders as a placeholder, even when its data is not there yet, as in `value={data?.total}`. The label stays readable, and children render as given.

`Skeleton` placeholders stay visible in forced-colors mode.
