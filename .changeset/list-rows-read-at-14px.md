---
"@mizen-labs/ui": minor
---

`ActivityFeed`, `List` and `OverflowList` now set their text at the 14px body tier (14px on a 20px line) instead of 16px on 24px. Activity summaries, comment details and plain list rows get smaller; times and descriptions were 14px already. A row title in a `Text` keeps the size of that `Text`: use `<Text size="ui">` to match.
